const https = require('https');

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;

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
        const posts = await supabaseFetch('blog_posts?select=slug,status,updated_at&order=updated_at.desc');
        console.log('--- POSTS IN SUPABASE ---');
        console.table(posts);
        
        // Check for duplicates (shouldn't happen if constraint exists)
        const counts = {};
        posts.forEach(p => counts[p.slug] = (counts[p.slug] || 0) + 1);
        const dups = Object.entries(counts).filter(([s, c]) => c > 1);
        if (dups.length > 0) console.log('DUPLICATES FOUND:', dups);
        else console.log('No duplicates found.');
        
    } catch (e) {
        console.error(e);
    }
}

run();
