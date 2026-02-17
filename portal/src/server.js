import path from 'node:path';
import nodeCrypto from 'node:crypto';
import express from 'express';
import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';
import { Eta } from 'eta';
import * as Database from './database.js';
import * as Auth from './auth.js';
import * as Challenges from './challenges.js';
import { EVENT_NAME, MAX_TEAM_MEMBERS, STATUS, VARIANT } from './config.js';

const isProduction = process.env.NODE_ENV === 'production';

const eta = new Eta({
    views: path.join(import.meta.dirname, 'views'),
    cache: isProduction,
});

const render = (req, res, template, it) => {
    const html = eta.render(template, {
        EVENT_NAME,
        MAX_TEAM_MEMBERS,
        STATUS,
        VARIANT,
        userId: req.session?.userId,
        path: req.path,
        ...it,
    });
    res.type('text/html');
    res.send(html);
};

// rateLimiter constants
export const MINUTE = 60;
export const HOUR = MINUTE * 60;

const deferredInitTasks = [];

/**
 * @param {number} periodSeconds
 * @param {number} maxPerPeriod
 */
export const rateLimiter = (periodSeconds, maxPerPeriod) => {
    /** @type {Map<string, number>} */
    const counts = new Map();

    deferredInitTasks.push(() => {
        const interval = setInterval(() => {
            counts.clear();
        }, periodSeconds * 1000);
        interval.unref();
    });

    return (req, res, next) => {
        // it turns out podman rootless networking makes all the requests look like they come from the same IP so
        // we just disabled this entirely day of
        next();

        // const count = counts.get(req.ip) ?? 0;
        // counts.set(req.ip, count + 1);

        // if (count === maxPerPeriod) {
        //     console.error(`${req.ip} has exceeded rate limit on ${req.method} ${req.path}`);
        // }

        // if (count < maxPerPeriod) {
        //     next();
        //     return;
        // }

        // res.status(429);
        // if (req.path.startsWith('/api/')) {
        //     res.type('text/plain').send('429 Too many requests');
        // } else {
        //     render(req, res, 'error.html', {
        //         error: 'Too many requests'
        //     });
        // }
    };
};

export const app = express();
app.set('x-powered-by', false);
app.set('strict routing', true);
app.set('trust proxy', true); // we always are behind nginx in production
if (isProduction) {
    app.set('env', 'production');
} else {
    app.set('env', 'development');
}

app.use((req, res, next) => {
    if (process.env.NODE_ENV !== 'production') {
        console.log(`${req.ip} ${req.method} ${req.path}`);
    }

    res.header('cache-control', 'no-cache');
    res.header('x-content-type-options', 'nosniff');
    res.header('x-frame-options', 'DENY');
    res.header('content-security-policy', "default-src 'self' 'unsafe-inline'");
    res.header('referrer-policy', 'no-referrer');

    next();
});

app.use(rateLimiter(HOUR, 1000000));

app.use(cookieParser());

const ACCESS_KEY_ID = 'access_key';
const getAccessKey = () => Database.getMeta(ACCESS_KEY_ID);
const generateAccessKey = () => {
    const key = nodeCrypto.randomUUID();
    Database.setMeta(ACCESS_KEY_ID, key);
    return key;
};
console.log(`Access cookie: ctf-access-key=${getAccessKey() || generateAccessKey()}`);
if (STATUS === 'before') {
    app.use((req, res, next) => {
        const correctBuffer = Buffer.from(getAccessKey() || generateAccessKey());
        const providedKey = req.cookies['ctf-access-key'];
        const providedBuffer = Buffer.from(typeof providedKey === 'string' ? providedKey : '');
        if (providedBuffer.length === correctBuffer.length && nodeCrypto.timingSafeEqual(providedBuffer, correctBuffer)) {
            next();
            return;
        }
        res.status(401);
        render(req, res, 'under-construction.html', {});
    });
}

app.use((req, res, next) => {
    const untrustedSession = req.cookies['ctf-session'];
    if (untrustedSession) {
        const session = Auth.verifyUntrustedSession(untrustedSession);
        if (session) {
            req.session = session;
            next();
            return;
        }
    }
    req.session = null;
    next();
});

