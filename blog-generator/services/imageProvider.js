const fs = require('fs');
const path = require('path');
const https = require('https');
const { GoogleAuth } = require('google-auth-library');

/**
 * Image Provider Service
 * Using Google Cloud Vertex AI (Imagen) with Service Account
 */
async function generatePostImages(prompt, slug) {
    const projectId = process.env.GOOGLE_CLOUD_PROJECT_ID || 'pelimotion-blog';
    const location = 'us-central1';
    
    const assetsDir = path.join(__dirname, '..', '..', 'blog', 'assets', slug);
    if (!fs.existsSync(assetsDir)) {
        fs.mkdirSync(assetsDir, { recursive: true });
    }

    const heroPath = path.join(assetsDir, 'hero.jpg');
    const thumbPath = path.join(assetsDir, 'thumb.jpg');

    // Skip if images already exist
    if (fs.existsSync(heroPath) && fs.existsSync(thumbPath)) {
        console.log(`Images for ${slug} already exist. Skipping API call.`);
        return;
    }

    console.log(`Generating images for [${slug}] via Google Vertex AI Service Account...`);

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
                res.on('end', () => {
                    if (res.statusCode !== 200) {
                        console.error(`Vertex AI Error (${res.statusCode}):`, body);
                        createPlaceholder(heroPath, 1200, 630);
                        createPlaceholder(thumbPath, 600, 400);
                        return resolve();
                    }

                    try {
                        const response = JSON.parse(body);
                        const base64Image = response.predictions[0].bytesBase64Encoded;
                        const buffer = Buffer.from(base64Image, 'base64');
                        
                        fs.writeFileSync(heroPath, buffer);
                        fs.writeFileSync(thumbPath, buffer);
                        
                        console.log(`Successfully generated and saved images for ${slug}`);
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
        createPlaceholder(heroPath, 1200, 630);
        createPlaceholder(thumbPath, 600, 400);
    }
}

function createPlaceholder(filePath, width, height) {
    const svg = `<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
        <rect width="100%" height="100%" fill="#1a1a1a"/>
        <text x="50%" y="50%" font-family="Arial" font-size="24" fill="#333" text-anchor="middle">Image Pending</text>
    </svg>`;
    fs.writeFileSync(filePath.replace('.webp', '.svg'), svg);
    console.log(`Created placeholder for ${path.basename(filePath)}`);
}

module.exports = {
    generatePostImages
};
