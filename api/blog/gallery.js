const https = require('https');

const BUNNY_API_KEY = process.env.BUNNY_API_KEY;
const STORAGE_ZONE = process.env.BUNNY_STORAGE_ZONE || 'pelimotion-portfolio';

async function fetchBunnyFiles(path = '') {
    const url = `https://storage.bunnycdn.com/${STORAGE_ZONE}/blog/assets/${path}`;
    return new Promise((resolve, reject) => {
        https.get(url, {
            headers: { 'AccessKey': BUNNY_API_KEY, 'accept': 'application/json' }
        }, (res) => {
            let body = '';
            res.on('data', chunk => body += chunk);
            res.on('end', () => {
                if (res.statusCode !== 200) reject(new Error(`Bunny Error: ${res.statusCode}`));
                else resolve(JSON.parse(body || '[]'));
            });
        }).on('error', reject);
    });
}

export default async function handler(req, res) {
    try {
        // Fetch top-level asset folders (slugs)
        const folders = await fetchBunnyFiles('');
        const allImages = [];

        for (const folder of folders) {
            if (folder.IsDirectory) {
                const files = await fetchBunnyFiles(`${folder.ObjectName}/`);
                files.forEach(f => {
                    if (!f.IsDirectory && f.ObjectName.match(/\.(jpg|jpeg|png|webp)$/i)) {
                        allImages.push({
                            url: `https://pelimotion-portfolio.b-cdn.net/blog/assets/${folder.ObjectName}/${f.ObjectName}`,
                            name: f.ObjectName,
                            slug: folder.ObjectName,
                            date: f.DateCreated
                        });
                    }
                });
            }
        }

        // Sort by date descending
        allImages.sort((a, b) => new Date(b.date) - new Date(a.date));

        res.status(200).json(allImages);
    } catch (error) {
        console.error('Gallery API Error:', error);
        res.status(500).json({ error: error.message });
    }
}
