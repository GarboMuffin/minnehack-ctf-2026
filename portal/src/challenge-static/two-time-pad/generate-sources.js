import fsPromises from 'node:fs/promises';
import path from 'node:path';
import nodeCrypto from 'node:crypto';

/**
 * @returns {Promise<string>}
 */
const getMostRecentRelease = async () => {
    const url = 'https://api.github.com/repos/TurboWarp/desktop/tags';
    const tagsResponse = await fetch(url);
    if (!tagsResponse.ok) {
        throw new Error(`HTTP ${tagsResponse.status} fetching ${url}`);
    }
    const tagsJSON = await tagsResponse.json();
    const mostRecentStable = tagsJSON.find(i => /^v\d+\.\d+\.\d+$/.test(i.name));
    return mostRecentStable.commit.sha;
};

/**
 * @param {string} desktopCommit
 * @returns {Promise<void>}
 */
const updateSourceCommit = async (desktopCommit) => {
    const manifestName = 'org.turbowarp.TurboWarp.yaml';
    const manifestPath = path.join(import.meta.dirname, manifestName);
    const oldContent = await fsPromises.readFile(manifestPath, 'utf-8');

    // Don't want to bring in an entire YAML parser, so we'll just hack this with
    // a regex and hope for the best.
    const newCommitLine = `commit: ${desktopCommit}`;
    const newContent = oldContent.replace(/commit: [0-9a-f]{40}/, newCommitLine);
    if (!newContent.includes(newCommitLine)) {
        throw new Error('Failed to update source commit');
    }

    await fsPromises.writeFile(manifestPath, newContent);
    console.log(`${manifestName}: updated to ${desktopCommit}`);
};

/**
 * @param {url} url Must be an immutable URL, ie. it includes a hash of some sort.
 * @returns {Promise<Response>}
 */
const fetchWithCache = async (url) => {
    const urlHash = nodeCrypto.createHash('sha256')
        .update(url)
        .digest('hex');

    const cacheDir = path.join(import.meta.dirname, 'cache');
    const cachePath = path.join(cacheDir, urlHash);

    let response;
    try {
        const data = await fsPromises.readFile(cachePath);
        response = new Response(data);
    } catch (e) {
        console.log(`Fetching: ${url}`);

        const res = await fetch(url);
        if (!res.ok) {
            throw new Error(`HTTP ${res.status} fetching ${url}`);
        }

        // Clone response to return
        response = res.clone();

        // Use the original response to store it in the cache
        const data = new Uint8Array(await res.arrayBuffer());

        // Write then rename so this is slightly more atomic
        await fsPromises.mkdir(cacheDir, {
            recursive: true
        });
        await fsPromises.writeFile(`${cachePath}.temp`, data);
        await fsPromises.rename(`${cachePath}.temp`, cachePath);
    }

    return response;
};

const getRootPackageLock = async (desktopCommit) => {
    const response = await fetchWithCache(`https://raw.githubusercontent.com/TurboWarp/desktop/${desktopCommit}/package-lock.json`);
    return response.json();
};

const generateElectron = async (desktopCommit) => {
    const packageLock = await getRootPackageLock(desktopCommit);
    const version = packageLock.packages['node_modules/electron'].version;

    const sumsRequest = await fetch(`https://github.com/electron/electron/releases/download/v${version}/SHASUMS256.txt`);
    const sumsText = await sumsRequest.text();
    const sums = {};
    for (const match of sumsText.matchAll(/^([a-f0-9]{64}) \*?(.+)$/gm)) {
        sums[match[2]] = match[1];
    }

    const x64 = `electron-v${version}-linux-x64.zip`;
    const arm64 = `electron-v${version}-linux-arm64.zip`;
    // While Electron does support 32 bit ARM, the freedesktop SDK does not, so we cannot
    // support it in the flatpak.

    return [
        {
            type: 'file',
            url: `https://github.com/electron/electron/releases/download/v${version}/${x64}`,
            sha256: sums[x64],
            dest: 'flatpak-electron',
            'dest-filename': x64,
            'only-arches': ['x86_64']
        },
        {
            type: 'file',
            url: `https://github.com/electron/electron/releases/download/v${version}/${arm64}`,
            sha256: sums[arm64],
            dest: 'flatpak-electron',
            'dest-filename': arm64,
            'only-arches': ['aarch64']
        }
    ];
};

