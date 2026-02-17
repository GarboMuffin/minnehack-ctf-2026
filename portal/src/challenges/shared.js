import fs from 'node:fs';
import nodeURL from 'node:url';
import hljs from 'highlight.js';

const LIGHT_CSS = fs.readFileSync(nodeURL.fileURLToPath(import.meta.resolve('highlight.js/styles/github.css')), 'utf-8');
const DARK_CSS = fs.readFileSync(nodeURL.fileURLToPath(import.meta.resolve('highlight.js/styles/atom-one-dark.css')), 'utf-8');

export const HL_STYLES = `
<style>
@media (prefers-color-scheme: light) {
    ${LIGHT_CSS}
}
@media (prefers-color-scheme: dark) {
    ${DARK_CSS}
}
</style>
`;

const highlightCache = new Map();
export const highlight = (src, lang) => {
    const cacheKey = `${lang}-${src}`;
    if (!highlightCache.has(cacheKey)) {

        const firstNonEmpty = src.split('\n').filter(i => i.trim())[0] || '';
        const numSpaces = firstNonEmpty.match(/^ */)[0].length;
        const newLines = src.trim().split('\n').map(i => {
            if (i.substr(0, numSpaces).trim().length === 0) {
                return i.substr(numSpaces);
            }
            return i;
        }).join('\n');
        const value = hljs.highlight(newLines, {
            language: lang
        }).value;
        const fmt = `<pre class="highlight">${value}</pre>`;
        highlightCache.set(cacheKey, fmt);
    }
    return highlightCache.get(cacheKey);
};

export const ssh = (key) => `
    <p class="command">ssh ctf@128.101.131.184 -tp 80 ${key}</p>
`;
