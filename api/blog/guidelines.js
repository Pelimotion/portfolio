const https = require('https');

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;

async function supabaseFetch(path, options = {}) {
    const url = `${SUPABASE_URL}/rest/v1/${path}`;
    const defaultHeaders = {
        'apikey': SUPABASE_KEY,
        'Authorization': `Bearer ${SUPABASE_KEY}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=representation'
    };

    return new Promise((resolve, reject) => {
        const req = https.request(url, {
            method: options.method || 'GET',
            headers: { ...defaultHeaders, ...options.headers }
        }, (res) => {
            let body = '';
            res.on('data', chunk => body += chunk);
            res.on('end', () => {
                if (res.statusCode >= 400) reject(new Error(`Supabase Error: ${body}`));
                else resolve(JSON.parse(body || '{}'));
            });
        });
        req.on('error', reject);
        if (options.body) req.write(JSON.stringify(options.body));
        req.end();
    });
}

export default async function handler(req, res) {
    if (req.method !== 'POST') return res.status(405).end();

    const { section, content } = req.body;

    try {
        await supabaseFetch('studio_guidelines', {
            method: 'POST',
            body: { section, content }
        });
        res.status(200).json({ success: true });
    } catch (error) {
        console.error('API Guidelines Error:', error);
        res.status(500).json({ error: error.message });
    }
}
