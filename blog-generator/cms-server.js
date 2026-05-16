const http = require('http');
const fs = require('fs');
const path = require('path');
const matter = require('gray-matter');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
const { generateText } = require('./services/textProvider');
const { generatePostImages } = require('./services/imageProvider');

const CONTENT_DIR = path.join(__dirname, 'content', 'posts');
const PORT = 4000;

// Supabase Configuration
const SUPABASE_URL = process.env.SUPABASE_URL || 'https://gfaqnkmmbozmhroicqyc.supabase.co';
const SUPABASE_KEY = process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdmYXFua21tYm96bWhyb2ljcXljIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg2OTcxNDQsImV4cCI6MjA5NDI3MzE0NH0.vYhdQjfr1d92t_uhU504XyP2UxkANUO96X1hKOu3e-g';

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

function parseDirectory() {
    if (!fs.existsSync(CONTENT_DIR)) return [];
    return fs.readdirSync(CONTENT_DIR).filter(f => f.endsWith('.md')).map(file => {
        const fileContent = fs.readFileSync(path.join(CONTENT_DIR, file), 'utf-8');
        const parsed = matter(fileContent);
        return {
            fileName: file,
            data: parsed.data,
            content: parsed.content
        };
    });
}

function savePost(post) {
    if (!fs.existsSync(CONTENT_DIR)) fs.mkdirSync(CONTENT_DIR, { recursive: true });
    const { fileName, data, content } = post;
    
    // REQUIREMENT: Force status to 'draft' for safety, unless manually override (which we will handle in UI)
    // Actually, the user says "todo post gerado seja salvo estritamente com o status de Draft".
    // This means we overwrite whatever came from the frontend if we want to be strict.
    data.status = 'draft'; 

    const fileContent = matter.stringify(content, data);
    fs.writeFileSync(path.join(CONTENT_DIR, fileName), fileContent, 'utf-8');
}

function deletePost(fileName) {
    const filePath = path.join(CONTENT_DIR, fileName);
    if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
    }
}

const server = http.createServer(async (req, res) => {
    // Basic CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        res.writeHead(204);
        res.end();
        return;
    }

    if (req.url === '/' && req.method === 'GET') {
        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.end(fs.readFileSync(path.join(__dirname, 'cms.html')));
    } else if (req.url === '/api/posts' && req.method === 'GET') {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(parseDirectory()));
    } else if (req.url === '/api/posts' && req.method === 'POST') {
        let body = '';
        req.on('data', chunk => body += chunk);
        req.on('end', () => {
            try {
                const post = JSON.parse(body);
                savePost(post);
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ success: true }));
            } catch (e) {
                res.writeHead(500, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: e.message }));
            }
        });
    } else if (req.url.startsWith('/api/posts/') && req.method === 'DELETE') {
        const fileName = req.url.split('/').pop();
        try {
            deletePost(fileName);
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ success: true }));
        } catch (e) {
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: e.message }));
        }
    } else if (req.url === '/api/generate-text' && req.method === 'POST') {
        let body = '';
        req.on('data', chunk => body += chunk);
        req.on('end', async () => {
            try {
                const { prompt, modelType } = JSON.parse(body);
                const text = await generateText(prompt, modelType);
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ text }));
            } catch (e) {
                res.writeHead(500, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: e.message }));
            }
        });
    } else if (req.url === '/api/upload-image' && req.method === 'POST') {
        let body = '';
        req.on('data', chunk => body += chunk);
        req.on('end', async () => {
            try {
                const { imageData, slug, imageName } = JSON.parse(body);
                const buffer = Buffer.from(imageData.split(',')[1], 'base64');
                const assetsDir = path.join(__dirname, '..', 'blog', 'assets', slug);
                if (!fs.existsSync(assetsDir)) fs.mkdirSync(assetsDir, { recursive: true });
                const filePath = path.join(assetsDir, `${imageName}.jpg`);
                fs.writeFileSync(filePath, buffer);
                
                // Also upload to Bunny if provider is loaded
                try {
                    const { generatePostImages } = require('./services/imageProvider');
                    // We don't call generatePostImages because that triggers AI, 
                    // but we need the uploadToBunny logic which is private in that file.
                    // For now, saving locally is enough as sync_bunny script can handle it,
                    // but let's try to expose it if possible.
                } catch(e) {}

                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ success: true }));
            } catch (e) {
                res.writeHead(500, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: e.message }));
            }
        });
    } else if (req.url === '/api/brand-voice' && req.method === 'GET') {
        try {
            // First try Supabase for latest guidelines (cumulativo)
            let supabaseRules = [];
            try {
                supabaseRules = await supabaseFetch('studio_guidelines?select=*&order=created_at.desc');
            } catch (e) {
                console.error("Supabase guidelines fetch failed, using local fallback.");
            }

            const claudePath = path.join(__dirname, '..', 'CLAUDE.md');
            let localContent = fs.existsSync(claudePath) ? fs.readFileSync(claudePath, 'utf-8') : '';
            
            // Merge or prioritize
            const brandContext = supabaseRules.length > 0 
                ? supabaseRules.map(r => `[${r.section}]: ${r.content}`).join('\n\n')
                : localContent;

            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ content: brandContext }));
        } catch (e) {
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: e.message }));
        }
    } else if (req.url === '/api/guidelines' && req.method === 'POST') {
        let body = '';
        req.on('data', chunk => body += chunk);
        req.on('end', async () => {
            try {
                const { section, content } = JSON.parse(body);
                // Save to Supabase (cumulativo)
                await supabaseFetch('studio_guidelines', {
                    method: 'POST',
                    body: { section, content }
                });

                // Also update local CLAUDE.md if needed (optional but good for sync)
                const claudePath = path.join(__dirname, '..', 'CLAUDE.md');
                let localContent = fs.existsSync(claudePath) ? fs.readFileSync(claudePath, 'utf-8') : '';
                // Simple append or replacement based on section header
                const sectionHeader = `## ${section}`;
                if (localContent.includes(sectionHeader)) {
                    const parts = localContent.split(sectionHeader);
                    const rest = parts[1].split('##');
                    localContent = parts[0] + sectionHeader + '\n' + content + '\n' + (rest.length > 1 ? '##' + rest.slice(1).join('##') : '');
                } else {
                    localContent += `\n\n## ${section}\n${content}`;
                }
                fs.writeFileSync(claudePath, localContent);

                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ success: true }));
            } catch (e) {
                res.writeHead(500, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: e.message }));
            }
        });
    } else if (req.url === '/api/generate-image' && req.method === 'POST') {
        let body = '';
        req.on('data', chunk => body += chunk);
        req.on('end', async () => {
            try {
                const { prompt, slug, imageName } = JSON.parse(body);
                await generatePostImages(prompt, slug, imageName);
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ success: true }));
            } catch (e) {
                res.writeHead(500, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: e.message }));
            }
        });
    } else {
        res.writeHead(404);
        res.end();
    }
});

server.listen(PORT, () => {
    console.log(`CMS Server running at http://localhost:${PORT}`);
});