const verifyEmail = (email) => typeof email === 'string' && email.length > 0 && email.length < 100;
const verifyPassword = (password) => typeof password === 'string' && password.length > 3 && password.length < 1000;
const verifyTeamName = (name) => typeof name === 'string' && name.length > 0 && name.length < 40;
const verifyTeamPassword = (password) => typeof password === 'string' && password.length > 0 && password.length < 1000;
const verifyGuess = (guess) => typeof guess === 'string' && guess.length > 0 && guess.length < 1000;

export const requireAuth = (req, res, next) => {
    if (req.session) {
        next();
    } else {
        res.status(401).send('Missing session');
    }
};

export const requireNoAuth = (req, res, next) => {
    if (req.session) {
        res.status(401).send('You are already signed in');
    } else {
        next();
    }
};

export const jsonParser = bodyParser.json({
    limit: 1024
});

app.use('/api/*splat', (req, res, next) => {
    if (STATUS === 'after') {
        res.status(401);
        res.send('CTF has ended');
    } else {
        next();
    }
});

app.put('/api/register', rateLimiter(HOUR, 5), requireNoAuth, jsonParser, (req, res) => {
    const {email, password} = req.body;
    if (!verifyEmail(email) || !verifyPassword(password)) {
        res.status(400).send('Email or password are invalid');
        return;
    }

    const passwordHash = Auth.createPasswordHash(password);

    let userId;
    try {
        userId = Database.createUser(email, passwordHash);
    } catch (e) {
        res.status(400).send('User already exists');
        return;
    }

    const session = Auth.createSession(userId);
    res.json({
        session
    });
});

app.put('/api/login', rateLimiter(MINUTE, 100), requireNoAuth, jsonParser, (req, res) => {
    const {email, password} = req.body;
    if (!verifyEmail(email) || !verifyPassword(password)) {
        res.status(400).send('Email or password are invalid');
        return;
    }

    const userLoginInfo = Database.getUserLoginInfo(email);
    if (!userLoginInfo) {
        res.status(400).send('User does not exist');
        return;
    }

    if (!Auth.verifyUntrustedPassword(password, userLoginInfo.user_password_hash)) {
        res.status(400).send('Invalid password');
        return;
    }

    const session = Auth.createSession(userLoginInfo.user_id);
    res.json({
        session,
        teamId: Database.getUserTeamId(userLoginInfo.user_id)
    });
});

app.put('/api/create-team', rateLimiter(HOUR, 5), requireAuth, jsonParser, (req, res) => {
    const existingTeamId = Database.getUserTeamId(req.session.userId);
    if (existingTeamId) {
        res.status(400).send('You are already in a team');
        return;
    }

    const {name} = req.body;
    if (!verifyTeamName(name)) {
        res.status(400).send('Invalid name');
        return;
    }

    const teamPassword = Auth.generateTeamPassword();
    const teamId = Database.createTeam(name, teamPassword);
    Database.addUserToTeam(req.session.userId, teamId);
    res.json({
        teamPassword
    });
});

app.put('/api/join-team', rateLimiter(MINUTE, 100), requireAuth, jsonParser, (req, res) => {
    const existingTeamId = Database.getUserTeamId(req.session.userId);
    if (existingTeamId) {
        res.status(400).send('You are already in a team');
        return;
    }

    const {teamPassword} = req.body;
    if (!verifyTeamPassword(teamPassword)) {
        res.status(400).send('Invalid password');
        return;
    }

    const newTeamId = Database.getTeamByPassword(teamPassword);
    if (newTeamId) {
        const teamMembers = Database.getPeopleInTeam(newTeamId);
        if (teamMembers.length < MAX_TEAM_MEMBERS) {
            Database.addUserToTeam(req.session.userId, newTeamId);
            res.json({});
        } else {
            res.status(400).send('Team is full');
        }
    } else {
        res.status(400).send('Password not recognized');
    }
});

app.put('/api/leave-team', rateLimiter(MINUTE, 100), requireAuth, (req, res) => {
    if (MAX_TEAM_MEMBERS <= 1) {
        res.status(400).send('Cant leave team as teams have 1 member max');
        return;
    }
    Database.leaveTeam(req.session.userId);
    res.json({});
});

