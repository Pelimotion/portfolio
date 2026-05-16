const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
const { marked } = require('marked');
const matter = require('gray-matter');

const CONTENT_DIR = path.join(__dirname, 'content');
const BLOG_OUT_DIR = path.join(__dirname, '..', 'blog');
const EN_BLOG_OUT_DIR = path.join(__dirname, '..', 'en', 'blog');

const DOMAIN = 'https://pelimotion.art';
const CDN_URL = 'https://pelimotion-portfolio.b-cdn.net';

// Setup directories
['', 'vagas', 'eventos', 'recursos', 'categoria'].forEach(dir => {
    if (!fs.existsSync(path.join(BLOG_OUT_DIR, dir))) fs.mkdirSync(path.join(BLOG_OUT_DIR, dir), { recursive: true });
    if (!fs.existsSync(path.join(EN_BLOG_OUT_DIR, dir))) fs.mkdirSync(path.join(EN_BLOG_OUT_DIR, dir), { recursive: true });
});

function calculateReadingTime(text) {
    if (!text) return 1;
    const wordCount = text.trim().split(/\s+/).length;
    return Math.max(1, Math.ceil(wordCount / 200));
}

function formatDate(dateString, lang) {
    if (!dateString) return '';
    const date = new Date(dateString);
    if (lang === 'pt') {
        return new Intl.DateTimeFormat('pt-BR', { day: 'numeric', month: 'short', year: 'numeric' }).format(date);
    }
    return new Intl.DateTimeFormat('en-US', { month: 'long', day: 'numeric', year: 'numeric' }).format(date);
}

const GLOBAL_CSS = `
    :root {
        --bg-primary: #0a0a0a;
        --bg-secondary: #111111;
        --bg-tertiary: #1a1a1a;
        --text-primary: #f0ede8;
        --text-secondary: #666666;
        --accent: #f0ede8;
        --accent-warm: #e8d5a3;
        --border: #1e1e1e;
        --font-display: 'Barlow Condensed', sans-serif;
        --font-editorial: 'Playfair Display', serif;
        --font-mono: 'DM Mono', monospace;
        --wordmark-size: clamp(60px, 15vw, 140px);
        --card-title: clamp(16px, 2vw, 22px);
        --meta-size: 11px;
        --body-size: 14px;
        --max-width: 1400px;
        --gutter: 40px;
    }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: 'DM Mono', 'IBM Plex Sans', monospace, sans-serif; background: var(--bg-primary); color: var(--text-primary); line-height: 1.75; overflow-x: hidden; }
    h1, h2, h3, .playfair { font-family: var(--font-editorial); font-weight: 700; color: var(--text-primary); }
    a { text-decoration: none; color: inherit; }
    .progress-bar { position: fixed; top: 0; left: 0; height: 2px; background: var(--accent-warm); width: 0%; z-index: 1000; transition: width 100ms linear; }
    
    .blog-header { display: flex; justify-content: space-between; align-items: center; padding: 20px var(--gutter); border-bottom: 1px solid var(--border); position: sticky; top: 0; background: rgba(10,10,10,0.92); backdrop-filter: blur(12px); z-index: 1000; }
    .blog-logo { font-family: var(--font-mono); font-size: 13px; letter-spacing: 0.15em; text-transform: uppercase; color: var(--text-primary); }
    .blog-logo-sub { font-size: 9px; letter-spacing: 0.2em; color: var(--text-secondary); vertical-align: middle; margin-left: 8px; }
    .blog-nav { display: flex; gap: 32px; align-items: center; font-family: var(--font-mono); font-size: 12px; letter-spacing: 0.08em; }
    .blog-nav a { color: var(--text-secondary); transition: color 0.2s ease; }
    .blog-nav a:hover, .blog-nav a.active { color: var(--accent); }
    
    .blog-wordmark { font-family: var(--font-display); font-size: var(--wordmark-size); font-weight: 900; line-height: 0.85; letter-spacing: -0.03em; color: var(--text-primary); text-transform: uppercase; padding: 40px var(--gutter) 20px; }
    .container { max-width: var(--max-width); margin: 0 auto; padding: 0 var(--gutter); }
    .page-title { margin: 2rem 0 1.5rem; font-size: 36px; border-bottom: 1px solid var(--border); padding-bottom: 1rem; }
    
    .blog-footer { border-top: 1px solid var(--border); padding: 3rem 2rem; text-align: center; font-family: var(--font-mono); font-size: 12px; color: var(--text-secondary); margin-top: 5rem; }
    
    .fade-in-up { animation: fadeInUp 600ms cubic-bezier(0.16, 1, 0.3, 1) forwards; }
    @keyframes fadeInUp { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }
    
    @media (max-width: 767px) { 
        :root { --gutter: 20px; } 
        .blog-nav { display: flex; gap: 12px; font-size: 10px; } 
        .blog-logo-sub { display: none; }
    }
`;

