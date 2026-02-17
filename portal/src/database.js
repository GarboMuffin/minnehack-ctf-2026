import sqlite from 'better-sqlite3';

export const db = sqlite(process.env.DATABASE_PATH || 'development.db');
db.exec(`
CREATE TABLE IF NOT EXISTS meta (
    meta_id TEXT PRIMARY KEY,
    meta_data TEXT NOT NULL
) STRICT;

CREATE TABLE IF NOT EXISTS users (
    user_id INTEGER PRIMARY KEY NOT NULL,
    user_email TEXT UNIQUE NOT NULL,
    user_password_hash TEXT NOT NULL
) STRICT;

CREATE TABLE IF NOT EXISTS teams (
    team_id INTEGER PRIMARY KEY NOT NULL,
    team_name TEXT NOT NULL,
    team_password TEXT UNIQUE NOT NULL,
    team_hidden INTEGER NOT NULL DEFAULT 0
) STRICT;

CREATE TABLE IF NOT EXISTS user_in_team (
    user_id INTEGER PRIMARY KEY NOT NULL,
    team_id INTEGER NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (team_id) REFERENCES teams(team_id) ON DELETE CASCADE
) STRICT;

CREATE TABLE IF NOT EXISTS team_completed_challenges (
    team_id INTEGER NOT NULL,
    challenge_id TEXT NOT NULL,
    at INTEGER NOT NULL,
    FOREIGN KEY (team_id) REFERENCES teams(team_id) ON DELETE CASCADE,
    PRIMARY KEY (team_id, challenge_id)
) STRICT;

CREATE TABLE IF NOT EXISTS team_challenge_guesses (
    team_id INTEGER NOT NULL,
    user_id INTEGER NOT NULL,
    challenge_id TEXT NOT NULL,
    guess TEXT NOT NULL,
    at INTEGER NOT NULL,
    FOREIGN KEY (team_id) REFERENCES teams(team_id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
) STRICT;

CREATE TABLE IF NOT EXISTS team_unlocked_hints (
    team_id INTEGER NOT NULL,
    challenge_id TEXT NOT NULL,
    hint_id TEXT NOT NULL,
    at INTEGER NOT NULL,
    FOREIGN KEY (team_id) REFERENCES teams(team_id) ON DELETE CASCADE,
    PRIMARY KEY (team_id, challenge_id, hint_id)
) STRICT;

CREATE TABLE IF NOT EXISTS team_scoring_events (
    team_id INTEGER NOT NULL,
    user_id INTEGER NOT NULL,
    challenge_id TEXT NOT NULL,
    hint_id TEXT,
    score_reason TEXT NOT NULL,
    score_delta INTEGER NOT NULL,
    at INTEGER NOT NULL,
    FOREIGN KEY (team_id) REFERENCES teams(team_id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
) STRICT;
`);

const _getMeta = db.prepare(`SELECT meta_data FROM meta WHERE meta_id = ?`);
/** @returns {string|undefined} */
export const getMeta = (metaId) => _getMeta.get(metaId)?.meta_data;

const _setMeta = db.prepare(`
INSERT INTO meta (meta_id, meta_data)
VALUES (@metaId, @metaData)
ON CONFLICT (meta_id) DO UPDATE SET meta_data = excluded.meta_data
`);
/** @returns {void} */
export const setMeta = (metaId, metaData) => void _setMeta.run({ metaId, metaData });

const _createUser = db.prepare(`INSERT INTO USERS (user_email, user_password_hash) VALUES (@email, @passwordHash)`);
/** @returns {number} */
export const createUser = (email, passwordHash) => _createUser.run({email, passwordHash}).lastInsertRowid;

const _getUserLoginInfo = db.prepare(`SELECT user_id, user_password_hash FROM users WHERE user_email = ?`);
/** @returns {{user_id: number, user_password_hash: string}} */
export const getUserLoginInfo = (email) => _getUserLoginInfo.get(email);

const _getUserTeamId = db.prepare(`SELECT team_id FROM user_in_team WHERE user_id = ?`);
/** @returns {number|undefined} */
export const getUserTeamId = (userId) => _getUserTeamId.get(userId)?.team_id;

const _createTeam = db.prepare(`INSERT INTO teams (team_name, team_password) VALUES (@name, @password)`);
/** @returns {number} */
export const createTeam = (name, password) => _createTeam.run({name, password}).lastInsertRowid;

const _addUserToTeam = db.prepare(`INSERT INTO user_in_team (user_id, team_id) VALUES (@userId, @teamId)`);
/** @returns {void} */
export const addUserToTeam = (userId, teamId) => _addUserToTeam.run({userId, teamId});

/** @returns {number|undefined} */
const _getTeamByPassword = db.prepare(`SELECT team_id FROM teams WHERE team_password = ?`);
export const getTeamByPassword = (password) => _getTeamByPassword.get(password)?.team_id;

const _getTeamName = db.prepare(`SELECT team_name FROM teams WHERE team_id = ?`);
/** @returns {string|undefined} */
export const getTeamName = (teamId) => _getTeamName.get(teamId)?.team_name;

const _getPeopleInTeam = db.prepare(`
SELECT users.user_id, users.user_email
FROM users
INNER JOIN user_in_team ON user_in_team.user_id = users.user_id
WHERE user_in_team.team_id = ?
`);
/** @returns {Array<{user_id: number, user_email: string}>} */
export const getPeopleInTeam = (teamId) => _getPeopleInTeam.all(teamId);