app.put('/api/regenerate-team-password', rateLimiter(MINUTE, 100), requireAuth, (req, res) => {
    const teamId = Database.getUserTeamId(req.session.userId);
    if (!teamId) {
        res.status(400).send('Not in a team');
        return;
    }

    const teamPassword = Auth.generateTeamPassword();
    const teamPasswordHash = Auth.createPasswordHash(teamPassword);
    Database.updateTeamPassword(teamId, teamPasswordHash);
    res.json({
        teamPassword
    });
});

app.put('/api/hint', rateLimiter(MINUTE, 100), requireAuth, jsonParser, (req, res) => {
    const {challengeId, hintId} = req.body;

    const teamId = Database.getUserTeamId(req.session.userId);
    if (!teamId) {
        res.status(401).send('Must be in a team to unlock hints');
        return;
    }

    if (!Challenges.isChallenge(challengeId) || !Challenges.hasUnlocked(teamId, challengeId)) {
        res.status(401).send('Challenge does not exist or you cannot access it');
        return;
    }

    if (Database.hasCompletedChallenge(teamId, challengeId)) {
        res.status(400).send('You already completed this challenge');
        return;
    }

    const challenge = Challenges.getChallenge(challengeId);
    if (!challenge.hints || !challenge.hints.find(h => h.id === hintId)) {
        res.status(400).send('Hint does not exist');
        return;
    }

    if (Database.hasUnlockedHint(teamId, challengeId, hintId)) {
        res.status(400).send('Hint already unlocked');
        return;
    }

    const hint = challenge.hints.find(h => h.id === hintId);

    const currentScore = Database.getTeamScore(teamId);
    if (currentScore < hint.cost) {
        res.status(400).send('Not enough points');
        return;
    }

    Database.addScoringEvent(teamId, req.session.userId, challengeId, -hint.cost, 'hint unlock', hintId);
    Database.unlockHint(teamId, req.session.userId, challengeId, hintId);
    res.json({});
});

app.put('/api/rename-team', rateLimiter(MINUTE, 100), requireAuth, jsonParser, (req, res) => {
    const {name} = req.body;
    if (!verifyTeamName(name)) {
        res.status(400).send('Invalid name');
        return;
    }

    const teamId = Database.getUserTeamId(req.session.userId);
    if (!teamId) {
        res.status(400).send('Not in a team');
        return;
    }

    Database.renameTeam(teamId, name);
    res.json({});
});

app.put('/api/guess', rateLimiter(MINUTE, 100), requireAuth, jsonParser, (req, res) => {
    const {challengeId, guess} = req.body;
    if (!verifyGuess(guess)) {
        res.status(400).send('Invalid guess');
        return;
    }

    const teamId = Database.getUserTeamId(req.session.userId);
    if (!teamId) {
        res.status(401).send('Must be in a team to submit guesses');
        return;
    }

    if (!Challenges.isChallenge(challengeId) || !Challenges.hasUnlocked(teamId, challengeId)) {
        res.status(401).send('Challenge does not exist or you can not access it');
        return;
    }

    if (Database.hasCompletedChallenge(teamId, challengeId)) {
        res.status(400).send('You have already completed this challenge');
        return;
    }

    Database.addGuess(teamId, req.session.userId, challengeId, guess)

    if (Challenges.checkSolution(challengeId, guess)) {
        const value = Challenges.getChallenge(challengeId).value;
        Database.addScoringEvent(teamId, req.session.userId, challengeId, value, 'correct guess', null);
        Database.completeChallenge(teamId, req.session.userId, challengeId);

        const challenge = Challenges.getChallenge(challengeId);
        const nextChallenge = challenge.next && Challenges.hasUnlocked(teamId, challenge.next) ? challenge.next : null;

        res.json({
            success: true,
            nextChallenge
        });
    } else {
        res.json({
            success: false
        })
    }
});

app.get('/signout', (req, res) => {
    res.clearCookie('ctf-session');
    res.redirect('/');
});

