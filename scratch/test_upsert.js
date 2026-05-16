const https = require('https');
const fs = require('fs');

const env = fs.readFileSync('.env', 'utf8').split('\n').reduce((acc, line) => {
    const [key, ...val] = line.split('=');
    if (key && val.length > 0) acc[key.trim()] = val.join('=').trim();
    return acc;
}, {});

async function testSave() {
    const postData = {
        slug: 'manual-marca-morto-gestao-identidade-digital',
        title: 'Manual de Marca Morto',
        status: 'published',
        category: 'Branding',
        meta_description: 'Teste de salvamento',
        hero_prompt: 'A test prompt',
        updated_at: new Date().toISOString()
    };

    const url = new URL(`${env.SUPABASE_URL}/rest/v1/blog_posts?on_conflict=slug`);
    const options = {
        method: 'POST',
        headers: {
            'apikey': env.SUPABASE_SERVICE_ROLE_KEY || env.SUPABASE_ANON_KEY,
            'Authorization': `Bearer ${env.SUPABASE_SERVICE_ROLE_KEY || env.SUPABASE_ANON_KEY}`,
            'Content-Type': 'application/json',
            'Prefer': 'resolution=merge-duplicates,return=representation'
        }
    };

    return new Promise((resolve, reject) => {
        const req = https.request(url, options, (res) => {
            let body = '';
            res.on('data', chunk => body += chunk);
            res.on('end', () => {
                console.log('STATUS:', res.statusCode);
                console.log('BODY:', body);
                resolve();
            });
        });
        req.on('error', reject);
        req.write(JSON.stringify(postData));
        req.end();
    });
}

testSave();
