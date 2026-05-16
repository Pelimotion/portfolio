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
if (!fs.existsSync(BLOG_OUT_DIR)) fs.mkdirSync(BLOG_OUT_DIR, { recursive: true });
if (!fs.existsSync(EN_BLOG_OUT_DIR)) fs.mkdirSync(EN_BLOG_OUT_DIR, { recursive: true });

function calculateReadingTime(text) {
    const wordCount = text.trim().split(/\s+/).length;
    return Math.ceil(wordCount / 200);
}

function formatDate(dateString, lang) {
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
        --text-secondary: #9a9690;
        --accent: #e8d5a3;
        --accent-2: #4a9eff;
        --border: #222222;
    }
    
    * {
        box-sizing: border-box;
        margin: 0;
        padding: 0;
    }

    body {
        font-family: 'DM Mono', 'IBM Plex Sans', monospace, sans-serif;
        background: var(--bg-primary);
        color: var(--text-primary);
        line-height: 1.75;
        overflow-x: hidden;
    }

    h1, h2, .playfair {
        font-family: 'Playfair Display', serif;
        font-weight: 700;
        color: var(--text-primary);
    }
    
    a {
        text-decoration: none;
        color: inherit;
    }

    /* Progress bar */
    .progress-bar {
        position: fixed;
        top: 0;
        left: 0;
        height: 2px;
        background: var(--accent);
        width: 0%;
        z-index: 1000;
        transition: width 100ms linear;
    }

    /* Header */
    .blog-header {
        position: sticky;
        top: 0;
        z-index: 100;
        background: rgba(10, 10, 10, 0.85);
        backdrop-filter: blur(12px);
        border-bottom: 1px solid var(--border);
        padding: 1rem 2rem;
        display: flex;
        justify-content: space-between;
        align-items: center;
    }
    
    .header-logo {
        display: flex;
        align-items: center;
        gap: 0.5rem;
    }

    .header-logo .brand {
        font-family: 'Playfair Display', serif;
        font-size: 18px;
        font-weight: 700;
    }

    .header-logo .tag {
        font-family: 'DM Mono', monospace;
        font-size: 11px;
        letter-spacing: 0.15em;
        color: var(--text-secondary);
        text-transform: uppercase;
    }

    .header-nav {
        display: flex;
        gap: 1.5rem;
        font-family: 'DM Mono', monospace;
        font-size: 13px;
    }
    
    .header-nav a {
        color: var(--text-secondary);
        transition: color 0.2s ease;
    }
    
    .header-nav a:hover {
        color: var(--accent);
    }

    /* Footer */
    .blog-footer {
        border-top: 1px solid var(--border);
        padding: 3rem 2rem;
        text-align: center;
        font-family: 'DM Mono', monospace;
        font-size: 12px;
        color: var(--text-secondary);
        margin-top: 5rem;
    }
    
    .blog-footer a {
        color: var(--text-primary);
    }

    /* Animations */
    .fade-in-up {
        opacity: 0;
        transform: translateY(16px);
        animation: fadeInUp 600ms cubic-bezier(0.16, 1, 0.3, 1) forwards;
    }
    
    @keyframes fadeInUp {
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }

    @media (prefers-reduced-motion: reduce) {
        * { animation: none !important; transition: none !important; }
        .progress-bar { display: none; }
    }
