const https = require('https');

const BUNNY_API_KEY = process.env.BUNNY_API_KEY;
const STORAGE_ZONE = process.env.BUNNY_STORAGE_ZONE || 'pelimotion-portfolio';
const CDN_BASE = 'https://pelimotion-portfolio.b-cdn.net';

const VIDEO_EXTS = new Set(['mp4', 'webm', 'mov', 'avi']);
const IMAGE_EXTS = new Set(['jpg', 'jpeg', 'png', 'webp', 'gif']);

function getExt(name) {
  return (name.split('.').pop() || '').toLowerCase();
}

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

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');

  if (!BUNNY_API_KEY) {
    return res.status(500).json({ error: 'BUNNY_API_KEY not configured in Vercel env vars' });
  }

  try {
    const root = await listBunny('');
    const result = { videos: [], images: [], folders: [] };

    for (const item of root) {
      if (item.IsDirectory) {
        const folderName = item.ObjectName;
        result.folders.push({ name: folderName, path: folderName + '/' });

        // Skip blog (too many nested files — handled by gallery.js)
        if (folderName === 'blog') continue;

        let subItems = [];
        try { subItems = await listBunny(folderName + '/'); } catch (e) { continue; }

        for (const f of subItems) {
          if (f.IsDirectory) continue;
          const ext = getExt(f.ObjectName);
          const url = `${CDN_BASE}/${folderName}/${f.ObjectName}`;
          const entry = {
            name: f.ObjectName,
            folder: folderName,
            url,
            size: f.Length || 0,
            date: f.DateCreated || null
          };
          if (VIDEO_EXTS.has(ext)) result.videos.push(entry);
          else if (IMAGE_EXTS.has(ext)) result.images.push(entry);
        }
      } else {
        const ext = getExt(item.ObjectName);
        const url = `${CDN_BASE}/${item.ObjectName}`;
        const entry = {
          name: item.ObjectName,
          folder: '',
          url,
          size: item.Length || 0,
          date: item.DateCreated || null
        };
        if (VIDEO_EXTS.has(ext)) result.videos.push(entry);
        else if (IMAGE_EXTS.has(ext)) result.images.push(entry);
      }
    }

    result.videos.sort((a, b) => (b.date || '') > (a.date || '') ? 1 : -1);
    result.images.sort((a, b) => (b.date || '') > (a.date || '') ? 1 : -1);

    res.status(200).json(result);
  } catch (error) {
    console.error('Bunny scan error:', error);
    res.status(500).json({ error: error.message });
  }
}
