import { Category, staticFlag } from "../challenges.js";
import { ssh } from "./shared.js";

const c = new Category({
    name: 'Control Panel',
    description: ``
});

c.add({
    id: 'control-panel-1',
    name: 'Control Panel 1',
    next: 'control-panel-2',
    description: () => `
        <p>I found some power plant exposing some monitoring tool on the open internet. Connect with the command below. I already found the credentials admin/1234 to log in.</p>
        ${ssh('QYpR0k0sRTR1crniSem4GJw9')}
        <p>Unfortunately it seems like we have pretty limited access. But surely there's still some way we can break out of this. Can you find a way to read the file located at <code>/flag</code>?</p>
    `,
    value: 100,
    check: staticFlag('flag{2d353e1b-d8bb-4c10-9bb1-30c8b59445b9}')
});

c.add({
    id: 'control-panel-2',
    name: 'Control Panel 2',
    requires: ['control-panel-1'],
    description: () => `
        <p>They realized something is up and put a <a href="https://en.wikipedia.org/wiki/Time-based_one-time_password">two-factor authentication</a> step after you enter the password.</p>
        <p>It's weird that they didn't even bother to change the username or password. Seems they don't have any clue how to write secure software. Surely you can find a way around the 2FA?</p>
        ${ssh('nRVa4gcnpvoBdbKWfhgjnaw2')}
    `,
    value: 150,
    check: staticFlag('flag{f8807a86-ef76-4a2e-a8c5-fd018bc25a40}')
});