function getHeader(lang, active = '') {
    const isPt = lang === 'pt';
    const prefix = isPt ? '/blog' : '/en/blog';
    return `
    <div class="progress-bar" id="progressBar"></div>
    <header class="blog-header">
        <div class="blog-logo">
            <a href="${prefix}">PELIMOTION</a> <span class="blog-logo-sub">HUB</span>
        </div>
        <nav class="blog-nav">
            <a href="${prefix}" class="${active==='blog'?'active':''}">${isPt ? 'Artigos' : 'Articles'}</a>
            <a href="${prefix}/vagas" class="${active==='vagas'?'active':''}">${isPt ? 'Vagas' : 'Jobs'}</a>
            <a href="${prefix}/eventos" class="${active==='eventos'?'active':''}">${isPt ? 'Eventos' : 'Events'}</a>
            <a href="${prefix}/recursos" class="${active==='recursos'?'active':''}">${isPt ? 'Recursos' : 'Resources'}</a>
        </nav>
    </header>
    `;
}

function getFooter() {
    return `
    <footer class="blog-footer">
        <p>© Pelimotion Studio Hub. Construído com automação e inspiração.</p>
    </footer>
    `;
}

function createHtml(post) {
    const readingTime = calculateReadingTime(post.content);
    const formattedDate = formatDate(post.data.date, post.data.lang || 'pt');
    const isPt = (post.data.lang || 'pt') === 'pt';
    
    const renderer = new marked.Renderer();
    renderer.heading = function({text, depth}) {
      if (depth === 2) {
          const id = text.toLowerCase().replace(/[^a-z0-9]+/g, '-');
          return `<h2 id="${id}">${text}</h2>`;
      }
      return `<h${depth}>${text}</h${depth}>`;
    };
    
    // Replace image placeholders with CDN paths
    let processedContent = post.content;
    let heroImageUrl = post.data.heroImage || '';

    if (post.data.images && post.data.images.length > 0) {
        post.data.images.forEach(img => {
            const imgUrl = img.url ? (img.url.startsWith('http') ? img.url : `${CDN_URL}${img.url}`) : '';
            if (!imgUrl) return;

            // Replace [ID] or ID.jpg with the URL
            const regex = new RegExp(`\\[${img.id}\\]`, 'g');
            processedContent = processedContent.replace(regex, `![${post.data.title}](${imgUrl})`);
            
            const fileRegex = new RegExp(`${img.id}\\.jpg`, 'g');
            processedContent = processedContent.replace(fileRegex, imgUrl);

            if (img.id === 'hero') heroImageUrl = imgUrl;
        });
    }

    // Fallback hero logic
    if (!heroImageUrl && post.data.slug) {
        heroImageUrl = `${CDN_URL}/blog/assets/${post.data.slug}/hero.jpg`;
    }

    marked.setOptions({ renderer });

    return `<!DOCTYPE html>
<html lang="${post.data.lang || 'pt'}">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${post.data.metaTitle}</title>
    <link href="https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@900&family=DM+Mono:ital,wght@0,300;0,400;0,500;1,300&family=IBM+Plex+Sans:ital,wght@0,400;0,500;0,600;1,400&family=Playfair+Display:ital,wght@0,400;0,600;0,700;1,400&display=swap" rel="stylesheet">
    <style>
        ${GLOBAL_CSS}
        .post-hero { position: relative; width: 100%; height: 60vh; display: flex; align-items: flex-end; padding: 4rem 2rem; background-image: linear-gradient(to top, rgba(10,10,10,1) 0%, rgba(10,10,10,0.4) 60%, rgba(10,10,10,0.1) 100%), url('${heroImageUrl}'); background-size: cover; background-position: center; }
        .post-hero-content { max-width: 800px; margin: 0 auto; width: 100%; }
        .category-pill { display: inline-block; background: var(--accent); color: var(--bg-primary); font-family: var(--font-mono); font-size: 10px; font-weight: 500; padding: 4px 8px; border-radius: 2px; margin-bottom: 1.5rem; text-transform: uppercase; }
        .post-h1 { font-size: clamp(36px, 5vw, 64px); margin-bottom: 1.5rem; line-height: 1.1; }
        .post-meta { font-family: var(--font-mono); font-size: 13px; color: var(--text-secondary); }
        .post-content { font-family: 'IBM Plex Sans', sans-serif; font-size: 17px; max-width: 680px; margin: 4rem auto; width: 100%; padding: 0 2rem; }
        .post-content p { margin-bottom: 1.5rem; }
        .post-content h2 { font-size: 28px; margin-top: 3.5rem; margin-bottom: 1.5rem; }
        .post-content img { max-width: 100%; height: auto; margin: 2.5rem 0; border-radius: 2px; }
    </style>
</head>
<body>
    ${getHeader(post.data.lang || 'pt', 'blog')}
    <section class="post-hero">
        <div class="post-hero-content">
            <div class="category-pill fade-in-up">${post.data.category}</div>
            <h1 class="post-h1 playfair fade-in-up">${post.data.title}</h1>
            <div class="post-meta fade-in-up">
                ${formattedDate} · ${readingTime} min de leitura · ${(post.data.lang || 'pt').toUpperCase()}
            </div>
        </div>
    </section>
    <article class="post-content fade-in-up">
        ${marked.parse(processedContent)}
    </article>
    ${getFooter()}
</body>
</html>`;
}