app.get('/challenges/:id', (req, res, next) => {
    if (!req.session) {
        render(req, res, 'error.html', {
            error: 'Must be signed in to view challenge'
        });
        return;
    }

    const teamId = Database.getUserTeamId(req.session.userId);
    if (!teamId) {
        res.status(401);
        render(req, res, 'error.html', {
            error: 'Must be in a team to view challenges'
        });
        return;
    }

    const challengeId = req.params.id;
    if (!Challenges.isChallenge(challengeId) || !Challenges.hasUnlocked(teamId, challengeId)) {
        res.status(401);
        render(req, res, 'error.html', {
            error: 'Challenge does not exist or you do not have permission to access it'
        });
        return;
    }

    const challenge = Challenges.getChallenge(challengeId);
    const nextChallenge = challenge.next && Challenges.hasUnlocked(teamId, challenge.next) ? challenge.next : null;

    const unlockedHintIds = [];
    if (challenge.hints) {
        for (const hint of challenge.hints) {
            if (Database.hasUnlockedHint(teamId, challengeId, hint.id)) {
                unlockedHintIds.push(hint.id);
            }
        }
    }

    render(req, res, 'challenge.html', {
        teamId,
        completed: Database.hasCompletedChallenge(teamId, challengeId),
        challenge: Challenges.getChallenge(challengeId),
        solves: Database.getSolves(challengeId),
        nextChallenge,
        unlockedHintIds
    });
});

app.get('/challenges/:id/:file', requireAuth, (req, res, next) => {
    if (!req.session) {
        render(req, res, 'error.html', {
            error: 'Must be signed in to view challenge'
        });
        return;
    }

    const teamId = Database.getUserTeamId(req.session.userId);
    if (!teamId) {
        res.status(401);
        render(req, res, 'error.html', {
            error: 'Must be in a team to view challenges'
        });
        return;
    }

    const challengeId = req.params.id;
    if (!Challenges.isChallenge(challengeId) || !Challenges.hasUnlocked(teamId, challengeId)) {
        res.status(401);
        render(req, res, 'error.html', {
            error: 'Challenge does not exist or you do not have permission to access it'
        });
        return;
    }

    const challengeRoot = path.join(import.meta.dirname, 'challenge-static', challengeId);
    const fileName = req.params.file;

    res.sendFile(fileName, {
        root: challengeRoot
    }, (err) => {
        if (err) {
            // go to 404 instead of letting sendFile do a 500...
            next();
        }
    });
});

app.get('/challenges', (req, res) => {
    const teamId = req.session?.userId && Database.getUserTeamId(req.session.userId);
    const teamName = teamId && Database.getTeamName(teamId);

    const hasCompletedChallenge = (challengeId) => {
        if (teamId) {
            return Database.hasCompletedChallenge(teamId, challengeId);
        }
        return false;
    };

    const hasUnlockedChallenge = (challengeId) => {
        if (teamId) {
            return Challenges.hasUnlocked(teamId, challengeId);
        }
        return Challenges.isAlwaysUnlocked(challengeId);
    };

    render(req, res, 'challenges.html', {
        teamId,
        teamName,
        hasCompletedChallenge,
        hasUnlockedChallenge,
        categories: Challenges.getCategories()
    });
});

app.get([
    '/team',
    '/account'
], (req, res) => {
    if (!req.session) {
        render(req, res, 'error.html', {
            error: 'You must log in to edit team stuff'
        });
        return;
    };

    const teamId = Database.getUserTeamId(req.session.userId);
    if (!teamId) {
        render(req, res, 'join-team.html', {});
        return;
    }

    render(req, res, 'team.html', {
        teamName: Database.getTeamName(teamId),
        teamMembers: Database.getPeopleInTeam(teamId)
    });
});

app.get('/scoreboard', (req, res) => {
    const userId = req.session?.userId;
    const teamId = userId && Database.getUserTeamId(userId);
    render(req, res, 'scoreboard.html', {
        teamId,
        scoreboard: Database.getScoreboard()
    });
});

app.get('/', (req, res) => {
    if (req.session) {
        res.redirect('/challenges');
    } else {
        render(req, res, 'homepage.html', {});
    }
});

app.use(express.static(path.join(import.meta.dirname, 'public-static')));

export const finish = () => {
    for (const task of deferredInitTasks) { 
        task();
    }
    deferredInitTasks.length = 0;

    app.use((req, res) => {
        res.status(404);
        if (req.path.startsWith('/api/')) {
            res.type('text/plain').send('404 Not Found');
        } else {
            render(req, res, 'error.html', {
                error: '404 Not Found'
            });
        }
    });

    app.use((err, req, res, next) => {
        console.error(err);
        res.status(500);
        res.type('text/plain');
        res.send(`${err}`);
    });
};
