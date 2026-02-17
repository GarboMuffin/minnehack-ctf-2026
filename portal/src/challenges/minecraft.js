import { Category, staticFlag } from "../challenges.js";

const SERVER_INFO = `
<p>Server IP: <code>128.101.131.184:443</code> (Minecraft Java Edition 1.21.11)</p>
`;

const c = new Category({
    name: 'Minecraft',
    description: `
    `
});

c.add({
    id: 'minecraft-motd',
    name: 'Message of the day',
    description: () => `
        <p>What's hiding in the text that appears in the server list?</p>
        ${SERVER_INFO}
    `,
    value: 50,
    check: staticFlag('flag{dont-include-the-formatting-codes}')
});

c.add({
    id: 'minecraft-spawn-protection',
    name: 'Spawn protection',
    description: () => `
        <p>Find a way to activate the command block at X: 1242 Y: 64 Z: -457</p>
        ${SERVER_INFO}
    `,
    value: 100,
    check: staticFlag('flag{Excuse-Reserve-Captain-Glove}')
});

c.add({
    id: 'minecraft-resource-pack-1',
    name: 'Resource pack 1',
    next: 'minecraft-resource-pack-2',
    description: () => `
        <p>The entity textures in this server's resource pack are kind of weird. Looks like parts of a QR code. Can you find a way to scan it?</p>
        ${SERVER_INFO}
    `,
    value: 100,
    check: staticFlag('flag{eb60d601-3e08-4a1d-9314-b02d2ce5209b}')
});

c.add({
    id: 'minecraft-resource-pack-2',
    name: 'Resource pack 2',
    requires: ['minecraft-resource-pack-1'],
    description: () => `
    <p>Same thing but harder.</p>
    <p>This is based on real things that real servers do to protect their resource packs.</p>
    <p>https://minecraft-resource-pack.ctf.minnehack.com/i-was-told-this-is-way-too-hard.zip</p>
    `,
    value: 200,
    check: staticFlag('flag{74f040ee-96ce-4744-a67d-a6ea66e08200}')
});

c.add({
    id: 'minecaft-seed',
    name: 'Seed',
    description: () => `
    <p>What's the seed?</p>
    ${SERVER_INFO}
    `,
    value: 100,
    flagFormat: '1234...',
    check: staticFlag('-4947566875237588702')
});

c.add({
    id: 'minecraft-precision',
    name: 'Precision',
    description: () => `
        <p>Set your position to be <i>exactly</i>:</p>
        <p>X: 1272.1323423424234</p>
        <p>Y: 70.0</p>
        <p>Z: -474.223423423434</p>
        <p>In the overworld.</p>
        ${SERVER_INFO}
    `,
    check: staticFlag('flag{Mushroom-Bro-Passkey-3}'),
    value: 100
});

c.add({
    id: 'minecraft-ender-dragon',
    name: 'Kill the ender dragon',
    description: () => `
        <p>In case you have too much free time.</p>
        <p>The flag will be on the dragon egg when you pick it up.</p>
        ${SERVER_INFO}
    `,
    value: 5,
    check: staticFlag('flag{Unsaved-Neutron-Dipper-Plot}')
});

c.add({
    id: 'minecraft-wither',
    name: 'Kill the wither',
    description: () => `
        <p>In case you have too much free time.</p>
        <p>The flag will be on the nether star when you pick it up.</p>
        ${SERVER_INFO}
    `,
    value: 5,
    check: staticFlag('flag{Clang-Bless-Eleven-Diffused}')
});
