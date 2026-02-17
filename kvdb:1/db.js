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
