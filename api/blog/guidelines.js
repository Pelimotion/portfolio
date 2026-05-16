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
    if (req.method === 'GET') {
        const { category, section } = req.query;
        let query = 'studio_guidelines?select=*&order=created_at.desc';
        if (category) query += `&category=eq.${category}`;
        if (section) query += `&section=eq.${section}`;
        try {
            const data = await supabaseFetch(query);
            return res.status(200).json(data);
        } catch (e) {
            return res.status(500).json({ error: e.message });
        }
    }
    
    if (req.method !== 'POST') return res.status(405).end();

    const { section, content, category, presetName, isActive } = req.body;

    try {
        // If this is set as active, deactivate others in the same section/category
        if (isActive) {
            await supabaseFetch(`studio_guidelines?section=eq.${section}&category=eq.${category}`, {
                method: 'PATCH',
                body: { is_active: false }
            });
        }

        await supabaseFetch('studio_guidelines', {
            method: 'POST',
            body: { 
                section, 
                content, 
                category: category || 'Geral', 
                preset_name: presetName || 'Sem nome', 
                is_active: isActive || false 
            }
        });
        res.status(200).json({ success: true });
    } catch (error) {
        console.error('API Guidelines Error:', error);
        res.status(500).json({ error: error.message });
    }
}
