const fs = require('fs');
const https = require('https');

// Simple .env parser
const env = fs.readFileSync('.env', 'utf8').split('\n').reduce((acc, line) => {
    const [key, ...val] = line.split('=');
    if (key && val.length > 0) acc[key.trim()] = val.join('=').trim();
    return acc;
}, {});

const SUPABASE_URL = env.SUPABASE_URL;
const SUPABASE_KEY = env.SUPABASE_SERVICE_ROLE_KEY || env.SUPABASE_ANON_KEY;

async function supabaseFetch(path) {
    const url = `${SUPABASE_URL}/rest/v1/${path}`;
    const headers = {
        'apikey': SUPABASE_KEY,
        'Authorization': `Bearer ${SUPABASE_KEY}`,
        'Content-Type': 'application/json'
    };

    return new Promise((resolve, reject) => {
        const req = https.request(url, { method: 'GET', headers }, (res) => {
            let body = '';
            res.on('data', chunk => body += chunk);
            res.on('end', () => resolve(JSON.parse(body || '[]')));
        });
        req.on('error', reject);
        req.end();
    });
}

async function run() {
    try {
        const posts = await supabaseFetch('blog_posts?select=*&order=updated_at.desc');
        console.log('--- POSTS IN SUPABASE ---');
        posts.forEach(p => {
            console.log(`SLUG: ${p.slug} | STATUS: ${p.status} | UPDATED: ${p.updated_at}`);
        });
    } catch (e) {
        console.error(e);
    }
}

run();
