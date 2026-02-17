import nodeCrypto from 'node:crypto';
import * as Database from './database.js';

const getSecret = () => {
    const KEY = 'SESSION_SECRET';
    const existingSecretBase64 = Database.getMeta(KEY);
    if (existingSecretBase64) {
        const existingSecretBuffer = Buffer.from(existingSecretBase64, 'base64');
        return existingSecretBuffer;
    }

    console.log('Generating session secret');
    const newSecretBuffer = nodeCrypto.randomBytes(64);
    const newSecretBase64 = newSecretBuffer.toString('base64');
    Database.setMeta(KEY, newSecretBase64);
    return newSecretBuffer;
};

const SESSION_SECRET = getSecret();
const SESSION_HMAC_ALGORITHM = 'sha256';
const SESSION_DIVIDER = '%%%';

const PASSWORD_HASH_DIVIDER = '~~~';
const PASSWORD_HASH_KEYLEN = 64;

class VerifiedSession {
    /**
     * @private
     */
    constructor () {
        // Everything on here can be seen by the user.
        this.userId = -1;
        this.createdAt = -1;
    }

    toString () {
        return JSON.stringify(this);
    }

    /**
     * @param {number} userId User ID
     * @returns {VerifiedSession}
     */
    static create (userId) {
        const claim = new VerifiedSession();
        claim.userId = userId;
        claim.createdAt = Date.now();
        return claim;
    }

    /**
     * @param {string} string A trusted and verified string
     * @returns {VerifiedSession}
     */
    static fromString (string) {
        const obj = JSON.parse(string);
        const claim = new VerifiedSession();
        claim.userId = obj.userId;
        claim.createdAt = obj.createdAt;
        return claim;
    }
}

/**
 * @param {number} userId
 * @returns {string}
 */
export const createSession = (userId) => {
    const claim = VerifiedSession.create(userId);
    const claimBuffer = Buffer.from(claim.toString());
    const claimBase64 = claimBuffer.toString('base64');

    const hmac = nodeCrypto.createHmac(SESSION_HMAC_ALGORITHM, SESSION_SECRET);
    hmac.update(claimBuffer);
    const hmacBase64 = hmac.digest('base64');

    return `${claimBase64}${SESSION_DIVIDER}${hmacBase64}`;
};

/**
 * @param {string} untrustedSession From the user
 * @returns {VerifiedSession|null}
 */
export const verifyUntrustedSession = (untrustedSession) => {
    const untrustedClaimParts = untrustedSession.split(SESSION_DIVIDER);
    if (untrustedClaimParts.length !== 2) {
        return null;
    }

    const [untrustedClaimBase64, untrustedHmacBase64] = untrustedClaimParts;
    const untrustedClaimBuffer = Buffer.from(untrustedClaimBase64, 'base64');
    const untrustedHmacBuffer = Buffer.from(untrustedHmacBase64, 'base64');

    const hmac = nodeCrypto.createHmac(SESSION_HMAC_ALGORITHM, SESSION_SECRET);
    hmac.update(untrustedClaimBuffer);
    const hmacBuffer = hmac.digest();

    if (nodeCrypto.timingSafeEqual(hmacBuffer, untrustedHmacBuffer)) {
        const untrustedClaimString = untrustedClaimBuffer.toString('utf8');
        return VerifiedSession.fromString(untrustedClaimString);
    }
    return null;
};

/**
 * @param {string} password
 * @returns {string}
 */
export const createPasswordHash = (password) => {
    const saltBuffer = nodeCrypto.randomBytes(32);
    const hashBuffer = nodeCrypto.scryptSync(password, saltBuffer, PASSWORD_HASH_KEYLEN);
    const saltBase64 = saltBuffer.toString('base64');
    const hashBase64 = hashBuffer.toString('base64');
    return `${saltBase64}${PASSWORD_HASH_DIVIDER}${hashBase64}`;
};

/**
 * @param {string} untrustedPassword Untrusted password
 * @param {string} hash From createPasswordHash()
 * @returns {boolean} true if matches
 */
export const verifyUntrustedPassword = (untrustedPassword, hash) => {
    const [saltBase64, expectedHashBase64] = hash.split(PASSWORD_HASH_DIVIDER);
    const saltBuffer = Buffer.from(saltBase64, 'base64');
    const expectedHashBuffer = Buffer.from(expectedHashBase64, 'base64');
    const actualHashBuffer = nodeCrypto.scryptSync(untrustedPassword, saltBuffer, PASSWORD_HASH_KEYLEN);
    return nodeCrypto.timingSafeEqual(expectedHashBuffer, actualHashBuffer);
};

/**
 * @returns {string}
 */
export const generateTeamPassword = () => {
    const uuid = nodeCrypto.randomUUID();
    const teamPassword = uuid.replace(/-/g, '');
    return teamPassword;
};
