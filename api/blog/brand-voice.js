const https = require('https');

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_ANON_KEY;

async function supabaseFetch(path) {
    const url = `${SUPABASE_URL}/rest/v1/${path}`;
    const headers = {
        'apikey': SUPABASE_KEY,
        'Authorization': `Bearer ${SUPABASE_KEY}`
    };

    return new Promise((resolve, reject) => {
        const req = https.request(url, { method: 'GET', headers }, (res) => {
            let body = '';
            res.on('data', chunk => body += chunk);
            res.on('end', () => {
                if (res.statusCode >= 400) resolve([]); // Fallback to empty if table doesn't exist yet
                else {
                    try { resolve(JSON.parse(body)); } catch(e) { resolve([]); }
                }
            });
        });
        req.on('error', () => resolve([]));
        req.end();
    });
}

export default async function handler(req, res) {
    try {
        const supabaseRules = await supabaseFetch('studio_guidelines?select=*&order=created_at.desc');
        const context = supabaseRules.map(r => `[${r.section}]: ${r.content}`).join('\n\n');
        res.status(200).json({ content: context });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}
