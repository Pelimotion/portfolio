export default async function handler(req, res) {
    if (req.method === 'POST') {
        const { token } = req.body || {};
        const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
        const supabaseUrl = process.env.SUPABASE_URL;
        const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

        if (!token || typeof token !== 'string' || !serviceKey || !supabaseUrl) {
            return res.status(200).json({ role: null });
        }

        try {
            // Cryptographically verify JWT token against Supabase Auth API
            const userResp = await fetch(`${supabaseUrl}/auth/v1/user`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'apikey': supabaseAnonKey || serviceKey,
                },
            });

            if (!userResp.ok) {
                return res.status(200).json({ role: null });
            }

            const userData = await userResp.json();
            const userId = userData?.id;
            if (!userId) {
                return res.status(200).json({ role: null });
            }

            const profileResp = await fetch(
                `${supabaseUrl}/rest/v1/profiles?id=eq.${encodeURIComponent(userId)}&select=role,email`,
                {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${serviceKey}`,
                        'apikey': serviceKey,
                    },
                }
            );

            if (!profileResp.ok) {
                return res.status(200).json({ role: null });
            }

            const rows = await profileResp.json();
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
