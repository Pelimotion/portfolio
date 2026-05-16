const { GoogleAuth } = require('google-auth-library');
const https = require('https');
const fs = require('fs');
const path = require('path');

const CACHE_FILE = path.join(__dirname, '..', 'ai-cache.json');

// Simple file-based cache for "Semantic Caching"
function getCache(key) {
    if (!fs.existsSync(CACHE_FILE)) return null;
    const cache = JSON.parse(fs.readFileSync(CACHE_FILE, 'utf-8'));
    return cache[key] || null;
}

function setCache(key, value) {
    let cache = {};
    if (fs.existsSync(CACHE_FILE)) {
        cache = JSON.parse(fs.readFileSync(CACHE_FILE, 'utf-8'));
    }
    cache[key] = { value, timestamp: Date.now() };
    fs.writeFileSync(CACHE_FILE, JSON.stringify(cache, null, 2));
}

async function generateText(prompt, modelType = 'flash') {
    // Check cache first for simple tasks
    const cacheKey = `${modelType}:${prompt.substring(0, 100)}`;
    const cached = getCache(cacheKey);
    if (cached && (Date.now() - cached.timestamp < 1000 * 60 * 60 * 24)) { // 24h cache
        console.log(`[Cache Hit] for ${modelType}`);
        return cached.value;
    }

    const projectId = process.env.GOOGLE_CLOUD_PROJECT_ID || 'pelimotion-blog';
    const location = 'us-central1';
    
    // Model Routing Strategy
    // Using gemini-2.5-flash or flash for speed/cost
    const modelId = modelType === 'pro' ? 'gemini-2.5-pro' : 'gemini-2.5-flash';

    try {
        const credentialsEnv = process.env.GOOGLE_APPLICATION_CREDENTIALS;
        let authOptions = {
            scopes: 'https://www.googleapis.com/auth/cloud-platform'
        };

        if (credentialsEnv && credentialsEnv.trim().startsWith('{')) {
            authOptions.credentials = JSON.parse(credentialsEnv);
        }

        const auth = new GoogleAuth(authOptions);
        const client = await auth.getClient();
        const accessToken = await client.getAccessToken();

        // Trying v1beta as it often has broader model availability
        const endpoint = `https://${location}-aiplatform.googleapis.com/v1beta1/projects/${projectId}/locations/${location}/publishers/google/models/${modelId}:generateContent`;

        const data = JSON.stringify({
            contents: [{
                role: "user",
                parts: [{ text: prompt }]
            }],
            generationConfig: {
                temperature: modelType === 'pro' ? 0.8 : 0.4, // Higher temperature for creativity
                maxOutputTokens: 4096
            }
        });

        const options = {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${accessToken.token}`,
                'Content-Type': 'application/json',
                'Content-Length': Buffer.byteLength(data)
            }
        };

        return new Promise((resolve, reject) => {
            const req = https.request(endpoint, options, (res) => {
                let body = '';
                res.on('data', (chunk) => body += chunk);
                res.on('end', () => {
                    if (res.statusCode !== 200) {
                        return reject(new Error(`Vertex AI Error (${res.statusCode}): ${body}`));
                    }
                    try {
                        const response = JSON.parse(body);
                        if (!response.candidates || !response.candidates[0].content) {
                            return reject(new Error('Empty AI response'));
                        }
                        const text = response.candidates[0].content.parts[0].text;
                        setCache(cacheKey, text.trim());
                        resolve(text.trim());
                    } catch (err) {
                        reject(err);
                    }
                });
            });

            req.on('error', (e) => reject(e));
            req.write(data);
            req.end();
        });
    } catch (error) {
        console.error(`generateText (${modelId}) Error:`, error);
        throw error;
    }
}

module.exports = {
    generateText
};
