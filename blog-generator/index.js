const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
const { marked } = require('marked');
const matter = require('gray-matter');
const { generatePostImages } = require('./services/imageProvider');

const CONTENT_DIR = path.join(__dirname, 'content');
const BLOG_OUT_DIR = path.join(__dirname, '..', 'blog');
const EN_BLOG_OUT_DIR = path.join(__dirname, '..', 'en', 'blog');
const SITEMAP_PATH = path.join(__dirname, '..', 'sitemap.xml');
const ROBOTS_PATH = path.join(__dirname, '..', 'robots.txt');

const DOMAIN = 'http://pelimotion.art';

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
    h1, h2, .playfair { font-family: var(--font-editorial); font-weight: 700; color: var(--text-primary); }
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
    .blog-footer a { color: var(--text-primary); }
    
    .fade-in-up { animation: fadeInUp 600ms cubic-bezier(0.16, 1, 0.3, 1) forwards; }
    @keyframes fadeInUp { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }
    
    @media (max-width: 767px) { 
        :root { --gutter: 20px; } 
        .blog-nav { display: flex; gap: 12px; font-size: 10px; } 
        .blog-logo-sub { display: none; }
        .blog-wordmark { padding-top: 20px; }
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

// ----------------------------------------------------
// RSS GENERATOR
// ----------------------------------------------------
function createRss(posts, lang) {
    const isPt = lang === 'pt';
    const outDir = isPt ? BLOG_OUT_DIR : EN_BLOG_OUT_DIR;
    const prefix = isPt ? '/blog' : '/en/blog';
    
    let rss = `<?xml version="1.0" encoding="UTF-8" ?>
<rss version="2.0">
<channel>
    <title>Pelimotion Hub ${isPt ? '(PT)' : '(EN)'}</title>
    <link>${DOMAIN}${prefix}</link>
    <description>Motion Branding Insights & Curadoria</description>
    <language>${isPt ? 'pt-br' : 'en-us'}</language>`;

    posts.slice(0, 20).forEach(post => {
        rss += `
    <item>
        <title><![CDATA[${post.data.title}]]></title>
        <link>${DOMAIN}${prefix}/${post.data.slug}</link>
        <description><![CDATA[${post.data.metaDescription}]]></description>
        <pubDate>${new Date(post.data.date || Date.now()).toUTCString()}</pubDate>
        <guid>${DOMAIN}${prefix}/${post.data.slug}</guid>
    </item>`;
    });
    rss += `\n</channel>\n</rss>`;
    fs.writeFileSync(path.join(outDir, 'rss.xml'), rss);
}

// ----------------------------------------------------
// VAGAS & EVENTOS & RECURSOS GENERATORS
// ----------------------------------------------------
function createDirectoryPage(items, type, lang) {
    const isPt = lang === 'pt';
    const outDir = isPt ? BLOG_OUT_DIR : EN_BLOG_OUT_DIR;
    
    let title = '';
    if (type === 'vagas') title = isPt ? 'Vagas em Motion Design' : 'Motion Design Jobs';
    if (type === 'eventos') title = isPt ? 'Agenda de Eventos' : 'Events Calendar';
    if (type === 'recursos') title = isPt ? 'Recursos & Estúdios' : 'Resources & Studios';

    let listHtml = items.map((item, i) => `
        <div class="list-item fade-in-up" style="animation-delay: ${(i%5)*50}ms">
            <div class="item-meta">
                ${type === 'vagas' ? `<span class="location" data-location="${item.data.location}">${item.data.location}</span>` : ''}
                ${type === 'eventos' ? `<time>${formatDate(item.data.date, lang)}</time> <span class="location" data-location="${item.data.location}">${item.data.location}</span>` : ''}
                <span class="pill">${item.data.category || item.data.type || type}</span>
            </div>
            <h3 class="playfair"><a href="${item.data.url}" target="_blank" rel="noopener">${item.data.title} ↗</a></h3>
            <p>${item.data.description || ''}</p>
            ${type === 'vagas' ? `<span>${item.data.company}</span>` : ''}
        </div>
    `).join('');

    if (items.length === 0) {
        listHtml = `<p style="color: var(--text-secondary); margin-top: 2rem;">${isPt ? 'Nenhum item encontrado.' : 'No items found.'}</p>`;
    }

    let ipApiScript = '';
    if (type === 'vagas' || type === 'eventos') {
        ipApiScript = `
        <script>
            fetch('https://ipapi.co/json/')
                .then(r => r.json())
                .then(data => {
                    const country = data.country_name;
                    const status = document.getElementById('location-status');
                    if(country && status) {
                        status.innerHTML = 'Filtrando para: <strong style="color:var(--accent-warm)">' + country + '</strong>';
                    }
                }).catch(e => {
                    const status = document.getElementById('location-status');
                    if(status) status.style.display = 'none';
                });
        </script>`;
    }

    let html = `<!DOCTYPE html>
<html lang="${lang}">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title} | Pelimotion Hub</title>
    <link href="https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@900&family=DM+Mono:ital,wght@0,300;0,400;0,500;1,300&family=IBM+Plex+Sans:ital,wght@0,400;0,500;0,600;1,400&family=Playfair+Display:ital,wght@0,400;0,600;0,700;1,400&display=swap" rel="stylesheet">
    <style>
        ${GLOBAL_CSS}
        .list-container { max-width: 800px; margin: 0 auto; padding-top: 2rem; }
        .list-item { border-bottom: 1px solid var(--border); padding: 2rem 0; }
        .list-item h3 { font-size: 24px; margin-bottom: 0.5rem; }
        .list-item p { color: var(--text-secondary); font-size: 15px; margin-bottom: 1rem; }
        .item-meta { display: flex; gap: 1rem; font-family: var(--font-mono); font-size: 11px; color: var(--text-secondary); text-transform: uppercase; margin-bottom: 1rem; align-items: center; }
        .pill { border: 1px solid var(--border); padding: 2px 8px; border-radius: 100px; }
        #location-status { font-family: var(--font-mono); font-size: 12px; margin-bottom: 2rem; padding: 1rem; background: var(--bg-secondary); border-left: 2px solid var(--border); }
    </style>
</head>
<body>
    ${getHeader(lang, type)}
    <main class="container">
        <h1 class="page-title playfair fade-in-up">${title}</h1>
        <div class="list-container">
            ${(type === 'vagas' || type === 'eventos') ? `<div id="location-status" class="fade-in-up">Detectando localização...</div>` : ''}
            ${listHtml}
        </div>
    </main>
    ${getFooter()}
    ${ipApiScript}
</body>
</html>`;

    fs.writeFileSync(path.join(outDir, `${type}/index.html`), html);
}

// ----------------------------------------------------
// BLOG GENERATOR
// ----------------------------------------------------
function createHtml(post) {
    const readingTime = calculateReadingTime(post.content);
    const formattedDate = formatDate(post.data.date, post.data.lang || 'pt');
    const isPt = (post.data.lang || 'pt') === 'pt';
    const linkPrefix = isPt ? '/blog' : '/en/blog';

    const hreflang = isPt ? `<link rel="alternate" hreflang="en" href="${DOMAIN}/en/blog/${post.data.slug}" />` : `<link rel="alternate" hreflang="pt" href="${DOMAIN}/blog/${post.data.slug}" />`;

    const renderer = new marked.Renderer();
    renderer.heading = function({text, depth}) {
      if (depth === 2) {
          const id = text.toLowerCase().replace(/[^a-z0-9]+/g, '-');
          return `<h2 id="${id}">${text}</h2>`;
      }
      return `<h${depth}>${text}</h${depth}>`;
    };
    marked.setOptions({ renderer });

    return `<!DOCTYPE html>
<html lang="${post.data.lang || 'pt'}">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${post.data.metaTitle}</title>
    ${hreflang}
    <link href="https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@900&family=DM+Mono:ital,wght@0,300;0,400;0,500;1,300&family=IBM+Plex+Sans:ital,wght@0,400;0,500;0,600;1,400&family=Playfair+Display:ital,wght@0,400;0,600;0,700;1,400&display=swap" rel="stylesheet">
    <style>
        ${GLOBAL_CSS}
        .post-hero { position: relative; width: 100%; height: 60vh; display: flex; align-items: flex-end; padding: 4rem 2rem; background-image: linear-gradient(to top, rgba(10,10,10,1) 0%, rgba(10,10,10,0.4) 60%, rgba(10,10,10,0.1) 100%), url('${post.data.heroImage}'); background-size: cover; background-position: center; }
        .post-hero-content { max-width: 800px; margin: 0 auto; width: 100%; }
        .category-pill { display: inline-block; background: var(--accent); color: var(--bg-primary); font-family: var(--font-mono); font-size: 10px; font-weight: 500; padding: 4px 8px; border-radius: 2px; margin-bottom: 1.5rem; text-transform: uppercase; }
        .post-h1 { font-size: clamp(36px, 5vw, 64px); margin-bottom: 1.5rem; line-height: 1.1; }
        .post-meta { font-family: var(--font-mono); font-size: 13px; color: var(--text-secondary); }
        .post-content { font-family: 'IBM Plex Sans', sans-serif; font-size: 17px; max-width: 680px; margin: 4rem auto; width: 100%; padding: 0 2rem; }
        .post-content p { margin-bottom: 1.5rem; }
        .post-content h2 { font-size: 28px; margin-top: 3.5rem; margin-bottom: 1.5rem; }
        .post-content a { color: var(--accent); text-decoration: underline; transition: 0.2s; }
        .post-content img { max-width: 100%; height: auto; margin: 2rem 0; }
        .newsletter-box { background: var(--bg-secondary); border: 1px solid var(--border); padding: 2rem; margin: 4rem 0; text-align: center; }
        .newsletter-box h4 { font-family: var(--font-editorial); font-size: 24px; margin-bottom: 1rem; }
        .newsletter-box input { background: var(--bg-primary); border: 1px solid var(--border); color: #fff; padding: 12px; font-family: var(--font-mono); width: 60%; }
        .newsletter-box button { background: var(--accent-warm); color: #000; border: none; padding: 12px 24px; font-weight: bold; cursor: pointer; }
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
        ${marked.parse(post.content)}
        <div class="newsletter-box">
            <h4>Pelimotion Weekly Hub</h4>
            <p style="font-size: 14px; color: var(--text-secondary); margin-bottom: 1.5rem;">Receba nossa curadoria de motion branding e vagas.</p>
            <form action="#" method="POST" style="display: flex; justify-content: center; gap: 10px;">
                <input type="email" placeholder="E-mail" required>
                <button type="submit">Inscrever</button>
            </form>
        </div>
    </article>
    ${getFooter()}
</body>
</html>`;
}

function createIndexHtml(posts, lang, customTitle = null, isTagPage = false) {
    const title = customTitle || (lang === 'pt' ? 'Pelimotion Hub' : 'Pelimotion Hub');
    const outDir = lang === 'pt' ? BLOG_OUT_DIR : EN_BLOG_OUT_DIR;
    const isPt = lang === 'pt';
    const sortedPosts = [...posts].sort((a, b) => new Date(b.data.date || Date.now()) - new Date(a.data.date || Date.now()));

    const categories = [...new Set(posts.map(p => p.data.category))].filter(Boolean);

    let html = `<!DOCTYPE html>
<html lang="${lang}">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title} | Motion Branding</title>
    <link href="https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@900&family=DM+Mono:ital,wght@0,300;0,400;0,500;1,300&family=IBM+Plex+Sans:ital,wght@0,400;0,500;0,600;1,400&family=Playfair+Display:ital,wght@0,400;0,600;0,700;1,400&display=swap" rel="stylesheet">
    <style>
        ${GLOBAL_CSS}
        .blog-filter-bar { display: flex; justify-content: space-between; align-items: center; padding: 24px var(--gutter) 20px; border-bottom: 1px solid var(--border); }
        .filter-pills { display: flex; gap: 8px; flex-wrap: wrap; }
        .pill { font-family: var(--font-mono); font-size: 10px; letter-spacing: 0.1em; padding: 4px 10px; border: 1px solid var(--border); border-radius: 100px; background: transparent; color: var(--text-secondary); cursor: pointer; transition: all 150ms ease; }
        .pill:hover, .pill.active { background: var(--text-primary); color: var(--bg-primary); border-color: var(--text-primary); }
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
            ${sortedPosts.map((post, i) => `
            <article class="post-card fade-in-up" data-category="${post.data.category ? post.data.category.toLowerCase().replace(/\s+/g, '-') : ''}" style="animation-delay: ${(i%3)*100}ms">
                <div class="card-meta-top">
                    <time class="card-date">${formatDate(post.data.date, lang)}</time>
                    <span class="card-category-pill" style="border:1px solid var(--border);padding:2px 6px;border-radius:100px">${post.data.category}</span>
                </div>
                <div class="card-image-wrapper">
                    <img class="card-image" src="${post.data.thumbImage}" alt="" loading="lazy">
                </div>
                <h2 class="card-title playfair"><a href="${isPt?'/blog':'/en/blog'}/${post.data.slug}">${post.data.title}</a></h2>
                <p class="card-excerpt">${post.data.metaDescription}</p>
                <div class="card-meta-bottom">
                    <span><strong>TEXTO</strong> · Pelimotion</span>
                    <span><strong>LEITURA</strong> · ${calculateReadingTime(post.content)} min</span>
                </div>
            </article>`).join('')}
        </div>
    </main>
    ${getFooter()}
</body>
</html>`;

    const outPath = isTagPage ? path.join(outDir, 'categoria', `${customTitle.toLowerCase().replace(/\s+/g,'-')}.html`) : path.join(outDir, 'index.html');
    fs.writeFileSync(outPath, html);
}

function updateSitemap(urls) {
    let content = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`;
    urls.forEach(url => {
        content += `\n    <url>\n        <loc>${DOMAIN}${url}</loc>\n        <changefreq>weekly</changefreq>\n        <priority>0.8</priority>\n    </url>`;
    });
    content += `\n</urlset>`;
    fs.writeFileSync(SITEMAP_PATH, content);
}

function parseDirectory(dirName) {
    const dirPath = path.join(CONTENT_DIR, dirName);
    if (!fs.existsSync(dirPath)) return [];
    return fs.readdirSync(dirPath).filter(f => f.endsWith('.md')).map(file => {
        const fileContent = fs.readFileSync(path.join(dirPath, file), 'utf-8');
        return matter(fileContent);
    });
}

async function build() {
    console.log('Starting automated hub generation...');
    const posts = parseDirectory('posts');
    const jobs = parseDirectory('jobs');
    const events = parseDirectory('events');
    const resources = parseDirectory('resources');

    const urls = ['/blog', '/blog/vagas', '/blog/eventos', '/blog/recursos', '/en/blog'];

    for (const post of posts) {
        if (post.data.heroPrompt) await generatePostImages(post.data.heroPrompt, post.data.slug);
        const outDir = (post.data.lang || 'pt') === 'pt' ? BLOG_OUT_DIR : EN_BLOG_OUT_DIR;
        fs.writeFileSync(path.join(outDir, `${post.data.slug}.html`), createHtml(post));
        urls.push(`${(post.data.lang || 'pt') === 'pt' ? '/blog' : '/en/blog'}/${post.data.slug}`);
    }

    const ptPosts = posts.filter(p => (p.data.lang || 'pt') === 'pt');
    if (ptPosts.length > 0) {
        createIndexHtml(ptPosts, 'pt');
        const categories = [...new Set(ptPosts.map(p => p.data.category))].filter(Boolean);
        categories.forEach(cat => {
            createIndexHtml(ptPosts.filter(p => p.data.category === cat), 'pt', cat, true);
        });
        createRss(ptPosts, 'pt');
    }

    createDirectoryPage(jobs, 'vagas', 'pt');
    createDirectoryPage(events, 'eventos', 'pt');
    createDirectoryPage(resources, 'recursos', 'pt');

    updateSitemap(urls);
    console.log('Build complete.');
}

build();
