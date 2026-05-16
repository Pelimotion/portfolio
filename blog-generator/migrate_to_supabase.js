const fs = require('fs');
const path = require('path');
const matter = require('gray-matter');
const https = require('https');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;
const POSTS_DIR = path.join(__dirname, 'content', 'posts');

async function supabaseFetch(path, options = {}) {
    const url = `${SUPABASE_URL}/rest/v1/${path}`;
    const defaultHeaders = {
        'apikey': SUPABASE_KEY,
        'Authorization': `Bearer ${SUPABASE_KEY}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=representation'
    };
    return new Promise((resolve, reject) => {
        const req = https.request(url, { method: options.method || 'GET', headers: { ...defaultHeaders, ...options.headers } }, (res) => {
            let body = '';
            res.on('data', chunk => body += chunk);
            res.on('end', () => resolve(JSON.parse(body || '[]')));
        });
        req.on('error', reject);
        if (options.body) req.write(JSON.stringify(options.body));
        req.end();
    });
}

async function migrate() {
    const files = fs.readdirSync(POSTS_DIR).filter(f => f.endsWith('.md'));
    for (const file of files) {
        console.log(`Migrating ${file}...`);
        const content = fs.readFileSync(path.join(POSTS_DIR, file), 'utf-8');
        const parsed = matter(content);
        const data = parsed.data;
        const postData = {
            slug: data.slug || file.replace('.md', ''),
            title: data.title || 'Untitled',
            content: parsed.content,
            status: data.status || 'published',
            category: data.category || 'General',
            meta_description: data.metaDescription || '',
            hero_prompt: data.heroPrompt || '',
            data: data,
            created_at: data.date || new Date().toISOString()
        };
        await supabaseFetch('blog_posts', {
            method: 'POST',
            headers: { 'Prefer': 'resolution=merge-duplicates' },
            body: postData
        });
    }
    console.log('Migration done.');
}
migrate();
