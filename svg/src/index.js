import sqlite from 'node:sqlite';
import bodyParser from 'body-parser';
import express from 'express';
import crypto from 'node:crypto';

const database = new sqlite.DatabaseSync(process.env.DATABASE_PATH || 'development.db');
database.exec(`
CREATE TABLE IF NOT EXISTS images (
    id TEXT PRIMARY KEY NOT NULL,
    content TEXT NOT NULL,
    reviewed INTEGER DEFAULT 0
) STRICT;
`);
const createImage = database.prepare(`INSERT INTO images (id, content) VALUES (?, ?)`);
const getImage = database.prepare(`SELECT content FROM images WHERE id = ?`);

const app = express();
app.set('query parser', (s) => new URLSearchParams(s));
app.set('trust proxy', true);

app.use((req, res, next) => {
    res.header('cache-control', 'no-store');
    if (!req.header('cookie') || !req.header('cookie').includes('flag{')) {
        res.cookie('flag', 'you_would_find_the_flag_here');
    }
    next();
});

app.post('/api/upload', bodyParser.json({
    type: () => true
}), (req, res) => {
    if (!req.body) { res.status(400).send('Missing body'); return; }
    if (typeof req.body.content !== 'string') { res.status(400).send('content in body is not a string'); return; }
    if (req.body.content.length > 1000000) { res.status(400).send('content is too long'); return; }

    const id = crypto.randomUUID();

    try {
        createImage.run(id, req.body.content);
    } catch (e) {
        console.error(e);
        res.status(500).send('Failed to create image');
        return;
    }

    console.log(`UPLOAD ${req.ip} id=${id}`);
    res.json({ id });
});

app.get('/api/get', (req, res) => {
    if (!req.query.has('id')) {
        res.status(404).send('Missing ID');
        return;
    }

    var response = getImage.get(req.query.get('id'));
    if (!response) {
        res.status(404).send('Unknown ID');
        return;
    }

    res.type('image/svg+xml').send(response.content);
});

app.get('/', (req, res) => {
    res.sendFile('index.html', { root: import.meta.dirname });
});

app.get('/view', (req, res) => {
    res.sendFile('view.html', { root: import.meta.dirname });
});

app.get('/paper-core.js', (req, res) => {
    res.sendFile('paper-core.js', { root: import.meta.dirname });
});

const getUncrawled = database.prepare(`SELECT id FROM images WHERE reviewed = 0`);
app.get('/internal-uncrawled-stuffs', (req, res) => {
    res.json({
        ids: getUncrawled.all().map(row => row.id)
    });
});

const setCrawled = database.prepare(`UPDATE images SET reviewed = 1 WHERE id = ?`);
app.post('/internal-mark-crawled', bodyParser.json({ type: () => true }), (req, res) => {
    if (!req.body || typeof req.body.id !== 'string') {
        res.status(400).send('Invalid request');
        return;
    }
    setCrawled.run(req.body.id);
    res.status(204).end();
});

app.listen(80);
