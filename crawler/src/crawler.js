import puppeteer from 'puppeteer';

const INTERNAL_URL = process.env.INTERNAL_URL;
const PUBLIC_URL = process.env.PUBLIC_URL;
const FLAG = process.env.FLAG;

const sleep = ms => new Promise(r => setTimeout(r, ms));

const visit = async (id) => {
    console.log('Crawling', id);

    const browser = await puppeteer.launch({
        // make it compatible with running inside podman
        // cant do namespace inside the namespace and there won't be a GPU
        headless: true,
        executablePath: process.env.CHROMIUM_PATH, // in dev this will be undefined and use the default from puppeteer
        args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-dev-shm-usage',
            '--disable-gpu',
        ],
    });

    try {
        const page = await browser.newPage();

        await page.setCookie({
            name: 'flag',
            value: FLAG,
            domain: new URL(PUBLIC_URL).hostname,
            path: '/',
            httpOnly: false,
            secure: true,
        });

        browser.on('targetcreated', async (target) => {
            const newPage = await target.page();
            if (newPage) {
                await newPage.close();
            }
        });

        await page.goto(`${PUBLIC_URL}/view?id=${id}`);
        await sleep(5000);
    } catch (e) {
        console.error(e);
    } finally {
        await browser.close();
    }

    try {
        const response = await fetch(`${INTERNAL_URL}/internal-mark-crawled`, {
            method: 'POST',
            headers: {
                'content-type': 'application/json'
            },
            body: JSON.stringify({
                id
            })
        });

        if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
        }
    } catch (e) {
        console.error(e);
    }
};

const loop = async () => {
    while (true) {
        try {
            console.log('Polling');
            const response = await fetch(`${INTERNAL_URL}/internal-uncrawled-stuffs`);

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }

            const data = await response.json();
            for (const id of data.ids) {
                await visit(id);
            }
        } catch (e) {
            console.error(e);
        }

        await sleep(2000);
    }
};

console.log('Starting loop');

loop()
    .then(() => {
        process.exit(0);
    })
    .catch(err => {
        console.error(err);
        process.exit(1);
    });