`;

function getHeader(lang) {
    const isPt = lang === 'pt';
    const linkPrefix = isPt ? '/blog' : '/en/blog';
    return `
    <div class="progress-bar" id="progressBar"></div>
    <header class="blog-header">
        <div class="header-logo">
            <a href="${linkPrefix}" class="brand">Pelimotion</a>
            <span class="tag">Journal</span>
        </div>
        <nav class="header-nav">
            <a href="${linkPrefix}">Blog</a>
            <a href="${isPt ? '/en/blog' : '/blog'}">${isPt ? 'EN' : 'PT'}</a>
            <a href="/">Portfolio</a>
        </nav>
    </header>
    `;
}

function getFooter() {
    return `
    <footer class="blog-footer">
        <p>© Pelimotion Studio. <a href="/blog">PT</a> | <a href="/en/blog">EN</a></p>
    </footer>
    `;
}

function getScripts() {
    return `
    <script>
        // Progress bar
        const progressBar = document.getElementById('progressBar');
        if (progressBar) {
            window.addEventListener('scroll', () => {
                const winScroll = document.body.scrollTop || document.documentElement.scrollTop;
                const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
                const scrolled = (winScroll / height) * 100;
                requestAnimationFrame(() => {
                    progressBar.style.width = scrolled + "%";
                });
            });
        }
    </script>
    `;
}

function createHtml(post) {
    const readingTime = calculateReadingTime(post.content);
    const formattedDate = formatDate(post.data.date, post.data.lang);
    const isPt = post.data.lang === 'pt';
    const linkPrefix = isPt ? '/blog' : '/en/blog';

    const schema = {
        "@context": "https://schema.org",
        "@type": "BlogPosting",
        "headline": post.data.title,
        "image": [
            `${DOMAIN}${post.data.heroImage}`
        ],
        "datePublished": post.data.date,
        "author": {
            "@type": "Organization",
            "name": "Pelimotion"
        }
    };

    const hreflang = isPt ? 
        `<link rel="alternate" hreflang="en" href="${DOMAIN}/en/blog/${post.data.slug}" />` : 
        `<link rel="alternate" hreflang="pt" href="${DOMAIN}/blog/${post.data.slug}" />`;

    // Generate TOC (Table of Contents) from H2s
    const h2Regex = /##\s+(.*)/g;
    const toc = [];
    let match;
    while ((match = h2Regex.exec(post.content)) !== null) {
        toc.push(match[1]);
    }
    
    let tocHtml = '';
    if (toc.length > 0) {
        tocHtml = `
        <div class="sidebar">
            <div class="sidebar-block">
                <h4 class="sidebar-title">${isPt ? 'Sobre o estúdio' : 'About the studio'}</h4>
                <p class="sidebar-text">Pelimotion é um hub de motion branding e pós-produção focado em identidades de alto padrão.</p>
            </div>
            <div class="sidebar-block toc">
                <h4 class="sidebar-title">${isPt ? 'Neste artigo' : 'In this article'}</h4>
                <ul>
                    ${toc.map(item => `<li><a href="#${item.toLowerCase().replace(/[^a-z0-9]+/g, '-')}">${item}</a></li>`).join('')}
                </ul>
            </div>
        </div>`;
    }
    
    // Add IDs to H2s in content for TOC linking
    const renderer = new marked.Renderer();
    renderer.heading = function({text, depth, tokens}) {
      if (depth === 2) {
          const id = text.toLowerCase().replace(/[^a-z0-9]+/g, '-');
          return `<h2 id="${id}">${text}</h2>`;
      }
      return `<h${depth}>${text}</h${depth}>`;
    };

    marked.setOptions({ renderer });

    return `<!DOCTYPE html>