function createIndexHtml(posts, lang, customTitle = null, isTagPage = false) {
    const title = customTitle || (lang === 'pt' ? 'Pelimotion Hub' : 'Pelimotion Hub');
    const outDir = lang === 'pt' ? BLOG_OUT_DIR : EN_BLOG_OUT_DIR;
    const isPt = lang === 'pt';
    const sortedPosts = [...posts].filter(p => p.data.slug).sort((a, b) => new Date(b.data.date || Date.now()) - new Date(a.data.date || Date.now()));

    let html = `<!DOCTYPE html>
<html lang="${lang}">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title}</title>
    <link href="https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@900&family=DM+Mono:ital,wght@0,300;0,400;0,500;1,300&family=IBM+Plex+Sans:ital,wght@0,400;0,500;0,600;1,400&family=Playfair+Display:ital,wght@0,400;0,600;0,700;1,400&display=swap" rel="stylesheet">
    <style>
        ${GLOBAL_CSS}
        .posts-grid { display: grid; grid-template-columns: repeat(3, 1fr); border-left: 1px solid var(--border); border-top: 1px solid var(--border); margin-bottom: 4rem; }
        @media (max-width: 1023px) { .posts-grid { grid-template-columns: repeat(2, 1fr); } }
        @media (max-width: 767px) { .posts-grid { grid-template-columns: 1fr; } }
        .post-card { border-right: 1px solid var(--border); border-bottom: 1px solid var(--border); padding: 16px; display: flex; flex-direction: column; gap: 12px; transition: 200ms ease; }
        .post-card:hover { background: var(--bg-secondary); }
        .card-meta-top { display: flex; justify-content: space-between; }
        .card-date, .card-category-pill { font-family: var(--font-mono); font-size: 9px; color: var(--text-secondary); text-transform: uppercase; }
        .card-image-wrapper { aspect-ratio: 4/3; overflow: hidden; background: var(--bg-secondary); }
        .card-image { width: 100%; height: 100%; object-fit: cover; }
        .card-title { font-size: 20px; line-height: 1.25; margin: 0.5rem 0; }
        .card-excerpt { font-family: var(--font-mono); font-size: 13px; color: var(--text-secondary); flex: 1; }
        .card-meta-bottom { display: flex; justify-content: space-between; padding-top: 12px; border-top: 1px solid var(--border); font-family: var(--font-mono); font-size: 11px; color: var(--text-secondary); }
    </style>
</head>
<body>
    ${getHeader(lang, 'blog')}
    ${!isTagPage ? `<div class="blog-wordmark fade-in-up">JOURNAL</div>` : `<div class="container"><h1 class="page-title playfair fade-in-up">${title}</h1></div>`}
    <main class="container">
        <div class="posts-grid">
             ${sortedPosts.map((post, i) => {
                const thumbImage = post.data.thumbImage || post.data.heroImage || '';
                const thumbUrl = (thumbImage && thumbImage.startsWith('http')) ? thumbImage : (thumbImage ? `${CDN_URL}${thumbImage}` : '/assets/default-thumb.jpg');
                return `
                <article class="post-card fade-in-up" style="animation-delay: ${(i%3)*100}ms">
                    <div class="card-meta-top">
                        <time class="card-date">${formatDate(post.data.date, lang)}</time>
                        <span class="card-category-pill" style="border:1px solid var(--border);padding:2px 6px;border-radius:100px">${post.data.category}</span>
                    </div>
                    <div class="card-image-wrapper">
                        <img class="card-image" src="${thumbUrl}" alt="" loading="lazy">
                    </div>
                    <h2 class="card-title playfair"><a href="${isPt?'/blog':'/en/blog'}/${post.data.slug}">${post.data.title}</a></h2>
                    <p class="card-excerpt">${post.data.metaDescription}</p>
                    <div class="card-meta-bottom">
                        <span><strong>TEXTO</strong> · Pelimotion</span>
                        <span><strong>LEITURA</strong> · ${calculateReadingTime(post.content)} min</span>
                    </div>
                </article>`;
            }).join('')}
        </div>
    </main>
    ${getFooter()}
</body>
</html>`;

    const outPath = isTagPage ? path.join(outDir, 'categoria', `${customTitle.toLowerCase().replace(/\s+/g,'-')}.html`) : path.join(outDir, 'index.html');
    fs.writeFileSync(outPath, html);
}

