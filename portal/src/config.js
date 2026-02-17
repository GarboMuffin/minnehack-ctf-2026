export const EVENT_NAME = process.env.CTF_EVENT_NAME || 'MinneHack CTF';

export const MAX_TEAM_MEMBERS = +process.env.CTF_MAX_TEAM_MEMBERS || 4;

/** @type {'before'|'during'|'after'} */
export const STATUS = process.env.CTF_STATUS || 'during';

/** @type {'competitive'|'noncompetitive'} */
export const VARIANT = process.env.CTF_VARIANT || 'noncompetitive';
