import { Category, staticFlag } from "../challenges.js";

const c = new Category({
    name: 'Meta',
    description: ``
});

c.add({
    id: 'meta',
    name: 'Find a vulnerability in the CTF itself',
    description: () => `
        <p>If you find and report a vulnerability in this CTF itself (such as this website), we'll award you <b>bonus points</b>. Maybe 100, maybe more, maybe less, who knows.</p>
        <p>Some details about our tech stack:</p>
        <ul>
            <li>This entire event is running on one Linux server</li>
            <li>This website is a custom Node.js website written with maximum spaghetti</li>
            <li>All challenges and services (such as this website) run inside <a href="https://podman.io/">podman</a> containers (it's like docker but based)</li>
        </ul>
        <p>Let us know if you find anything.</p>
    `,
    value: 200,
    check: staticFlag('flag{4d3d1d99-2e30-4821-8684-66b33763b5a6}')
});
