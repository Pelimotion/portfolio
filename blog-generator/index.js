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
        --text-secondary: #666666;
        --accent: #f0ede8;
        --accent-warm: #e8d5a3;
        --border: #1e1e1e;

        --font-display: 'Barlow Condensed', sans-serif;
        --font-editorial: 'Playfair Display', serif;
        --font-mono: 'DM Mono', monospace;

        --wordmark-size: clamp(72px, 18vw, 180px);
        --card-title: clamp(16px, 2vw, 22px);
        --meta-size: 11px;
        --body-size: 14px;

        --max-width: 1400px;
        --gutter: 40px;
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
        font-family: var(--font-editorial);
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
        background: var(--accent-warm);
        width: 0%;
        z-index: 1000;
        transition: width 100ms linear;
    }

    /* Header */
    .blog-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 20px var(--gutter);
        border-bottom: 1px solid var(--border);
        position: sticky;
        top: 0;
        background: rgba(10,10,10,0.92);
        backdrop-filter: blur(12px);
        z-index: 100;
    }

    .blog-logo {
        font-family: var(--font-mono);
        font-size: 13px;
        letter-spacing: 0.15em;
        text-transform: uppercase;
        color: var(--text-primary);
    }
    
    .blog-logo-sub {
        font-size: 9px;
        letter-spacing: 0.2em;
        color: var(--text-secondary);
        vertical-align: middle;
        margin-left: 8px;
    }

    .blog-nav {
        display: flex;
        gap: 32px;
        align-items: center;
        font-family: var(--font-mono);
        font-size: 12px;
        letter-spacing: 0.08em;
    }

    .blog-nav a {
        color: var(--text-secondary);
        transition: color 0.2s ease;
    }

    .blog-nav a:hover {
        color: var(--accent);
    }

    /* Footer */
    .blog-footer {
        border-top: 1px solid var(--border);
        padding: 3rem 2rem;
        text-align: center;
        font-family: var(--font-mono);
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
    
    @media (max-width: 767px) {
        :root { --gutter: 20px; }
        .blog-nav { gap: 16px; }
    }
`;

function getHeader(lang) {
    const isPt = lang === 'pt';
    const linkPrefix = isPt ? '/blog' : '/en/blog';
    return `
    <div class="progress-bar" id="progressBar"></div>
    <header class="blog-header">
        <div class="blog-logo">
            <a href="${linkPrefix}">PELIMOTION</a> <span class="blog-logo-sub">JOURNAL</span>
        </div>
        <nav class="blog-nav">
            <a href="${linkPrefix}">Blog</a>
            <a href="${isPt ? '/en/blog' : '/blog'}">${isPt ? 'EN' : 'PT'}</a>
            <a href="/">Portfólio</a>
            <a href="${linkPrefix}/sobre">${isPt ? 'Sobre' : 'About'}</a>
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
    <link href="https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@900&family=DM+Mono:ital,wght@0,300;0,400;0,500;1,300&family=IBM+Plex+Sans:ital,wght@0,400;0,500;0,600;1,400&family=Playfair+Display:ital,wght@0,400;0,600;0,700;1,400&display=swap" rel="stylesheet">
    
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
            font-family: var(--font-mono);
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
            font-family: var(--font-mono);
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
            font-family: var(--font-mono);
            font-size: 13px;
            color: var(--text-secondary);
        }

        .post-layout {
            display: grid;
            grid-template-columns: 1fr;
            max-width: var(--max-width);
            margin: 4rem auto;
            padding: 0 var(--gutter);
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
            font-family: var(--font-mono);
            font-size: 14px;
            text-transform: uppercase;
            letter-spacing: 0.1em;
            color: var(--accent-warm);
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
            font-family: var(--font-mono);
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
            border-left: 3px solid var(--accent-warm);
            padding: 2rem;
            margin: 4rem 0;
        }
        
        .cta-box h4 {
            font-family: var(--font-editorial);
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
            font-family: var(--font-mono);
            font-size: 13px;
            font-weight: 500;
            padding: 12px 24px;
            border-radius: 2px;
            text-decoration: none !important;
            transition: background 0.2s;
        }
        
        .cta-button:hover {
            background: var(--accent-warm);
        }

        .author-bio {
            margin-top: 4rem;
            padding-top: 2rem;
            border-top: 1px solid var(--border);
        }
        
        .author-bio-label {
            font-family: var(--font-mono);
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

    let html = `<!DOCTYPE html>
<html lang="${lang}">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title} | Motion Branding</title>
    
    <!-- Fonts -->
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@900&family=DM+Mono:ital,wght@0,300;0,400;0,500;1,300&family=IBM+Plex+Sans:ital,wght@0,400;0,500;0,600;1,400&family=Playfair+Display:ital,wght@0,400;0,600;0,700;1,400&display=swap" rel="stylesheet">
    
    <style>
        ${GLOBAL_CSS}
        
        .blog-wordmark {
            font-family: var(--font-display);
            font-size: var(--wordmark-size);
            font-weight: 900;
            line-height: 0.85;
            letter-spacing: -0.03em;
            color: var(--text-primary);
            text-transform: uppercase;
            padding: 40px var(--gutter) 0;
        }

        .blog-filter-bar {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 24px var(--gutter) 20px;
            border-bottom: 1px solid var(--border);
        }

        .filter-label {
            font-family: var(--font-mono);
            font-size: 10px;
            letter-spacing: 0.2em;
            text-transform: uppercase;
            color: var(--text-secondary);
        }

        .filter-pills {
            display: flex;
            gap: 8px;
        }

        .pill {
            font-family: var(--font-mono);
            font-size: 10px;
            letter-spacing: 0.1em;
            padding: 4px 10px;
            border: 1px solid var(--border);
            border-radius: 100px;
            background: transparent;
            color: var(--text-secondary);
            cursor: pointer;
            transition: all 150ms ease;
        }

        .pill.active,
        .pill:hover {
            background: var(--text-primary);
            color: var(--bg-primary);
            border-color: var(--text-primary);
        }

        /* Container */
        .container {
            max-width: var(--max-width);
            margin: 0 auto;
            padding: 0 var(--gutter);
        }

        .posts-grid {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            border-left: 1px solid var(--border);
            border-top: 1px solid var(--border);
            margin-bottom: 4rem;
        }

        @media (max-width: 1023px) {
            .posts-grid { grid-template-columns: repeat(2, 1fr); }
        }

        @media (max-width: 767px) {
            .posts-grid { grid-template-columns: 1fr; }
            .blog-filter-bar {
                flex-direction: column;
                gap: 12px;
                align-items: flex-start;
            }
            .filter-pills {
                flex-wrap: wrap;
                gap: 6px;
            }
            .blog-wordmark {
                padding-top: 24px;
            }
        }

        .post-card {
            border-right: 1px solid var(--border);
            border-bottom: 1px solid var(--border);
            padding: 16px;
            display: flex;
            flex-direction: column;
            gap: 12px;
            transition: background 200ms ease;
        }

        .post-card:hover {
            background: var(--bg-secondary);
        }

        /* Meta line topo do card */
        .card-meta-top {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
        }

        .card-date {
            font-family: var(--font-mono);
            font-size: var(--meta-size);
            color: var(--text-secondary);
        }

        .card-category-pill {
            font-family: var(--font-mono);
            font-size: 9px;
            letter-spacing: 0.12em;
            text-transform: uppercase;
            padding: 3px 8px;
            border: 1px solid var(--border);
            border-radius: 100px;
            color: var(--text-secondary);
            white-space: nowrap;
        }

        /* Imagem */
        .card-image-wrapper {
            aspect-ratio: 4/3;
            overflow: hidden;
            background: var(--bg-secondary);
        }

        .card-image {
            width: 100%;
            height: 100%;
            object-fit: cover;
            display: block;
            transition: transform 400ms cubic-bezier(0.16, 1, 0.3, 1);
        }

        .post-card:hover .card-image {
            transform: scale(1.04);
        }

        /* Título */
        .card-title {
            font-family: var(--font-editorial);
            font-size: var(--card-title);
            font-weight: 700;
            line-height: 1.25;
            color: var(--text-primary);
            display: -webkit-box;
            -webkit-line-clamp: 2;
            -webkit-box-orient: vertical;
            overflow: hidden;
        }

        .card-title a {
            transition: color 200ms ease;
        }

        .post-card:hover .card-title a {
            color: var(--accent-warm);
        }

        /* Excerpt */
        .card-excerpt {
            font-family: var(--font-mono);
            font-size: var(--body-size);
            line-height: 1.6;
            color: var(--text-secondary);
            display: -webkit-box;
            -webkit-line-clamp: 3;
            -webkit-box-orient: vertical;
            overflow: hidden;
            flex: 1;
        }

        /* Meta base do card */
        .card-meta-bottom {
            display: flex;
            justify-content: space-between;
            padding-top: 12px;
            border-top: 1px solid var(--border);
            font-family: var(--font-mono);
            font-size: var(--meta-size);
            color: var(--text-secondary);
        }

        .card-meta-bottom span {
            display: flex;
            gap: 6px;
            align-items: center;
        }

        .card-meta-bottom strong {
            color: var(--text-primary);
            font-weight: 500;
        }

        @media (prefers-reduced-motion: reduce) {
            .card-image, .pill, .card-title a { transition: none; }
        }
    </style>
</head>
<body>
    ${getHeader(lang)}
    
    <div class="blog-wordmark fade-in-up" style="animation-delay: 0ms">JOURNAL</div>
    
    <div class="blog-filter-bar fade-in-up" style="animation-delay: 50ms">
        <span class="filter-label">${isPt ? 'Categorias' : 'Categories'}</span>
        <div class="filter-pills">
            <button class="pill active" data-filter="all">${isPt ? 'Todos' : 'All'}</button>
            <button class="pill" data-filter="tecnica">Técnica</button>
            <button class="pill" data-filter="processo">Processo</button>
            <button class="pill" data-filter="negocio">Negócio</button>
            <button class="pill" data-filter="ia">IA & Processo</button>
            <button class="pill" data-filter="psicologia">Psicologia</button>
            <button class="pill" data-filter="branding">Branding</button>
        </div>
    </div>

    <main class="container">
        <div class="posts-grid">
            ${sortedPosts.map((post, i) => `
            <article class="post-card fade-in-up" data-category="${post.data.category.toLowerCase().replace(/&/g, '').replace(/\s+/g, '-').replace(/-+/g, '-').trim()}" style="animation-delay: ${(i % 3) * 100}ms">
                <div class="card-meta-top">
                    <time class="card-date" datetime="${post.data.date}">${formatDate(post.data.date, lang)}</time>
                    <span class="card-category-pill">${post.data.category}</span>
                </div>
                <div class="card-image-wrapper">
                    <img
                        class="card-image"
                        src="${post.data.thumbImage}"
                        alt=""
                        loading="lazy"
                        width="400"
                        height="300"
                    />
                </div>
                <h2 class="card-title">
                    <a href="./${post.data.slug}">${post.data.title}</a>
                </h2>
                <p class="card-excerpt">
                    ${post.data.metaDescription}
                </p>
                <div class="card-meta-bottom">
                    <span><strong>${isPt ? 'Texto' : 'Text'}</strong> · Pelimotion</span>
                    <span><strong>${isPt ? 'Leitura' : 'Read'}</strong> · ${calculateReadingTime(post.content)} min</span>
                </div>
            </article>
            `).join('')}
        </div>
    </main>

    ${getFooter()}
    ${getScripts()}
    <script>
        document.querySelectorAll('.pill').forEach(pill => {
            pill.addEventListener('click', () => {
                const filter = pill.dataset.filter;
                document.querySelectorAll('.pill').forEach(p => p.classList.remove('active'));
                pill.classList.add('active');
                document.querySelectorAll('.post-card').forEach(card => {
                    // Check if it matches exactly or if filter is "all" or if category matches partial like "ia" matches "ia-processo"
                    if (filter === 'all' || card.dataset.category.includes(filter)) {
                        card.style.display = 'flex';
                    } else {
                        card.style.display = 'none';
                    }
                });
            });
        });
    </script>
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
