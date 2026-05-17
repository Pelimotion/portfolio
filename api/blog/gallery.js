const https = require('https');

const BUNNY_API_KEY = process.env.BUNNY_API_KEY;
const STORAGE_ZONE = process.env.BUNNY_STORAGE_ZONE || 'pelimotion-portfolio';
const CDN_BASE = 'https://pelimotion-portfolio.b-cdn.net';

const VIDEO_EXTS = new Set(['mp4', 'webm', 'mov', 'avi']);
const IMAGE_EXTS = new Set(['jpg', 'jpeg', 'png', 'webp', 'gif']);

function listBunny(path) {
    const url = `https://storage.bunnycdn.com/${STORAGE_ZONE}/${path}`;
    return new Promise((resolve, reject) => {
        https.get(url, {
            headers: { 'AccessKey': BUNNY_API_KEY, 'accept': 'application/json' }
        }, (res) => {
            let body = '';
            res.on('data', chunk => body += chunk);
            res.on('end', () => {
                if (res.statusCode === 404) return resolve([]);
                if (res.statusCode !== 200) return reject(new Error(`Bunny ${res.statusCode} at /${path}`));
                try { resolve(JSON.parse(body || '[]')); } catch (e) { resolve([]); }
            });
        }).on('error', reject);
    });
}

// mode=scan  →  scan entire root storage zone (videos + images, skip /blog)
async function handleScan(res) {
    const root = await listBunny('');
    const result = { videos: [], images: [], folders: [] };

    for (const item of root) {
        if (item.IsDirectory) {
            const folderName = item.ObjectName;
            result.folders.push({ name: folderName, path: folderName + '/' });
            if (folderName === 'blog') continue; // too deep, handled by default mode

            let subItems = [];
            try { subItems = await listBunny(folderName + '/'); } catch (e) { continue; }

            for (const f of subItems) {
                if (f.IsDirectory) continue;
                const ext = (f.ObjectName.split('.').pop() || '').toLowerCase();
                const url = `${CDN_BASE}/${folderName}/${f.ObjectName}`;
                const entry = { name: f.ObjectName, folder: folderName, url, size: f.Length || 0, date: f.DateCreated || null };
                if (VIDEO_EXTS.has(ext)) result.videos.push(entry);
                else if (IMAGE_EXTS.has(ext)) result.images.push(entry);
            }
        } else {
            const ext = (item.ObjectName.split('.').pop() || '').toLowerCase();
            const url = `${CDN_BASE}/${item.ObjectName}`;
            const entry = { name: item.ObjectName, folder: '', url, size: item.Length || 0, date: item.DateCreated || null };
            if (VIDEO_EXTS.has(ext)) result.videos.push(entry);
            else if (IMAGE_EXTS.has(ext)) result.images.push(entry);
        }
    }

    result.videos.sort((a, b) => (b.date || '') > (a.date || '') ? 1 : -1);
    result.images.sort((a, b) => (b.date || '') > (a.date || '') ? 1 : -1);
    res.status(200).json(result);
}

// default mode  →  list blog/assets images (original behaviour)
async function handleGallery(res) {
    const folders = await listBunny('blog/assets/');
    const allImages = [];

    for (const folder of folders) {
        if (folder.IsDirectory) {
            const files = await listBunny(`blog/assets/${folder.ObjectName}/`);
            files.forEach(f => {
                if (!f.IsDirectory && f.ObjectName.match(/\.(jpg|jpeg|png|webp)$/i)) {
                    allImages.push({
                        url: `${CDN_BASE}/blog/assets/${folder.ObjectName}/${f.ObjectName}`,
                        name: f.ObjectName,
                        slug: folder.ObjectName,
                        date: f.DateCreated
                    });
                }
            });
        }
    }

    allImages.sort((a, b) => new Date(b.date) - new Date(a.date));
    res.status(200).json(allImages);
}

export default async function handler(req, res) {
    if (!BUNNY_API_KEY) {
        return res.status(500).json({ error: 'BUNNY_API_KEY not configured' });
    }

    try {
        const mode = req.query?.mode;
        if (mode === 'scan') {
            await handleScan(res);
        } else {
            await handleGallery(res);
        }
    } catch (error) {
        console.error('Gallery/Scan error:', error);
        res.status(500).json({ error: error.message });
    }
}
