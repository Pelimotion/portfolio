import https from 'https';

function supabaseGet(supabaseUrl, path, serviceKey) {
    return new Promise((resolve, reject) => {
        const url = new URL(path, supabaseUrl);
        https.get(url.href, {
            headers: { 'Authorization': `Bearer ${serviceKey}`, 'apikey': serviceKey }
        }, (res) => {
            let body = '';
            res.on('data', chunk => body += chunk);
            res.on('end', () => {
                try { resolve(JSON.parse(body)); } catch { resolve(null); }
            });
        }).on('error', reject);
    });
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
            const user = await supabaseGet(supabaseUrl, '/auth/v1/user', token);
            if (!user?.id) return res.status(200).json({ role: null });
            const rows = await supabaseGet(supabaseUrl, `/rest/v1/profiles?id=eq.${user.id}&select=role,email`, serviceKey);
            const role = Array.isArray(rows) ? rows[0]?.role || null : null;
            return res.status(200).json({ role, email: rows?.[0]?.email || user.email });
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
