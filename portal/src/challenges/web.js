import { Category, staticFlag } from "../challenges.js";
import { highlight, HL_STYLES, ssh } from "./shared.js";

const c = new Category({
    name: 'Web',
    description: ``
});

c.add({
    id: 'xss-1',
    name: 'XSS 1',
    next: 'xss-2',
    description: () => `
        <p>Found this website for sharing ASCII art.</p>
        <p>Apparently, after you upload something, there's a bot that will load up that page in a new Chrome tab.</p>
        <p>I think the cookies of that Chrome process would be interesting to see.</p>
        <p><a href="https://fffays9qhabdnjkmabzrj55m.ctf.minnehack.com">fffays9qhabdnjkmabzrj55m.ctf.minnehack.com</a></p>
    `,
    value: 50,
    check: staticFlag('flag{57ffb1f5-ce95-4978-a9a1-46c55bfb115a}')
});

c.add({
    id: 'xss-2',
    name: 'XSS 2',
    requires: ['xss-1'],
    next: 'xss-3',
    description: () => `
        <p>The people that made the ASCII website made another one for images. It looks like they added sanitization this time though. Can you find a way around?</p>
        <p><a href="https://qcxteyguuliargrkmwp0ajbh.ctf.minnehack.com">qcxteyguuliargrkmwp0ajbh.ctf.minnehack.com</a></p>
    `,
    value: 50,
    check: staticFlag('flag{42b61670-5196-4bb3-ba53-cc38d881c32a}')
});

c.add({
    id: 'xss-3',
    name: 'XSS 3',
    requires: ['xss-2'],
    description: () => `
        <p>They made another one for SVGs. Might require a zero day.</p>
        <p>Well, okay. It's not really a zery day because we reported it to them two years ago. But it's still just not fixed...</p>
        <p><a href="https://yno1czvpnjle3j68mcgjygqz.ctf.minnehack.com">yno1czvpnjle3j68mcgjygqz.ctf.minnehack.com</a></p>
    `,
    value: 150,
    check: staticFlag('flag{c691fb36-cff3-4d42-949d-a372f38f65d9}')
});

c.add({
    id: 'secure-db',
    name: 'Secure Database',
    value: 50,
    description: () => `
        <p>This is a very secure key-value database. Connect to it with:</p>
        ${ssh('10IcQTKIP8vqC0eOykSZauBX')}
        ${HL_STYLES}
        <p>The flag is the file: <code>/flag</code></p>
        <p>Here's the code:</p>
        ${highlight(`
        const fs = require('fs');
        const readline = require('readline/promises');
        
        const permissions = {};
        
        class SecureDatabase {
            constructor() {
                this.data = {};
            }
            set(key, value) {
                const parts = key.split('.');
                const last = parts.pop();
                let data = this.data;
                for (const p of parts) {
                    if (!data[p] || typeof data[p] !== 'object') data[p] = {};
                    data = data[p];
                }
                data[last] = value;
            }
            get(key) {
                try {
                    let data = this.data;
                    if (key) for (const p of key.split('.')) data = data[p];
                    return data;
                } catch (e) {
                    return null;
                }
            }
            static openTransient() {
                const db = new SecureDatabase();
                console.log('Connected to a transient in-memory database.');
                return db;
            }
            static openFile(name) {
                const db = new SecureDatabase();
                db.data = JSON.parse(fs.readFileSync(name, 'utf-8'));
                console.log('Connected to database "' + name + '".');
                return db;
            }
        }
        
        const repl = async () => {
            let db = SecureDatabase.openTransient();
            const rl = readline.createInterface({
                input: process.stdin,
                output: process.stdout
            }).on('SIGINT', () => process.exit()).on('close', () => process.exit());
            while (true) {
                const command = await rl.question('SecureDB> ');
                const parts = command.split(' ');
                if (parts[0] === 'get') {
                    console.log(db.get(parts[1] || ''));
                } else if (parts[0] === 'set') {
                    db.set(parts[1] || '', parts[2] ?? null);
                } else if (parts[0] === 'open') {
                    if (permissions.canOpenFiles) {
                        try {
                            db = SecureDatabase.openFile(parts[1]);
                        } catch (e) {
                            console.log('Error: ' + e.code);
                        }
                    } else {
                        console.log('Error: Missing permission.');
                    }
                } else {
                    console.log('Error: Unknown command.');
                }
            }
        };
        
        repl();
        `, 'javascript')}
    `,
    check: staticFlag('flag{5e5e6306-37f5-4ba3-8106-cebba804e3dd}'),
});
