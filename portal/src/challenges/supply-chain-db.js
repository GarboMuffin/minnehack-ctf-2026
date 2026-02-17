import * as Database from '../database.js';

const SECRET_ID = 'github_api_token';

Database.db.exec(`
CREATE TABLE IF NOT EXISTS mhctf2026_github_repos (
    owner_name TEXT NOT NULL,
    repo_name TEXT NOT NULL,
    team_id INTEGER,
    FOREIGN KEY (team_id) REFERENCES teams(team_id) ON DELETE CASCADE,
    PRIMARY KEY (owner_name, repo_name)
) STRICT;
`);

/**
 * @returns {string|undefined}
 */
export const getApiToken = () => Database.getMeta(SECRET_ID);

/**
 * @param {string} token
 * @returns {void}
 */
export const setApiToken = (token) => Database.setMeta(SECRET_ID, token);

const _addRepo = Database.db.prepare(`
    INSERT INTO mhctf2026_github_repos (owner_name, repo_name) VALUES (@owner, @repo);
`);
/**
 * @param {string} owner
 * @param {string} repo
 * @returns {void}
 */
export const addRepo = (owner, repo) => _addRepo.run({ owner, repo });

const _getUnclaimedRepo = Database.db.prepare(`
    SELECT owner_name, repo_name FROM mhctf2026_github_repos WHERE team_id IS NULL;
`);
/**
 * @returns {{owner_name: string; repo_name: string;}|undefined}
 */
export const getUnclaimedRepo = () => _getUnclaimedRepo.get();

const _setRepoTeam = Database.db.prepare(`
    UPDATE mhctf2026_github_repos SET team_id = @team WHERE owner_name = @owner AND repo_name = @repo;
`);
/**
 * @param {string} owner
 * @param {string} repo
 * @param {number} team
 * @returns {void}
 */
export const setRepoForTeam = (owner, repo, team) => void _setRepoTeam.run({ owner, repo, team });

const _getTeamRepo = Database.db.prepare(`
    SELECT owner_name, repo_name FROM mhctf2026_github_repos WHERE team_id = ?;
`);
/**
 * @param {number} team
 * @returns {{owner_name: string; repo_name: string;}|undefined}
 */
export const getRepoForTeam = (team) => _getTeamRepo.get(team);

const _getAllRepos = Database.db.prepare(`
    SELECT owner_name, repo_name, team_id FROM mhctf2026_github_repos;
`);
/**
 * @returns {Array<{rowid: number, owner_name: string; repo_name: string; team_id: number|null}>}
 */
export const getAllRepos = () => _getAllRepos.all();

const _deleteRepo = Database.db.prepare(`
    DELETE FROM mhctf2026_github_repos WHERE owner_name = @owner AND repo_name = @repo;
`);
/**
 * @param {string} owner
 * @param {string} repo
 * @returns {void}
 */
export const deleteRepo = (owner, repo) => void _deleteRepo.run({ owner, repo });
