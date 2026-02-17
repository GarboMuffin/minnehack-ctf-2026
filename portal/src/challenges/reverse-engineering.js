import { Category, staticFlag } from "../challenges.js";

const c = new Category({
    name: 'Reverse Engineering',
    description: ``,
});

const COMMON = `
<style>
</style>
`;

c.add({
    id: 'rev-intro',
    name: 'Intro',
    description: () => `
        ${COMMON}
        <p>
            In this category, we will give you a pre-compiled Linux executable without source code.
            You should be able to run them on the CSE lab machines.
        </p>
        <p>
            Your goal is to reverse engineer the program to figure out what input will make it print out success.
            That input is the flag.
        </p>
        <p>
            The programs should run on almost any Linux distribution released since 2021.
        </p>
        <p>
            You will have to manually mark each file as executable by running a command like <code>chmod +x intro.out</code> in your downloads folder for each challenge.
        </p>
        <p class="download"><a href="/challenges/rev-intro/intro.out">Download intro.out</a></p>
    `,
    value: 50,
    check: staticFlag('flag{Didnt_even_strip_debug_symbols}')
});

c.add({
    id: 'rev-scramble',
    name: 'Scramble',
    description: () => `
        <p class="download"><a href="/challenges/rev-scramble/scramble.out">Download scramble.out</a></p>
        <p>Reminder: mark as executable with <code>chmod +x ...</code></p>
    `,
    value: 50,
    check: staticFlag('flag{NotMuchBetter}')
});

c.add({
    id: 'rev-bakers-dozen',
    name: 'Bakers Dozen',
    description: () => `
        <p class="download"><a href="/challenges/rev-bakers-dozen/bakers-dozen.out">Download bakers-dozen.out</a></p>
        <p>Reminder: mark as executable with <code>chmod +x ...</code></p>
    `,
    value: 50,
    check: staticFlag('flag{RotThirteenIsVerySecure}')
});

c.add({
    id: 'rev-leaves',
    name: 'Leaves',
    description: () => `
        <p class="download"><a href="/challenges/rev-leaves/leaves.out">Download leaves.out</a></p>
        <p>Reminder: mark as executable with <code>chmod +x ...</code></p>
    `,
    value: 50,
    check: staticFlag('flag{UnbalancedBinaryTree}')
});

c.add({
    id: 'rev-bytecode',
    name: 'Bytecode',
    description: () => `
        <p class="download"><a href="/challenges/rev-bytecode/bytecode.out">Download bytecode.out</a></p>
        <p>Reminder: mark as executable with <code>chmod +x ...</code></p>
    `,
    value: 50,
    check: staticFlag('flag{dac40cb6-6233-4800-a251-ac8c91fd7b5f}')
});
