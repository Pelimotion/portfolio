const https = require('https');

const BUNNY_API_KEY = process.env.BUNNY_API_KEY;
const STORAGE_ZONE = process.env.BUNNY_STORAGE_ZONE || 'pelimotion-portfolio';

async function uploadToBunny(buffer, slug, fileName) {
    const url = `https://storage.bunnycdn.com/${STORAGE_ZONE}/blog/assets/${slug}/${fileName}.jpg`;
    
    return new Promise((resolve, reject) => {
        const req = https.request(url, {
            method: 'PUT',
            headers: {
                'AccessKey': BUNNY_API_KEY,
                'Content-Type': 'image/jpeg',
                'Content-Length': buffer.length
            }
        }, (res) => {
            if (res.statusCode === 201 || res.statusCode === 200) resolve(true);
            else reject(new Error(`Bunny Error: ${res.statusCode}`));
        });
        req.on('error', reject);
        req.write(buffer);
        req.end();
    });
}

export default async function handler(req, res) {
    if (req.method !== 'POST') return res.status(405).end();

    const { imageData, slug, imageName } = req.body;

    try {
        const buffer = Buffer.from(imageData.split(',')[1], 'base64');
        await uploadToBunny(buffer, slug, imageName);
        res.status(200).json({ success: true });
    } catch (error) {
        console.error('API Upload Image Error:', error);
        res.status(500).json({ error: error.message });
    }
}
