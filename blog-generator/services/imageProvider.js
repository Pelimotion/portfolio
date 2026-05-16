const fs = require('fs');
const path = require('path');
const https = require('https');
const { GoogleAuth } = require('google-auth-library');

const BUNNY_API_KEY = process.env.BUNNY_API_KEY;
const BUNNY_STORAGE_ZONE = process.env.BUNNY_STORAGE_ZONE;

async function uploadToBunny(buffer, remotePath) {
    if (!BUNNY_API_KEY || !BUNNY_STORAGE_ZONE) return;

    const url = `https://storage.bunnycdn.com/${BUNNY_STORAGE_ZONE}${remotePath}`;
    const options = {
        method: 'PUT',
        headers: {
            'AccessKey': BUNNY_API_KEY,
            'Content-Type': 'image/jpeg',
            'Content-Length': buffer.length
        }
    };

    return new Promise((resolve) => {
        const req = https.request(url, options, (res) => {
            if (res.statusCode === 201 || res.statusCode === 200) {
                console.log(`✅ Uploaded to Bunny: ${remotePath}`);
            } else {
                console.error(`❌ Bunny Upload Error (${res.statusCode}): ${remotePath}`);
            }
            resolve();
        });
        req.on('error', (e) => {
            console.error(`❌ Bunny Request Error: ${e.message}`);
            resolve();
        });
        req.write(buffer);
        req.end();
    });
}

/**
 * Image Provider Service
 * Using Google Cloud Vertex AI (Imagen) with Service Account
 * And syncing to Bunny.net
 */
async function generatePostImages(prompt, slug, imageName = 'hero') {
    const projectId = process.env.GOOGLE_CLOUD_PROJECT_ID || 'pelimotion-blog';
    const location = 'us-central1';
    
    const assetsDir = path.join(__dirname, '..', '..', 'blog', 'assets', slug);
    if (!fs.existsSync(assetsDir)) {
        fs.mkdirSync(assetsDir, { recursive: true });
    }

    const imgPath = path.join(assetsDir, `${imageName}.jpg`);
    const thumbPath = path.join(assetsDir, 'thumb.jpg');

    // Remote path for Bunny.net
    const remotePath = `/blog/assets/${slug}/${imageName}.jpg`;

    // Skip if image already exists locally (we assume it's also on Bunny or will be overwritten if needed)
    if (fs.existsSync(imgPath)) {
        return;
    }

    console.log(`Generating image [${imageName}] for [${slug}] via Google Vertex AI...`);

    try {
        const auth = new GoogleAuth({
            scopes: 'https://www.googleapis.com/auth/cloud-platform'
        });
        const client = await auth.getClient();
        const accessToken = await client.getAccessToken();

        const endpoint = `https://${location}-aiplatform.googleapis.com/v1/projects/${projectId}/locations/${location}/publishers/google/models/imagen-3.0-generate-001:predict`;

        const data = JSON.stringify({
            instances: [{ prompt: prompt }],
            parameters: {
                sampleCount: 1,
                aspectRatio: "16:9",
                outputOptions: { mimeType: "image/jpeg" }
            }
        });

        const options = {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${accessToken.token}`,
                'Content-Type': 'application/json',
                'Content-Length': data.length
            }
        };

        return new Promise((resolve) => {
            const req = https.request(endpoint, options, (res) => {
                let body = '';
                res.on('data', (chunk) => body += chunk);
                res.on('end', async () => {
                    if (res.statusCode !== 200) {
                        console.error(`Vertex AI Error (${res.statusCode}):`, body);
                        createPlaceholder(imgPath, 1200, 630);
                        return resolve();
                    }

                    try {
                        const response = JSON.parse(body);
                        const base64Image = response.predictions[0].bytesBase64Encoded;
                        const buffer = Buffer.from(base64Image, 'base64');
                        
                        // Save locally
                        fs.writeFileSync(imgPath, buffer);
                        
                        // Upload to Bunny
                        await uploadToBunny(buffer, remotePath);

                        if (imageName === 'hero' && !fs.existsSync(thumbPath)) {
                            fs.writeFileSync(thumbPath, buffer);
                            await uploadToBunny(buffer, `/blog/assets/${slug}/thumb.jpg`);
                        }
                        
                        console.log(`Successfully generated and saved ${imageName} for ${slug}`);
                        resolve();
                    } catch (err) {
                        console.error('Error parsing Vertex AI response:', err);
                        resolve();
                    }
                });
            });

            req.on('error', (e) => {
                console.error('Request error:', e);
                resolve();
            });

            req.write(data);
            req.end();
        });
    } catch (error) {
        console.error('Auth error:', error);
        createPlaceholder(imgPath, 1200, 630);
    }
}

function createPlaceholder(filePath, width, height) {
    const svg = `<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
        <rect width="100%" height="100%" fill="#1a1a1a"/>
        <text x="50%" y="50%" font-family="Arial" font-size="24" fill="#333" text-anchor="middle">Image Pending</text>
    </svg>`;
    const outPath = filePath.replace('.jpg', '.svg');
    fs.writeFileSync(outPath, svg);
}

module.exports = {
    generatePostImages
};