const _updateTeamPassword = db.prepare(`UPDATE teams SET team_password = @password WHERE team_id = @teamId`);
/** @returns {void} */
export const updateTeamPassword = (teamId, password) => void _updateTeamPassword.run({teamId, password});

const _leaveTeam = db.prepare(`DELETE FROM user_in_team WHERE user_id = ?`);
/** @returns {void} */
export const leaveTeam = (userId) => void _leaveTeam.run(userId);

const _renameTeam = db.prepare(`UPDATE teams SET team_name = @name WHERE team_id = @teamId`);
/** @returns {void} */
export const renameTeam = (teamId, name) => void _renameTeam.run({ teamId, name });

const _setTeamHidden = db.prepare(`UPDATE teams SET team_hidden = @hidden WHERE team_id = @teamId`);
/** @returns {void} */
export const setTeamHidden = (teamId, hidden) => void _setTeamHidden.run({ teamId, hidden: hidden ? 1 : 0 });

const _hasCompletedChallenge = db.prepare(`SELECT 1 FROM team_completed_challenges WHERE team_id = @teamId AND challenge_id = @challengeId`);
/** @returns {boolean} */
export const hasCompletedChallenge = (teamId, challengeId) => !!_hasCompletedChallenge.get({teamId, challengeId});

const _completeChallenge = db.prepare(`INSERT INTO team_completed_challenges (team_id, challenge_id, at) VALUES (@teamId, @challengeId, @at)`);
/** @returns {void} */
export const completeChallenge = (teamId, userId, challengeId) => void _completeChallenge.run({teamId, challengeId, at: Date.now()});

const _addScoringEvent = db.prepare(`INSERT INTO team_scoring_events (team_id, user_id, challenge_id, hint_id, score_reason, score_delta, at) VALUES (@teamId, @userId, @challengeId, @hintId, @scoreReason, @scoreDelta, @at)`);
/** @returns {void} */
export const addScoringEvent = (teamId, userId, challengeId, scoreDelta, scoreReason, hintId) => void _addScoringEvent.run({teamId, userId, challengeId, hintId, scoreDelta, scoreReason, at: Date.now()});

const _addGuess = db.prepare(`INSERT INTO team_challenge_guesses (team_id, user_id, challenge_id, guess, at) VALUES (@teamId, @userId, @challengeId, @guess, @at)`);
/** @returns {void} */
export const addGuess = (teamId, userId, challengeId, guess) => void _addGuess.run({ teamId, userId, challengeId, guess, at: Date.now() });

const _hasUnlockedHint = db.prepare(`SELECT 1 FROM team_unlocked_hints WHERE team_id = @teamId AND challenge_id = @challengeId AND hint_id = @hintId`);
/** @returns {boolean} */
export const hasUnlockedHint = (teamId, challengeId, hintId) => !!_hasUnlockedHint.get({ teamId, challengeId, hintId });

const _unlockHint = db.prepare(`INSERT INTO team_unlocked_hints (team_id, challenge_id, hint_id, at) VALUES (@teamId, @challengeId, @hintId, @at)`);
/** @returns {void} */
export const unlockHint = (teamId, userId, challengeId, hintId) => void _unlockHint.run({ teamId, challengeId, hintId, at: Date.now() });

const _getScoreboardWithPoints = db.prepare(`
SELECT
    e.team_id AS 'team_id',
    (SELECT t.team_name FROM teams t WHERE t.team_id = e.team_id) as 'team_name',
    SUM(e.score_delta) AS 'sum',
    MAX(e.at) AS 'at'
FROM team_scoring_events e
WHERE (SELECT t.team_hidden FROM teams t WHERE t.team_id = e.team_id) = 0
GROUP BY e.team_id
ORDER BY SUM(e.score_delta) DESC, MAX(e.at) ASC`);
const _getScoreboardWithoutPoints = db.prepare(`
SELECT
    t.team_id AS 'team_id',
    t.team_name AS 'team_name'
FROM teams t
WHERE t.team_hidden = 0 AND NOT EXISTS (SELECT 1 FROM team_scoring_events e WHERE e.team_id = t.team_id)
ORDER BY t.rowid`);
/** @returns {Array<{team_id: number; team_name: string; sum: number; at: number|null;}>} */
export const getScoreboard = () => {
    const map = (i) => ({
        team_id: i.team_id,
        team_name: i.team_name
    });
    const withPoints = _getScoreboardWithPoints.all().map(i => ({ ...map(i), sum: i.sum, at: i.at }));
    const withoutPoints = _getScoreboardWithoutPoints.all().map(i => ({ ...map(i), sum: 0, at: null }));
    return [...withPoints, ...withoutPoints];
};

const _getSolves = db.prepare(`
SELECT
    t.team_id as 'team_id',
    t.team_name as 'team_name',
    c.at as 'at'
FROM team_completed_challenges c
INNER JOIN teams t ON c.team_id = t.team_id
WHERE c.challenge_id = ? AND t.team_hidden = 0
ORDER BY c.at ASC
`);
/** @returns {Array<{team_id: number; team_name: string; at: number;}>} */
export const getSolves = (challengeId) => _getSolves.all(challengeId);

const _getTeamScore = db.prepare(`
SELECT COALESCE(SUM(score_delta), 0) as 'score'
FROM team_scoring_events
WHERE team_id = ?
`);
/** @returns {number} */
export const getTeamScore = (teamId) => _getTeamScore.get(teamId)?.score ?? 0;