<html lang="${post.data.lang}">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${post.data.metaTitle}</title>
    <meta name="description" content="${post.data.metaDescription}">
    <meta name="keywords" content="${post.data.keywords}">
    ${hreflang}
    <link rel="canonical" href="${DOMAIN}${linkPrefix}/${post.data.slug}">
    
    <!-- Fonts -->
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=DM+Mono:ital,wght@0,300;0,400;0,500;1,300&family=IBM+Plex+Sans:ital,wght@0,400;0,500;0,600;1,400&family=Playfair+Display:ital,wght@0,400;0,600;0,700;1,400&display=swap" rel="stylesheet">
    
    <style>
        ${GLOBAL_CSS}
        
        .post-hero {
            position: relative;
            width: 100%;
            height: 60vh;
            display: flex;
            align-items: flex-end;
            padding: 4rem 2rem;
            background-image: linear-gradient(to top, rgba(10,10,10,1) 0%, rgba(10,10,10,0.4) 60%, rgba(10,10,10,0.1) 100%), url('${post.data.heroImage}');
            background-size: cover;
            background-position: center;
        }

        .post-hero-content {
            max-width: 800px;
            margin: 0 auto;
            width: 100%;
        }

        .breadcrumb {
            font-family: 'DM Mono', monospace;
            font-size: 11px;
            color: var(--text-secondary);
            margin-bottom: 1rem;
            text-transform: uppercase;
            letter-spacing: 0.1em;
        }

        .category-pill {
            display: inline-block;
            background: var(--accent);
            color: var(--bg-primary);
            font-family: 'DM Mono', monospace;
            font-size: 10px;
            font-weight: 500;
            padding: 4px 8px;
            border-radius: 2px;
            margin-bottom: 1.5rem;
            letter-spacing: 0.1em;
            text-transform: uppercase;
        }

        .post-h1 {
            font-size: clamp(36px, 5vw, 64px);
            margin-bottom: 1.5rem;
            line-height: 1.1;
        }

        .post-meta {
            font-family: 'DM Mono', monospace;
            font-size: 13px;
            color: var(--text-secondary);
        }

        .post-layout {
            display: grid;
            grid-template-columns: 1fr;
            max-width: 1200px;
            margin: 4rem auto;
            padding: 0 2rem;
            gap: 4rem;
        }

        @media (min-width: 1024px) {
            .post-layout {
                grid-template-columns: 1fr 300px;
            }
        }

        .post-content {
            font-family: 'IBM Plex Sans', sans-serif;
            font-size: 17px;
            max-width: 680px;
            margin: 0 auto;
            width: 100%;
        }

        .post-content p {
            margin-bottom: 1.5rem;
        }

        .post-content h2 {
            font-size: 28px;
            margin-top: 3.5rem;
            margin-bottom: 1.5rem;
        }

        .post-content h3 {
            font-family: 'DM Mono', monospace;
            font-size: 14px;
            text-transform: uppercase;
            letter-spacing: 0.1em;
            color: var(--accent);
            margin-top: 2.5rem;
            margin-bottom: 1rem;
        }

        .post-content a {
            color: var(--accent);
            text-decoration: underline;
            text-decoration-color: transparent;
            text-underline-offset: 3px;
            transition: text-decoration-color 0.2s;
        }

        .post-content a:hover {
            text-decoration-color: var(--accent);
        }

        .post-content ul, .post-content ol {
            margin-bottom: 1.5rem;
            padding-left: 1.5rem;
        }

        .post-content li {
            margin-bottom: 0.5rem;
        }

        .post-content hr {
            border: 0;
            height: 1px;
            background: var(--border);
            margin: 3rem 0;
        }

        .post-content img {
            max-width: 100%;
            height: auto;
            border-radius: 2px;
            margin: 2rem 0;
        }
        
        .post-content strong {
            font-weight: 600;
            color: #fff;
        }

        /* Sidebar */
        .sidebar {
            position: sticky;
            top: 100px;
            align-self: start;
            display: none;
        }

        @media (min-width: 1024px) {
            .sidebar {
                display: block;
            }
        }

        .sidebar-block {
            margin-bottom: 3rem;
        }

        .sidebar-title {
            font-family: 'DM Mono', monospace;
            font-size: 11px;
            text-transform: uppercase;
            letter-spacing: 0.1em;
            color: var(--text-secondary);
            margin-bottom: 1rem;
            border-bottom: 1px solid var(--border);
            padding-bottom: 0.5rem;
        }

        .sidebar-text {
            font-size: 14px;
            color: var(--text-secondary);
        }

        .toc ul {
            list-style: none;
            padding: 0;
        }

        .toc li {
            margin-bottom: 0.75rem;
        }

        .toc a {
            font-size: 14px;
            color: var(--text-secondary);
            transition: color 0.2s;
        }

        .toc a:hover {
            color: var(--accent);
        }

        .cta-box {
            background: var(--bg-secondary);
            border-left: 3px solid var(--accent);
            padding: 2rem;
            margin: 4rem 0;
        }
        
        .cta-box h4 {
            font-family: 'Playfair Display', serif;
            font-size: 24px;
            margin-bottom: 0.5rem;
        }
        
        .cta-box p {
            font-size: 15px;
            color: var(--text-secondary);
            margin-bottom: 1.5rem !important;
        }
        
        .cta-button {
            display: inline-block;
            background: var(--text-primary);
            color: var(--bg-primary);
            font-family: 'DM Mono', monospace;
            font-size: 13px;
            font-weight: 500;
            padding: 12px 24px;
            border-radius: 2px;
            text-decoration: none !important;
            transition: background 0.2s;
        }
        
        .cta-button:hover {
            background: var(--accent);
        }

        .author-bio {
            margin-top: 4rem;
            padding-top: 2rem;
            border-top: 1px solid var(--border);
        }
        
        .author-bio-label {
            font-family: 'DM Mono', monospace;
            font-size: 11px;
            text-transform: uppercase;
            color: var(--text-secondary);
            margin-bottom: 1rem;
        }
    </style>
    
    <script type="application/ld+json">
        ${JSON.stringify(schema)}
    </script>