function parseDirectory(dirName) {
    const dirPath = path.join(CONTENT_DIR, dirName);
    if (!fs.existsSync(dirPath)) return [];
    return fs.readdirSync(dirPath).filter(f => f.endsWith('.md')).map(file => {
        const fileContent = fs.readFileSync(path.join(dirPath, file), 'utf-8');
        const parsed = matter(fileContent);
        parsed.fileName = file;
        return parsed;
    });
}

async function build() {
    console.log('Starting build...');
    let posts = parseDirectory('posts');
    
    // Fetch from Supabase if credentials exist
    if (process.env.SUPABASE_URL) {
        console.log('Fetching from Supabase...');
        const https = require('https');
        const SUPABASE_URL = process.env.SUPABASE_URL;
        const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;
        
        const dbPosts = await new Promise((resolve) => {
            const url = `${SUPABASE_URL}/rest/v1/blog_posts?select=*&status=eq.published`;
            https.get(url, { headers: { 'apikey': SUPABASE_KEY, 'Authorization': `Bearer ${SUPABASE_KEY}` } }, (res) => {
                let body = '';
                res.on('data', d => body += d);
                res.on('end', () => resolve(JSON.parse(body || '[]')));
            });
        });
        
        dbPosts.forEach(p => {
            posts.push({
                data: {
                    ...p.data,
                    slug: p.slug,
                    title: p.title,
                    status: p.status,
                    category: p.category,
                    metaDescription: p.meta_description,
                    heroPrompt: p.hero_prompt,
                    date: p.created_at
                },
                content: p.content
            });
        });
    }

    // Filter out duplicates (prefer local if slug matches)
    const uniquePosts = [];
    const seenSlugs = new Set();
    posts.forEach(p => {
        if (!seenSlugs.has(p.data.slug)) {
            uniquePosts.push(p);
            seenSlugs.add(p.data.slug);
        }
    });

    // Filter out drafts
    const finalPosts = uniquePosts.filter(post => post.data.status !== 'draft');

    for (const post of finalPosts) {
        if (!post.data.slug) continue;

        const outDir = (post.data.lang || 'pt') === 'pt' ? BLOG_OUT_DIR : EN_BLOG_OUT_DIR;
        fs.writeFileSync(path.join(outDir, `${post.data.slug}.html`), createHtml(post));
    }

    const ptPosts = finalPosts.filter(p => p.data.slug && (p.data.lang || 'pt') === 'pt');
    if (ptPosts.length > 0) createIndexHtml(ptPosts, 'pt');

    console.log('Build complete.');
}

build();
