const fs = require('fs');
const path = require('path');
const https = require('https');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const BUNNY_API_KEY = process.env.BUNNY_API_KEY;
const BUNNY_STORAGE_ZONE = process.env.BUNNY_STORAGE_ZONE;
const ASSETS_DIR = path.join(__dirname, '..', 'blog', 'assets');

async function uploadFile(localPath, remotePath) {
    const buffer = fs.readFileSync(localPath);
    const url = `https://storage.bunnycdn.com/${BUNNY_STORAGE_ZONE}${remotePath}`;
    const options = {
        method: 'PUT',
        headers: {
            'AccessKey': BUNNY_API_KEY,
            'Content-Type': 'image/jpeg',
            'Content-Length': buffer.length
        }
    };

    return new Promise((resolve) => {
        const req = https.request(url, options, (res) => {
            console.log(`Uploaded ${remotePath}: ${res.statusCode}`);
            resolve();
        });
        req.on('error', (e) => {
            console.error(e);
            resolve();
        });
        req.write(buffer);
        req.end();
    });
}

async function walk(dir) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
            await walk(fullPath);
        } else if (file.endsWith('.jpg')) {
            const relativePath = fullPath.split('blog/assets')[1];
            await uploadFile(fullPath, `/blog/assets${relativePath}`);
        }
    }
}

async function start() {
    if (!BUNNY_API_KEY || !BUNNY_STORAGE_ZONE) {
        console.error("Missing Bunny Keys");
        return;
    }
    console.log("Syncing blog assets to Bunny.net...");
    await walk(ASSETS_DIR);
    console.log("Done.");
}

start();
