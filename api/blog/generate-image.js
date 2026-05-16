const { GoogleAuth } = require('google-auth-library');
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

    let { prompt, slug, imageName } = req.body;
    if (!slug) return res.status(400).json({ error: "Slug is required" });
    
    // Sanitize slug to match storage expectations
    slug = slug.toLowerCase().trim().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
    const projectId = process.env.GOOGLE_CLOUD_PROJECT_ID;
    const location = 'us-central1';

    try {
        const auth = new GoogleAuth({ 
            credentials: process.env.GOOGLE_APPLICATION_CREDENTIALS ? JSON.parse(process.env.GOOGLE_APPLICATION_CREDENTIALS) : undefined,
            scopes: 'https://www.googleapis.com/auth/cloud-platform' 
        });
        const client = await auth.getClient();
        const accessToken = await client.getAccessToken();

        const endpoint = `https://${location}-aiplatform.googleapis.com/v1/projects/${projectId}/locations/${location}/publishers/google/models/imagen-3.0-generate-001:predict`;

        const data = JSON.stringify({
            instances: [{ prompt }],
            parameters: {
                sampleCount: 1,
                aspectRatio: "16:9",
                safetySetting: "BLOCK_ONLY_HIGH",
                personGeneration: "allow_adult",
                outputOptions: { mimeType: "image/jpeg", compressionQuality: 95 }
            }
        });

        const options = {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${accessToken.token}`,
                'Content-Type': 'application/json'
            }
        };

        const aiResponse = await new Promise((resolve, reject) => {
            const reqAi = https.request(endpoint, options, (resAi) => {
                let body = '';
                resAi.on('data', (chunk) => body += chunk);
                resAi.on('end', () => {
                    if (resAi.statusCode !== 200) return reject(new Error(`Imagen Error (${resAi.statusCode}): ${body}`));
                    try {
                        const response = JSON.parse(body);
                        const base64Image = response.predictions[0].bytesBase64Encoded;
                        resolve(Buffer.from(base64Image, 'base64'));
                    } catch (err) { reject(err); }
                });
            });
            reqAi.on('error', reject);
            reqAi.write(data);
            reqAi.end();
        });

        // Upload directly to Bunny.net Cloud Storage
        await uploadToBunny(aiResponse, slug, imageName);

        res.status(200).json({ success: true, url: `https://pelimotion-portfolio.b-cdn.net/blog/assets/${slug}/${imageName}.jpg` });
    } catch (error) {
        console.error('API Generate Image Error:', error);
        res.status(500).json({ error: error.message });
    }
}