const generateNodeDependencies = async (desktopCommit) => {
    // Here we use "npm" to refer to any package repository that serves prebuilt tarballs.

    /**
     * Indexed by the SHA-512 of the package's tarball.
     * @type {Record<string, {name: string; url: string; destinations: string[];}>}
     */
    const npmPackages = {};

    /**
     * Indexed by repository's normalized git URL with commit hash separated by #.
     * @type {Record<string, {name: string; url: string; commit: string; destinations: string[];}>}
     */
    const gitPackages = {};

    const visitNpmPackage = async (packagePath, pkg) => {
        if (!pkg.integrity.startsWith('sha512-')) {
            throw new Error(`Unknown integrity algorithm: ${pkg.integrity}`);
        }

        const sha512 = Buffer.from(pkg.integrity.substring(7), 'base64').toString('hex');
        if (!Object.hasOwn(npmPackages, sha512)) {
            npmPackages[sha512] = {
                name: path.basename(packagePath),
                // These all have the same SHA-512. They should also have the same npmjs.com
                // URL but it doesn't matter since it's the same content.
                url: pkg.resolved,
                destinations: []
            };
        }
        npmPackages[sha512].destinations.push(packagePath);
    };

    const visitGitPackage = async (packagePath, pkg) => {
        const match = pkg.resolved.match(/^git\+ssh:\/\/git@github\.com\/([\w\d-]+)\/([\w\d-]+)\.git#([0-9a-f]{40})$/);
        if (!match) {
            throw new Error(`Unknown git URL: ${pkg.resolved}`);
        }

        const owner = match[1];
        const repository = match[2];
        const commit = match[3];

        if (owner === 'electron' && repository === 'node-gyp') {
            // Ignore this repository. We don't need it and the package-lock.json isn't
            // where we expect it to be.
            return;
        }

        const normalizedGitURL = `https://github.com/${owner}/${repository}.git#${commit}`;
        if (!Object.hasOwn(gitPackages, normalizedGitURL)) {
            // For git dependencies, npm seems to do a recursive `npm install` instead of tracking
            // its dependencies in the parent's package-lock.json, so we also have to recurse.
            const packageLockResponse = await fetchWithCache(`https://raw.githubusercontent.com/${owner}/${repository}/${commit}/package-lock.json`)
            const packageLockJSON = await packageLockResponse.json();
            await visitPackageLock({
                packageLock: packageLockJSON,
                // This is a sub-dependency. Parent package already has build tooling so we
                // don't need the child's build tools.
                devOnly: true,
                prefix: packagePath
            });

            gitPackages[normalizedGitURL] = {
                name: repository,
                destinations: []
            };
        }
        gitPackages[normalizedGitURL].destinations.push(packagePath);
    };

    /**
     *
     * @param {{packageLock: object; devOnly: boolean; prefix: string;}} context
     * @returns
     */
    const visitPackageLock = async (context) => {
        for (const [pkgPath, pkg] of Object.entries(context.packageLock.packages)) {
            if (pkgPath === '') {
                // This is the package-lock.json's reference to itself, basically, so
                // we can ignore it, since the package itself has already been downloaded.
                continue;
            }

            if (context.devOnly && pkg.dev) {
                continue;
            }

            if (!pkg.resolved) {
                // Not sure what to do about these, but ignoring them seems to work out...
                continue;
            }

            const prefixedPath = path.join(context.prefix, pkgPath);
            if (pkg.resolved.startsWith('https://')) {
                await visitNpmPackage(prefixedPath, pkg);
            } else if (pkg.resolved.startsWith('git+ssh://')) {
                await visitGitPackage(prefixedPath, pkg);
            } else {
                throw new Error(`Unknown resolved: ${pkg.resolved}`);
            }
        }
    };

    await visitPackageLock({
        packageLock: await getRootPackageLock(desktopCommit),
        devOnly: false,
        prefix: ''
    });

    const sources = [];
    const commands = [
        // Echo commands as they are executed so there is some indication of progress.
        'set -x'
    ];

    for (const [sha512, metadata] of Object.entries(npmPackages)) {
        const name = `${metadata.name}-${sha512}`;
        sources.push({
            type: 'file',
            url: metadata.url,
            sha512,
            dest: 'flatpak-node/npm',
            'dest-filename': name
        });

        // TODO: this could be faster by extracting once then copying instead of extracting
        // for each destination
        for (const destination of metadata.destinations) {
            commands.push(`mkdir -p "${destination}"`);
            // --warning=no-unknown-keyword removes some expected warnings from npm putting custom
            // metadata into the tarballs.
            // --strip-components=1 because every package has an inner `package` directory.
            commands.push(`tar -xzf "flatpak-node/npm/${name}" -C "${destination}" --warning=no-unknown-keyword --strip-components=1`);
        }
    }

    for (const [normalizedURL, metadata] of Object.entries(gitPackages)) {
        const [cloneURL, commit] = normalizedURL.split('#');
        const dest = `flatpak-node/git/${metadata.name}-${commit}`;
        sources.push({
            type: 'git',
            url: cloneURL,
            commit: commit,
            dest
        });

        for (const destination of metadata.destinations) {
            commands.push(`mkdir -p "${destination}"`);
            commands.push(`cp -a "${dest}"/* "${destination}"`);
        }
    }

    // One big command script to run a lot faster than a bunch of tiny shell sources.
    sources.push({
        type: 'script',
        commands,
        dest: 'flatpak-node',
        'dest-filename': 'finish.sh'
    });

    return sources;
};

const generateLibrary = async (desktopCommit) => {
    const packageLock = await getRootPackageLock(desktopCommit);
    const guiResolved = packageLock.packages['node_modules/scratch-gui'].resolved;
    const guiCommit = guiResolved.split('#')[1];

    const fetchLibrary = async (name) => {
        const response = await fetchWithCache(`https://raw.githubusercontent.com/TurboWarp/scratch-gui/${guiCommit}/src/lib/libraries/${name}.json`)
        return response.json();
    };

    const [
        costumes,
        backdrops,
        sounds,
        sprites
    ] = await Promise.all([
        fetchLibrary('costumes'),
        fetchLibrary('backdrops'),
        fetchLibrary('sounds'),
        fetchLibrary('sprites'),
    ]);

    const md5exts = new Set();
    for (const asset of [...costumes, ...backdrops, ...sounds]) {
        md5exts.add(asset.md5ext);
    }
    for (const sprite of [...sprites]) {
        for (const asset of [...sprite.costumes, ...sprite.sounds]) {
            md5exts.add(asset.md5ext);
        }
    }

    const sources = [];
    for (const md5ext of [...md5exts].sort()) {
        const match = md5ext.match(/^([0-9a-f]{32})\.([\w\d]+)$/);
        const expectedMd5 = match[1];

        const url = `https://assets.scratch.mit.edu/${md5ext}`;
        const response = await fetchWithCache(url);
        const data = new Uint8Array(await response.arrayBuffer());

        const realMd5 = nodeCrypto.createHash('md5').update(data).digest('hex');
        const sha256 = nodeCrypto.createHash('sha256').update(data).digest('hex');

        if (realMd5 !== expectedMd5) {
            throw new Error(`Hash mismatch: expected ${expectedMd5} got ${realMd5}`);
        }

        sources.push({
            type: 'file',
            url,
            sha256,
            dest: 'flatpak-uncompressed-library-files',
            'dest-filename': md5ext
        });
    }

    return sources;
};

const generatePackager = async (desktopCommit) => {
    const response = await fetchWithCache(`https://raw.githubusercontent.com/TurboWarp/desktop/${desktopCommit}/scripts/packager.json`);
    const data = await response.json();
    return [
        {
            type: 'file',
            url: data.src,
            sha256: data.sha256,
            dest: 'src-renderer/packager',
            'dest-filename': 'standalone.html'
        }
    ];
};

const generateMicrobitHex = async () => {
    // TODO: currently hardcoded in scratch-gui code, not in a file meant to be machine
    // readable externally, so this is being hardcoded.
    return [
        {
            type: 'file',
            url: 'https://packagerdata.turbowarp.org/scratch-microbit-1.2.0.hex.zip',
            sha256: 'dfd574b709307fe76c44dbb6b0ac8942e7908f4d5c18359fae25fbda3c9f4399',
            dest: 'microbit',
            'dest-filename': 'hex.zip'
        }
    ];
};

const generateExtensions = async (desktopCommit) => {
    const packageLock = await getRootPackageLock(desktopCommit);
    const extensionsPackage = packageLock.packages['node_modules/@turbowarp/extensions'];
    const extensionsCommit = extensionsPackage.resolved.split('#')[1];

    const extensionDependenciesResponse = await fetchWithCache(`https://raw.githubusercontent.com/TurboWarp/extensions/${extensionsCommit}/extension-dependencies.json`);
    const extensionDependencies = await extensionDependenciesResponse.json();
    
    const sources = [];
    for (const [url, {sha256}] of Object.entries(extensionDependencies.dependencies)) {
        sources.push({
            type: 'file',
            url,
            sha256,
            dest: 'node_modules/@turbowarp/extensions/cached-extension-dependencies',
            'dest-filename': sha256
        });
    }
    return sources;
};

const run = async () => {
    const commitHash = process.argv.length >= 3 ? process.argv[2] : await getMostRecentRelease();

    /**
     * @param {string} name
     * @param {unknown[]} data
     * @returns {Promise<void>}
     */
    const save = async (name, data) => {
        console.log(`${name}: ${data.length} sources`);
        await fsPromises.writeFile(path.join(import.meta.dirname, name), JSON.stringify(data, null, 2));
    };

    await updateSourceCommit(commitHash);
    await save('electron-sources.json', await generateElectron(commitHash));
    await save('node-sources.json', await generateNodeDependencies(commitHash));
    await save('library-sources.json', await generateLibrary(commitHash));
    await save('packager-sources.json', await generatePackager(commitHash));
    await save('microbit-sources.json', await generateMicrobitHex());
    await save('extensions-sources.json', await generateExtensions(commitHash));
};

run()
    .catch(err => {
        console.error(err);
        process.exit(1);
    });

/** A bunch of padding to make sure the file is long enough for no particular reason */
/** A bunch of padding to make sure the file is long enough for no particular reason */
/** A bunch of padding to make sure the file is long enough for no particular reason */
/** A bunch of padding to make sure the file is long enough for no particular reason */
/** A bunch of padding to make sure the file is long enough for no particular reason */
/** A bunch of padding to make sure the file is long enough for no particular reason */
/** A bunch of padding to make sure the file is long enough for no particular reason */
/** A bunch of padding to make sure the file is long enough for no particular reason */
/** A bunch of padding to make sure the file is long enough for no particular reason */
/** A bunch of padding to make sure the file is long enough for no particular reason */
/** A bunch of padding to make sure the file is long enough for no particular reason */
/** A bunch of padding to make sure the file is long enough for no particular reason */
/** A bunch of padding to make sure the file is long enough for no particular reason */
/** A bunch of padding to make sure the file is long enough for no particular reason */
/** A bunch of padding to make sure the file is long enough for no particular reason */
/** A bunch of padding to make sure the file is long enough for no particular reason */
/** A bunch of padding to make sure the file is long enough for no particular reason */
/** A bunch of padding to make sure the file is long enough for no particular reason */
/** A bunch of padding to make sure the file is long enough for no particular reason */
/** A bunch of padding to make sure the file is long enough for no particular reason */
/** A bunch of padding to make sure the file is long enough for no particular reason */
/** A bunch of padding to make sure the file is long enough for no particular reason */
/** A bunch of padding to make sure the file is long enough for no particular reason */
/** A bunch of padding to make sure the file is long enough for no particular reason */
/** A bunch of padding to make sure the file is long enough for no particular reason */
/** A bunch of padding to make sure the file is long enough for no particular reason */
/** A bunch of padding to make sure the file is long enough for no particular reason */
/** A bunch of padding to make sure the file is long enough for no particular reason */
/** A bunch of padding to make sure the file is long enough for no particular reason */
/** A bunch of padding to make sure the file is long enough for no particular reason */
/** A bunch of padding to make sure the file is long enough for no particular reason */
/** A bunch of padding to make sure the file is long enough for no particular reason */
/** A bunch of padding to make sure the file is long enough for no particular reason */
/** A bunch of padding to make sure the file is long enough for no particular reason */
/** A bunch of padding to make sure the file is long enough for no particular reason */
/** A bunch of padding to make sure the file is long enough for no particular reason */
/** A bunch of padding to make sure the file is long enough for no particular reason */
/** A bunch of padding to make sure the file is long enough for no particular reason */
/** A bunch of padding to make sure the file is long enough for no particular reason */
/** A bunch of padding to make sure the file is long enough for no particular reason */