</head>
<body>
    ${getHeader(post.data.lang)}
    
    <section class="post-hero">
        <div class="post-hero-content">
            <div class="breadcrumb fade-in-up" style="animation-delay: 0ms">Blog → ${post.data.category}</div>
            <div class="category-pill fade-in-up" style="animation-delay: 50ms">${post.data.category}</div>
            <h1 class="post-h1 playfair fade-in-up" style="animation-delay: 100ms">${post.data.title}</h1>
            <div class="post-meta fade-in-up" style="animation-delay: 150ms">
                ${formattedDate} · ${readingTime} min de leitura · ${post.data.lang.toUpperCase()}
            </div>
        </div>
    </section>

    <div class="post-layout">
        <article class="post-content fade-in-up" style="animation-delay: 200ms">
            ${marked(post.content)}
            
            <div class="cta-box">
                <h4>Trabalhamos com marcas que levam o movimento a sério.</h4>
                <p>Portfólio completo e formas de contato.</p>
                <a href="/" class="cta-button">Ver portfólio →</a>
            </div>
            
            <div class="author-bio">
                <div class="author-bio-label">Escrito por</div>
                <h4 class="playfair" style="font-size: 20px; margin-bottom: 0.5rem">Pelimotion Studio</h4>
                <p style="font-size: 14px; color: var(--text-secondary)">Hub de motion branding e pós-produção. Transformamos estratégia de marca em movimento de alto padrão.</p>
            </div>
        </article>
        
        ${tocHtml}
    </div>

    ${getFooter()}
    ${getScripts()}
</body>
</html>`;
}

function createIndexHtml(posts, lang) {
    const title = lang === 'pt' ? 'Pelimotion Journal' : 'Pelimotion Journal';
    const outDir = lang === 'pt' ? BLOG_OUT_DIR : EN_BLOG_OUT_DIR;
    const isPt = lang === 'pt';
    
    // Sort posts by date descending
    const sortedPosts = [...posts].sort((a, b) => new Date(b.data.date) - new Date(a.data.date));
    const featuredPost = sortedPosts[0];
    const gridPosts = sortedPosts.slice(1);

    let html = `<!DOCTYPE html>
