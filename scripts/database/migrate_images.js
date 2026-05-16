const fs = require('fs');
const path = require('path');
const https = require('https');

// Manual .env parsing
const envPath = path.join(__dirname, '../../.env');
if (fs.existsSync(envPath)) {
    const env = fs.readFileSync(envPath, 'utf8');
    env.split('\n').forEach(line => {
        const [key, value] = line.split('=');
        if (key && value) process.env[key.trim()] = value.trim();
    });
}

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
                if (res.statusCode >= 400) reject(new Error(`Supabase Error ${res.statusCode}: ${body}`));
                else resolve(JSON.parse(body || '[]'));
            });
        });
        req.on('error', reject);
        if (options.body) req.write(JSON.stringify(options.body));
        req.end();
    });
}

async function run() {
    console.log('--- STARTING IMAGE MIGRATION ---');
    try {
        const posts = await supabaseFetch('blog_posts?select=id,data');
        console.log(`Found ${posts.length} posts.`);

        for (const post of posts) {
            const data = post.data || {};
            const imagesToMigrate = [];
            
            if (data.images) {
                imagesToMigrate.push(...data.images);
            }
            if (data.heroImage) {
                imagesToMigrate.push({ id: 'hero', url: data.heroImage, prompt: data.heroPrompt || '', role: 'hero' });
            }
            if (data.thumbImage) {
                imagesToMigrate.push({ id: 'thumb', url: data.thumbImage, prompt: '', role: 'thumb' });
            }

            if (imagesToMigrate.length === 0) continue;

            console.log(`Migrating ${imagesToMigrate.length} images for post ${post.id}...`);

            for (let i = 0; i < imagesToMigrate.length; i++) {
                const img = imagesToMigrate[i];
                if (!img.url) continue;

                let imageId;
                try {
                    const existing = await supabaseFetch(`blog_images?url=eq.${encodeURIComponent(img.url)}&select=id`);
                    if (existing.length > 0) {
                        imageId = existing[0].id;
                    } else {
                        const newImg = await supabaseFetch('blog_images', {
                            method: 'POST',
                            body: {
                                slug: img.id || `img-${Date.now()}-${i}`,
                                url: img.url,
                                prompt: img.prompt,
                                alt_text: img.prompt ? img.prompt.substring(0, 100) : ''
                            }
                        });
                        imageId = newImg[0].id;
                    }

                    await supabaseFetch('post_images', {
                        method: 'POST',
                        body: {
                            post_id: post.id,
                            image_id: imageId,
                            role: img.role || (i === 0 ? 'hero' : 'body'),
                            position: i,
                            placeholder_id: img.id || `img-${i}`
                        },
                        headers: { 'Prefer': 'resolution=merge-duplicates' }
                    });
                } catch (e) {
                    console.error(`Error migrating image ${img.url}:`, e.message);
                }
            }
        }
        console.log('--- MIGRATION COMPLETE ---');
    } catch (e) {
        console.error('Migration failed:', e.message);
    }
}

run();
