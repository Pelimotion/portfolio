import https from 'https';

function httpsGet(url, headers) {
    return new Promise((resolve, reject) => {
        https.get(url, { headers }, (res) => {
            let body = '';
            res.on('data', chunk => body += chunk);
            res.on('end', () => {
                try { resolve(JSON.parse(body)); } catch { resolve(null); }
            });
        }).on('error', reject);
    });
}

function decodeJwtSub(token) {
    try {
        const payload = token.split('.')[1];
        return JSON.parse(Buffer.from(payload, 'base64').toString('utf8')).sub || null;
    } catch { return null; }
}

export default async function handler(req, res) {
    if (req.method === 'POST') {
        const { token } = req.body || {};
        const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
        const supabaseUrl = process.env.SUPABASE_URL;

        if (!token || !serviceKey || !supabaseUrl) {
            return res.status(200).json({ role: null });
        }
        try {
            const userId = decodeJwtSub(token);
            if (!userId) return res.status(200).json({ role: null });

            const rows = await httpsGet(
                `${supabaseUrl}/rest/v1/profiles?id=eq.${userId}&select=role,email`,
                { 'Authorization': `Bearer ${serviceKey}`, 'apikey': serviceKey }
            );
            const profile = Array.isArray(rows) ? rows[0] : null;
            return res.status(200).json({ role: profile?.role || null, email: profile?.email || null });
        } catch (e) {
            console.error('Profile lookup error:', e);
            return res.status(200).json({ role: null });
        }
    }

    res.setHeader('Cache-Control', 's-maxage=3600');
    res.status(200).json({
        supabaseUrl: process.env.SUPABASE_URL,
        supabaseAnonKey: process.env.SUPABASE_ANON_KEY,
    });
}
