import nodeCrypto from 'node:crypto';
import * as Database from './database.js';

/**
 * @typedef Hint
 * @property {string} id
 * @property {(teamId: number) => string} content
 * @property {number} cost
 */

/**
 * @typedef Challenge
 * @property {string} id
 * @property {string} name
 * @property {(teamId: number) => string} description
 * @property {number} value
 * @property {(input: string) => boolean} check
 * @property {string[]} [requires]
 * @property {string} [next]
 * @property {Hint[]} [hints]
 */

/**
 * @typedef Category
 * @property {string[]} challenges
 */

/** @type {Category[]} */
const categories = [];

/** @type {Record<string, Challenge>} */
const challenges = Object.create(null);

/**
 * @param {string} a
 * @param {string} b
 * @returns {boolean} True if equal
 */
export const constantTimeStringCompare = (a, b) => {
    const bufA = Buffer.from(a);
    const bufB = Buffer.from(b);
    const maxLen = Math.max(bufA.length, bufB.length);
    if (maxLen > 1000) {
        return false;
    }
    const paddedA = Buffer.alloc(maxLen, 0);
    const paddedB = Buffer.alloc(maxLen, 0);
    bufA.copy(paddedA);
    bufB.copy(paddedB);
    return nodeCrypto.timingSafeEqual(paddedA, paddedB);
};

export const staticFlag = (str) => (check) => constantTimeStringCompare(check, str);

export const caseInsensitiveStaticFlag = (str) => (check) => constantTimeStringCompare(check.toLowerCase(), str.toLowerCase());

export class Category {
    constructor (options) {
        /** @type {string} */
        this.name = options.name;

        /** @type {string} */
        this.description = options.description;

        /** @type {Challenge[]} */
        this.challenges = [];

        categories.push(this);
    }

    /**
     * @param {Challenge} challenge
     */
    add (challenge) {
        this.challenges.push(challenge);

        if (challenges[challenge.id]) {
            throw new Error(`Challenge ID conflict ${challenge.id}`);
        }
        challenges[challenge.id] = challenge;
    }
}

/**
 * @param {string} challengeId
 * @returns {boolean} true if challenge does exist
 */
export const isChallenge = (challengeId) => !!challenges[challengeId];

/**
 * @param {string} challengeId
 * @returns {Challenge} or throws if invalid
 */
export const getChallenge = (challengeId) => {
    if (!isChallenge(challengeId)) {
        throw new Error(`Invalid challenge ${challengeId}`);
    }
    return challenges[challengeId];
};

/**
 * @param {number} teamId
 * @param {string} challengeId
 * @returns {boolean} true if the team can view the challenge
 */
export const hasUnlocked = (teamId, challengeId) => {
    const challenge = getChallenge(challengeId);
    if (challenge.requires) {
        for (const required of challenge.requires) {
            if (!Database.hasCompletedChallenge(teamId, required)) {
                return false;
            }
        }
    }
    return true;
};

/**
 * @param {string} challengeId
 * @returns {boolean} True if always visible, even to guests
 */
export const isAlwaysUnlocked = (challengeId) => {
    const challenge = getChallenge(challengeId);
    return !challenge.requires;
};

/**
 * @returns {Category[]}
 */
export const getCategories = () => categories;

/**
 * @param {string} challengeId
 * @param {string} input
 * @returns {boolean}
 */
export const checkSolution = (challengeId, input) => {
    const challenge = getChallenge(challengeId);
    return challenge.check(input);
};