<html lang="${lang}">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title} | Motion Branding</title>
    
    <!-- Fonts -->
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=DM+Mono:ital,wght@0,300;0,400;0,500;1,300&family=IBM+Plex+Sans:ital,wght@0,400;0,500;0,600;1,400&family=Playfair+Display:ital,wght@0,400;0,600;0,700;1,400&display=swap" rel="stylesheet">
    
    <style>
        ${GLOBAL_CSS}
        
        .hero {
            position: relative;
            width: 100%;
            height: 70vh;
            display: flex;
            align-items: flex-end;
            padding: 4rem 2rem;
        }

        .hero-bg {
            position: absolute;
            top: 0; left: 0; width: 100%; height: 100%;
            object-fit: cover;
            z-index: -2;
        }
        
        .hero-overlay {
            position: absolute;
            top: 0; left: 0; width: 100%; height: 100%;
            background: linear-gradient(to top, rgba(10,10,10,1) 0%, rgba(10,10,10,0.5) 40%, transparent 100%);
            z-index: -1;
        }

        .hero-content {
            max-width: 1200px;
            margin: 0 auto;
            width: 100%;
        }

        .featured-label {
            font-family: 'DM Mono', monospace;
            font-size: 11px;
            letter-spacing: 0.1em;
            color: var(--accent);
            text-transform: uppercase;
            margin-bottom: 1rem;
            display: block;
        }

        .hero-h1 {
            font-size: clamp(32px, 5vw, 56px);
            margin-bottom: 1rem;
            max-width: 800px;
            line-height: 1.1;
        }

        .hero-meta {
            font-family: 'DM Mono', monospace;
            font-size: 13px;
            color: var(--text-secondary);
            margin-bottom: 2rem;
        }

        .btn-read {
            display: inline-block;
            font-family: 'DM Mono', monospace;
            font-size: 13px;
            color: var(--text-primary);
            border-bottom: 1px solid var(--accent);
            padding-bottom: 4px;
            transition: color 0.2s;
        }

        .btn-read:hover {
            color: var(--accent);
        }

        /* Container */
        .container {
            max-width: 1200px;
            margin: 4rem auto;
            padding: 0 2rem;
        }

        /* Filter */
        .filter-bar {
            display: flex;
            gap: 1rem;
            overflow-x: auto;
            padding-bottom: 1rem;
            margin-bottom: 3rem;
            -webkit-overflow-scrolling: touch;
        }

        .filter-pill {
            font-family: 'DM Mono', monospace;
            font-size: 12px;
            padding: 6px 16px;
            border: 1px solid var(--border);
            border-radius: 20px;
            color: var(--text-secondary);
            white-space: nowrap;
            cursor: pointer;
            transition: all 0.2s;
        }

        .filter-pill:hover, .filter-pill.active {
            background: var(--accent);
            color: var(--bg-primary);
            border-color: var(--accent);
        }

        /* Grid */
        .grid {
            display: grid;
            grid-template-columns: 1fr;
            gap: 3rem 2rem;
        }

        @media (min-width: 768px) {
            .grid { grid-template-columns: repeat(2, 1fr); }
        }

        @media (min-width: 1024px) {
            .grid { grid-template-columns: repeat(3, 1fr); }
        }

        .card {
            display: flex;
            flex-direction: column;
            group: hover;
        }

        .card-img-wrapper {
            position: relative;
            width: 100%;
            aspect-ratio: 16/9;
            overflow: hidden;
            border-radius: 2px;
            margin-bottom: 1.5rem;
            background: var(--bg-secondary);
        }

        .card-img {
            width: 100%;
            height: 100%;
            object-fit: cover;
            transition: transform 400ms ease;
        }

        .card:hover .card-img {
            transform: scale(1.03);
        }

        .card-tag {
            font-family: 'DM Mono', monospace;
            font-size: 10px;
            color: var(--accent);
            letter-spacing: 0.2em;
            text-transform: uppercase;
            margin-bottom: 0.75rem;
        }

        .card-title {
            font-size: 20px;
            line-height: 1.3;
            margin-bottom: 0.75rem;
            display: -webkit-box;
            -webkit-line-clamp: 2;
            -webkit-box-orient: vertical;
            overflow: hidden;
            transition: color 250ms ease;
        }

        .card:hover .card-title {
            color: var(--accent);
        }

        .card-excerpt {
            font-family: 'DM Mono', monospace;
            font-size: 13px;
            color: var(--text-secondary);
            margin-bottom: 1rem;
            display: -webkit-box;
            -webkit-line-clamp: 2;
            -webkit-box-orient: vertical;
            overflow: hidden;
        }

        .card-meta {
            margin-top: auto;
            font-family: 'DM Mono', monospace;
            font-size: 12px;
            color: var(--text-secondary);
        }
    </style>
