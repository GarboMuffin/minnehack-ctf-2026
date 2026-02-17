import readline from 'readline/promises';
import * as SCDB from './supply-chain-db.js';

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

const manageToken = async () => {
    const existingToken = SCDB.getApiToken();
    console.log(`Current GitHub token: ${existingToken ? existingToken.substring(0, 20) + '...' : 'none'}`);

    const newToken = await rl.question('New GitHub token? (blank = no change) ');
    if (newToken) {
        SCDB.setApiToken(newToken);
        console.log('Updated token');
    }
};

const printExistingRepos = () => {
    const existingRepos = SCDB.getAllRepos();
    console.log(`# of existing repos: ${existingRepos.length}`);
    for (const repo of existingRepos) {
        console.log(`${repo.owner_name}/${repo.repo_name} - Team: ${repo.team_id}`);
    }
};

const manageRepos = async () => {
    while (true) {
        printExistingRepos();
        const q = await rl.question('Delete one? (enter owner/repo) ');
        if (!q) break;
        const [owner, repo] = q.split('/');
        SCDB.deleteRepo(owner, repo);
    }

    console.log('');

    while (true) {
        const q = await rl.question('New repo? (enter owner/repo) ');
        if (!q) break;
        const [owner, repo] = q.split('/');
        SCDB.addRepo(owner, repo);
    }

    console.log('');
    printExistingRepos();
};

const run = async () => {
    try {
        await manageToken();
        console.log('');
        await manageRepos();
        rl.close();
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
};

run();
