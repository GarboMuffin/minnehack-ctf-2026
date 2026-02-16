import fs from 'node:fs';
import path from 'node:path';
import readline from 'node:readline/promises';
import child_process from 'node:child_process';
import sodium from 'libsodium-wrappers';

const TOKEN = process.env.GH_TOKEN;
const HEADERS = {
    Accept: 'application/vnd.github+json',
    Authorization: `Bearer ${TOKEN}`,
};

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

const templateDir = path.join(import.meta.dirname, 'repo');
const workingRepoDir = path.join(import.meta.dirname, 'working-repo');
const reposTxtFile = path.join(import.meta.dirname, 'repos.txt');
const deployKeysTxtFile = path.join(import.meta.dirname, 'deploy_keys.txt');
const tempPrivateKeyFile = path.join(import.meta.dirname, 'pushbot_key_temp');
const tempPublicKeyFile = path.join(import.meta.dirname, 'pushbot_key_temp.pub');

const flag1 = fs.readFileSync(path.join(import.meta.dirname, 'flag1'), 'utf8').trim();
const flag2 = fs.readFileSync(path.join(import.meta.dirname, 'flag2'), 'utf8').trim();

const WORDS = fs.readFileSync(path.join(import.meta.dirname, 'eff_large_wordlist.txt'), 'utf-8')
    .trim()
    .split('\n')
    .map(i => i.split('\t')[1]);

const randomWord = () => WORDS[Math.floor(WORDS.length * Math.random())];

const generateRepoName = async () => {
    while (true) {
        const maybe = `${randomWord()}-${randomWord()}-${randomWord()}`;
        const answer = await rl.question(`Is this a good name: ${maybe} (y/N) `);
        if (answer.toLowerCase().startsWith('y')) {
            return maybe;
        }
    }
};

const exec = (cmd) => {
    console.log(`+ ${cmd}`);
    child_process.execSync(cmd, {cwd: workingRepoDir});
};

const createGitHubRepo = async (owner, repo, description) => {
    console.log(`Creating repo ${owner}/${repo} (${description})`);
    const res = await fetch(`https://api.github.com/orgs/${owner}/repos`, {
        method: 'POST',
        headers: HEADERS,
        body: JSON.stringify({
            name: repo,
            description,
            private: true,
            has_issues: true,
            has_projects: false,
            has_wiki: false,
        })
    });

    if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
    }
};

const createLabel = async (owner, repo, label, color, description) => {
    console.log(`Creating label ${label} (${description}) in ${owner}/${repo}`);
    const res = await fetch(`https://api.github.com/repos/${owner}/${repo}/labels`, {
        method: 'POST',
        headers: HEADERS,
        body: JSON.stringify({
            name: label,
            color,
            description
        })
    });

    if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
    }
};

const getRepoPublicKey = async (owner, repo) => {
    const res = await fetch(`https://api.github.com/repos/${owner}/${repo}/actions/secrets/public-key`, {
        method: 'GET',
        headers: HEADERS
    });
    if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
    }
    return await res.json();
};

const encrypt = async (keyBase64, secretPlaintext) => {
    await sodium.ready;
    const keyBinary = sodium.from_base64(keyBase64, sodium.base64_variants.ORIGINAL);
    const secretBinary = sodium.from_string(secretPlaintext);
    const encryptedBytes = sodium.crypto_box_seal(secretBinary, keyBinary)
    const encryptedBase64 = sodium.to_base64(encryptedBytes, sodium.base64_variants.ORIGINAL)
    return encryptedBase64;
};

const createSecret = async (owner, repo, secretName, secretValue) => {
    console.log(`Creating secret ${secretName}=${secretValue} in ${owner}/${repo}`);
    const key = await getRepoPublicKey(owner, repo);
    const encryptedSecretBase64 = await encrypt(key.key, secretValue);

    const res = await fetch(`https://api.github.com/repos/${owner}/${repo}/actions/secrets/${secretName}`, {
        method: 'PUT',
        headers: HEADERS,
        body: JSON.stringify({
            encrypted_value: encryptedSecretBase64,
            key_id: key.key_id
        })
    });

    if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
    }
};

const generateKey = async () => {
    console.log(`Generating ssh key pair`);

    fs.rmSync(tempPublicKeyFile, { force: true });
    fs.rmSync(tempPrivateKeyFile, { force: true });

    // yeah yeah it's not safe whatever it's ok
    const cmd = `ssh-keygen -t ed25519 -C pushbot-generated-key -f ${tempPrivateKeyFile} -N ""`;
    console.log(`+ ${cmd}`);
    child_process.execSync(cmd);

    const publicKey = fs.readFileSync(tempPublicKeyFile, 'utf-8').trim();
    const privateKey = fs.readFileSync(tempPrivateKeyFile, 'utf-8').trim();

    fs.rmSync(tempPublicKeyFile, { force: true });
    fs.rmSync(tempPrivateKeyFile, { force: true });

    return [publicKey, privateKey];
};

const addDeployKey = async (owner, repo, publicKey) => {
    console.log(`Adding deploy key to ${owner}/${repo} (${publicKey})`);
    const res = await fetch(`https://api.github.com/repos/${owner}/${repo}/keys`, {
        method: 'POST',
        headers: HEADERS,
        body: JSON.stringify({
            title: 'Pushbot',
            key: publicKey,
            read_only: false
        })
    });
    if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
    }
};

const run = async () => {
    const owner = 'MinneHackCTF2026';
    const repo = await generateRepoName();
    const description = ':banana: :electron: Black-box auditing framework for Electron apps.';

    await createGitHubRepo(owner, repo, description);

    const [publicKey, privateKey] = await generateKey();
    await addDeployKey(owner, repo, publicKey);

    await createLabel(owner, repo, 'injector', 'f84e4b', 'Related to the injector');
    await createLabel(owner, repo, 'instrumentation', '8bafe8', 'Related to instrumentation');
    await createLabel(owner, repo, 'other', '11ad77', 'Related to some other component');

    await createSecret(owner, repo, 'FLAG_1', flag1);
    await createSecret(owner, repo, 'FLAG_2', flag2);

    fs.rmSync(workingRepoDir, { recursive: true, force: true });
    fs.cpSync(templateDir, workingRepoDir, { recursive: true });

    console.log(`Initializing repository`);
    exec(`git init -b main`);
    exec(`git stage .`);
    exec(`git commit -m "Initial commit"`);
    exec(`git remote add origin git@github.com:${owner}/${repo}`);
    exec(`git push --set-upstream origin main --force`);

    fs.appendFileSync(reposTxtFile, `${owner}/${repo}\n`);
    fs.appendFileSync(deployKeysTxtFile, `${owner}/${repo} ${btoa(privateKey)}\n`);

    rl.close();
};

run()
    .catch(err => {
        console.error(err);
        process.exit(1);
    });
