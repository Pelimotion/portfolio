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
        const bodyData = options.body ? JSON.stringify(options.body) : null;
        const headers = { ...defaultHeaders, ...options.headers };
        if (bodyData) headers['Content-Length'] = Buffer.byteLength(bodyData);

        const req = https.request(url, {
            method: options.method || 'GET',
            headers: headers
        }, (res) => {
            let body = '';
            res.on('data', chunk => body += chunk);
            res.on('end', () => {
                if (res.statusCode >= 400) reject(new Error(`Supabase Error (${res.statusCode}): ${body}`));
                else resolve(JSON.parse(body || '[]'));
            });
        });
        req.on('error', reject);
        if (bodyData) req.write(bodyData);
        req.end();
    });
}

export default async function handler(req, res) {
    try {
        if (req.method === 'GET') {
            const posts = await supabaseFetch('blog_posts?select=*&order=updated_at.desc');
            // Format to match the old local structure for frontend compatibility
            const formatted = posts.map(p => ({
                id: p.id,
                fileName: `${p.slug}.md`,
                data: {
                    ...p.data,
                    title: p.title,
                    slug: p.slug,
                    status: p.status,
                    category: p.category,
                    metaDescription: p.meta_description,
                    metaTitle: p.meta_title,
                    heroPrompt: p.hero_prompt
                },
                content: p.content
            }));
            return res.status(200).json(formatted);
        }

        if (req.method === 'POST') {
            const body = req.body;
            const slug = body.slug || (body.data && body.data.slug);
            if (!slug) throw new Error("Slug é obrigatório para salvar.");

            const postData = {
                slug: slug,
                title: body.title || (body.data && body.data.title),
                content: body.content,
                status: body.status || (body.data && body.data.status) || 'draft',
                category: body.category || (body.data && body.data.category),
                meta_description: body.meta_description || (body.data && body.data.metaDescription),
                meta_title: body.meta_title || (body.data && body.data.metaTitle),
                data: body.data || {},
                updated_at: new Date().toISOString()
            };

            // Proper Supabase Upsert: POST with on_conflict and resolution=merge-duplicates
            const result = await supabaseFetch('blog_posts?on_conflict=slug', {
                method: 'POST',
                headers: { 
                    'Prefer': 'resolution=merge-duplicates,return=representation',
                    'Content-Type': 'application/json'
                },
                body: postData
            });

            return res.status(200).json({ success: true, result });
        }

        res.status(405).end();
    } catch (error) {
        console.error('API Posts Error:', error);
        res.status(500).json({ error: error.message });
    }
}
