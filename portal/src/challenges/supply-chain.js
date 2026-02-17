import { Category, staticFlag } from "../challenges.js";
import { app, HOUR, jsonParser, rateLimiter, requireAuth } from '../server.js';
import * as Database from '../database.js';
import * as SCDB from './supply-chain-db.js';

if (!SCDB.getApiToken()) {
    // INSERT INTO meta (meta_id, meta_data) VALUES ('github_api_token', 'github_pat_...')
    console.error('No GitHub API token - GitHub challenges will not work');
}

const c = new Category({
    name: 'Supply Chain Attack',
    description: ``
});

/**
 * 
 * @param {number} teamId
 * @returns {{owner_name: string; repo_name: string;}|null}
 */
const getOrAssignRepo = (teamId) => {
    const existing = SCDB.getRepoForTeam(teamId);
    if (existing) {
        return existing;
    }
    const unclaimed = SCDB.getUnclaimedRepo();
    if (unclaimed) {
        SCDB.setRepoForTeam(unclaimed.owner_name, unclaimed.repo_name, teamId);
        return unclaimed;
    }
    throw new Error('Out of GitHub repositories');
};

const GITHUB_FORM = `
<form class="flag-form" id="github-form">
    <input type="text" id="github-username" required maxlength="39" pattern="[a-zA-Z0-9\\-]+" placeholder="Username on github.com">
    <button id="github-button">Send invite</button>
</form>
<script>
    const githubForm = document.getElementById('github-form');
    const githubUsername = document.getElementById('github-username');
    const githubButton = document.getElementById('github-button');
    githubForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        try {
            githubButton.disabled = true;
            githubUsername.disabled = true;

            const res = await fetch('/api/github/invite', {
                method: 'PUT',
                headers: {
                    'content-type': 'application/json',
                },
                body: JSON.stringify({
                    githubUsername: githubUsername.value
                })
            });
            if (!res.ok) {
                throw new Error(await res.text());
            }

            const json = await res.json();
            document.getElementById("github-link").click();
        } catch (e) {
            console.error(e);
            alert(e);
            githubUsername.disabled = false;
            githubButton.disabled = false;
        }
    });
</script>
`;

app.put('/api/github/invite', rateLimiter(HOUR, 5), requireAuth, jsonParser, async (req, res) => {
    const userId = req.session.userId;
    const teamId = Database.getUserTeamId(userId);
    if (!teamId) {
        res.status(400).send('Not in a team');
        return;
    }

    const repo = getOrAssignRepo(teamId);

    const githubUsername = req.body.githubUsername;
    if (typeof githubUsername !== 'string' || githubUsername.length < 1 || githubUsername.length > 39 || !/^[a-zA-Z0-9-]+$/.test(githubUsername)) {
        res.status(400).send('Invalid username');
        return;
    }

    const apiToken = SCDB.getApiToken();
    if (!apiToken) {
        res.status(500).send('GitHub API token misconfigured');
        return;
    }

    const githubRes = await fetch(`https://api.github.com/repos/${repo.owner_name}/${repo.repo_name}/collaborators/${githubUsername}`, {
        method: 'PUT',
        headers: {
            Accept: 'application/vnd.github+json',
            Authorization: `Bearer ${apiToken}`,
            'X-GitHub-Api-Version': '2022-11-28'
        },
        body: JSON.stringify({
            permission: 'pull'
        })
    });

    if (!githubRes.ok) {
        res.status(500).send(`Error ${githubRes.status} talking to GitHub API`);
        return;
    }

    res.json({});
});

c.add({
    id: 'github-actions-1',
    name: 'GitHub Actions 1',
    next: 'github-actions-2',
    description: (teamId, userId) => {
        const repo = getOrAssignRepo(teamId);
        return `
        <p>This challenge involves <a href="https://github.com/features/actions">GitHub Actions</a>, a very popular workflow automation framework.</p>
        <p>A private repository has been generated for each team so that you can't just read everyone else's solutions. Enter your GitHub username in this box to receive an invite. You need to use a regular github.com account, not a github.umn.edu account.</p>
        ${GITHUB_FORM}
        <p>Once you've invited yourself, open your team's repository here: <a href="https://github.com/${repo.owner_name}/${repo.repo_name}/" target="_blank" id="github-link">${repo.owner_name}/${repo.repo_name}</a></p>
        
        <p>
            Within this repository's GitHub Actions settings is a <a href="https://docs.github.com/en/actions/how-tos/write-workflows/choose-what-workflows-do/use-secrets">secret</a> called <code>FLAG_1</code>.
            Find a way to exfiltrate the key using your read-only access.
        </p>
        `;
    },
    value: 50,
    check: staticFlag('flag{4fb26232-4e23-4745-a105-73b885ee6bf0}')
});

c.add({
    id: 'github-actions-2',
    name: 'GitHub Actions 2',
    requires: ['github-actions-1'],
    description: (teamId, userId) => {
        const repo = getOrAssignRepo(teamId);
        return `
        <h1>This one is broken and fixing it would be kind of annoying so :(</h1>
        <p>Part 2 takes place in the <a href="https://github.com/${repo.owner_name}/${repo.repo_name}/" target="_blank" id="github-link">same repository</a> as part 1. <a href="/challenges/github-actions-1">Go back</a> to part 1 if you still need to be invited.</p>
        <p>
            As you may have guessed, there is a second secret inside the GitHub Actions called <code>FLAG_2</code>.
            Exfiltrate it.
        </p>
        `;
    },
    value: 100,
    check: staticFlag('flag{28c7c61b-c007-47a1-89d2-70e783a59896}')
});
