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

function createHtml(post) {
    // Generate JSON-LD Schema
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

    const hreflang = post.data.lang === 'pt' ? 
        `<link rel="alternate" hreflang="en" href="${DOMAIN}/en/blog/${post.data.slug}" />` : 
        `<link rel="alternate" hreflang="pt" href="${DOMAIN}/blog/${post.data.slug}" />`;

    return `<!DOCTYPE html>
<html lang="${post.data.lang}">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${post.data.metaTitle}</title>
    <meta name="description" content="${post.data.metaDescription}">
    <meta name="keywords" content="${post.data.keywords}">
    ${hreflang}
    <link rel="canonical" href="${DOMAIN}${post.data.lang === 'pt' ? '/blog' : '/en/blog'}/${post.data.slug}">
    <style>
        body { font-family: 'Inter', sans-serif; background: #000; color: #fff; max-width: 800px; margin: 0 auto; padding: 20px; line-height: 1.6; }
        img { max-width: 100%; height: auto; border-radius: 8px; margin: 20px 0; }
        h1, h2, h3 { color: #f0f0f0; }
        a { color: #88ccff; text-decoration: none; }
        a:hover { text-decoration: underline; }
    </style>
    <script type="application/ld+json">
        ${JSON.stringify(schema)}
    </script>
</head>
<body>
    <nav><a href="${post.data.lang === 'pt' ? '/blog' : '/en/blog'}">← Voltar / Back</a></nav>
    <article>
        <h1>${post.data.title}</h1>
        <p><small>${post.data.date} | ${post.data.category}</small></p>
        ${marked(post.content)}
    </article>
</body>
</html>`;
}

function createIndexHtml(posts, lang) {
    const title = lang === 'pt' ? 'Pelimotion Blog' : 'Pelimotion Blog (EN)';
    const outDir = lang === 'pt' ? BLOG_OUT_DIR : EN_BLOG_OUT_DIR;
    
    let html = `<!DOCTYPE html>
<html lang="${lang}">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title}</title>
    <style>
        body { font-family: 'Inter', sans-serif; background: #000; color: #fff; max-width: 800px; margin: 0 auto; padding: 20px; line-height: 1.6; }
        a { color: #88ccff; text-decoration: none; }
        a:hover { text-decoration: underline; }
        .post { margin-bottom: 30px; padding-bottom: 20px; border-bottom: 1px solid #333; }
        .post h2 { margin-bottom: 5px; }
    </style>
</head>
<body>
    <h1>${title}</h1>
    <div class="posts">`;

    posts.forEach(post => {
        html += `
        <div class="post">
            <h2><a href="./${post.data.slug}">${post.data.title}</a></h2>
            <p><small>${post.data.date} | ${post.data.category}</small></p>
            <p>${post.data.metaDescription}</p>
        </div>`;
    });

    html += `
    </div>
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

    const ptPosts = posts.filter(p => p.data.lang === 'pt').sort((a, b) => new Date(b.data.date) - new Date(a.data.date));
    const enPosts = posts.filter(p => p.data.lang === 'en').sort((a, b) => new Date(b.data.date) - new Date(a.data.date));

    createIndexHtml(ptPosts, 'pt');
    createIndexHtml(enPosts, 'en');

    updateRobots();
    updateSitemap(urls);

    console.log('Build complete. Sitemap and robots.txt updated.');
}

build();
