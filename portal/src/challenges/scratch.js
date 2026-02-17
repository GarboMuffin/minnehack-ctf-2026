import { caseInsensitiveStaticFlag, Category, staticFlag } from "../challenges.js";

const c = new Category({
    name: 'Scratch',
    description: `
    `
});

c.add({
    id: 'scratch-ghosts-1',
    name: 'Ghosts',
    value: 100,
    description: () => `
        <p>This is actually a reverse-engineering puzzle but written in <a href="https://scratch.mit.edu/">Scratch</a>.</p>
        <p>The create button in the menu bar opens the Scratch editor. Then use File > Load from your computer to open the file. Might need to do a bit more, though.</p>
        <p class="download"><a href="/challenges/scratch-ghosts-1/puzzle.sb3">Download puzzle.sb3</a></p>
    `,
    check: caseInsensitiveStaticFlag('flag{8.05693124250756}')
});

c.add({
    id: 'scratch-lost-and-found',
    name: 'Lost and found',
    value: 100,
    description: () => `
        <p>I created a new <a href="https://scratch.mit.edu/">Scratch</a> account, made a new project, and immediately shared it (less than a minute after creation). All was going well. I even hid a secret code inside.</p>
        <p>Unfortunately, my hard drive died and I don't even remember my username. All I have is this screenshot. Can you find and recover the secret phrase for me?</p>
        <style>
            .the-img img {
                width: 100%;
                height: auto;
            }
        </style>
        <p>
            <a class="the-img" href="/challenges/scratch-lost-and-found/Screenshot_2026-01-26_212221.png">
                <img width="1919" height="1199" src="/challenges/scratch-lost-and-found/Screenshot_2026-01-26_212221.png">
            </a>
        </p>
    `,
    check: staticFlag('flag{89821b23-074a-47fa-827a-2d66ad18e86a}')
});