</head>
<body>
    ${getHeader(lang)}
    
    ${featuredPost ? `
    <section class="hero">
        <img src="${featuredPost.data.heroImage}" alt="" class="hero-bg">
        <div class="hero-overlay"></div>
        <div class="hero-content">
            <span class="featured-label fade-in-up" style="animation-delay: 0ms">Featured</span>
            <h1 class="hero-h1 playfair fade-in-up" style="animation-delay: 50ms">
                <a href="./${featuredPost.data.slug}">${featuredPost.data.title}</a>
            </h1>
            <div class="hero-meta fade-in-up" style="animation-delay: 100ms">
                ${formatDate(featuredPost.data.date, lang)} · ${calculateReadingTime(featuredPost.content)} min
            </div>
            <a href="./${featuredPost.data.slug}" class="btn-read fade-in-up" style="animation-delay: 150ms">${isPt ? 'Ler artigo →' : 'Read article →'}</a>
        </div>
    </section>
    ` : ''}

    <main class="container">
        <div class="filter-bar">
            <div class="filter-pill active">${isPt ? 'Todos' : 'All'}</div>
            <div class="filter-pill">Técnica</div>
            <div class="filter-pill">Processo</div>
            <div class="filter-pill">Negócio</div>
            <div class="filter-pill">Branding</div>
        </div>

        <div class="grid">
            ${gridPosts.map((post, i) => `
            <article class="card fade-in-up" style="animation-delay: ${(i % 3) * 100}ms">
                <a href="./${post.data.slug}">
                    <div class="card-img-wrapper">
                        <img src="${post.data.thumbImage}" alt="" class="card-img" loading="lazy">
                    </div>
                    <div class="card-tag">${post.data.category}</div>
                    <h2 class="card-title playfair">${post.data.title}</h2>
                    <div class="card-excerpt">${post.data.metaDescription}</div>
                    <div class="card-meta">
                        ${formatDate(post.data.date, lang)} · ${calculateReadingTime(post.content)} min
                    </div>
                </a>
            </article>
            `).join('')}
        </div>
    </main>

    ${getFooter()}
    ${getScripts()}
</body>
</html>`;

    fs.writeFileSync(path.join(outDir, 'index.html'), html);
}

function updateRobots() {
    let content = '';
    if (fs.existsSync(ROBOTS_PATH)) {
        content = fs.readFileSync(ROBOTS_PATH, 'utf-8');
    }
    
    if (!content.includes('Allow: /blog')) {
        content += '\nUser-agent: *\nAllow: /blog\nAllow: /en/blog\n';
        fs.writeFileSync(ROBOTS_PATH, content.trim());
    }
}

function updateSitemap(urls) {
    let content = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`;

    urls.forEach(url => {
        content += `
    <url>
        <loc>${DOMAIN}${url}</loc>
        <changefreq>weekly</changefreq>
        <priority>0.8</priority>
    </url>`;
    });

    content += `\n</urlset>`;
    fs.writeFileSync(SITEMAP_PATH, content);
}

async function build() {
    console.log('Starting static site generation for /blog...');
    
    if (!fs.existsSync(CONTENT_DIR)) {
        console.log('No content directory found. Creating empty one...');
        fs.mkdirSync(CONTENT_DIR);
        return;
    }

    const files = fs.readdirSync(CONTENT_DIR).filter(f => f.endsWith('.md'));
    const posts = [];
    const urls = ['/blog', '/en/blog'];

    for (const file of files) {
        const filePath = path.join(CONTENT_DIR, file);
        const fileContent = fs.readFileSync(filePath, 'utf-8');
        const parsed = matter(fileContent);
        
        posts.push(parsed);

        const outDir = parsed.data.lang === 'pt' ? BLOG_OUT_DIR : EN_BLOG_OUT_DIR;
        const outPath = path.join(outDir, `${parsed.data.slug}.html`);
        
        // Generate Images
        if (parsed.data.heroPrompt) {
            await generatePostImages(parsed.data.heroPrompt, parsed.data.slug);
        }

        // Generate HTML
        const html = createHtml(parsed);
        fs.writeFileSync(outPath, html);
        
        console.log(`Built post: ${parsed.data.slug} (${parsed.data.lang})`);
        urls.push(`${parsed.data.lang === 'pt' ? '/blog' : '/en/blog'}/${parsed.data.slug}`);
    }

    const ptPosts = posts.filter(p => p.data.lang === 'pt');
    const enPosts = posts.filter(p => p.data.lang === 'en');

    if (ptPosts.length > 0) createIndexHtml(ptPosts, 'pt');
    if (enPosts.length > 0) createIndexHtml(enPosts, 'en');

    updateRobots();
    updateSitemap(urls);

    console.log('Build complete. Sitemap and robots.txt updated.');
}

build();
