const { GoogleAuth } = require('google-auth-library');
const https = require('https');

export default async function handler(req, res) {
    if (req.method !== 'POST') return res.status(405).end();

    const { prompt, modelType } = req.body;
    const projectId = process.env.GOOGLE_CLOUD_PROJECT_ID || 'pelimotion-blog';
    const location = 'us-central1';
    
    const modelId = modelType === 'pro' ? 'gemini-1.5-pro-001' : 'gemini-1.5-flash-001';

    try {
        const auth = new GoogleAuth({
            credentials: process.env.GOOGLE_APPLICATION_CREDENTIALS ? JSON.parse(process.env.GOOGLE_APPLICATION_CREDENTIALS) : undefined,
            scopes: 'https://www.googleapis.com/auth/cloud-platform'
        });
        const client = await auth.getClient();
        const accessToken = await client.getAccessToken();

        const endpoint = `https://${location}-aiplatform.googleapis.com/v1beta1/projects/${projectId}/locations/${location}/publishers/google/models/${modelId}:generateContent`;

        const data = JSON.stringify({
            contents: [{
                role: "user",
                parts: [{ text: prompt }]
            }],
            generationConfig: {
                temperature: modelType === 'pro' ? 0.8 : 0.4,
                maxOutputTokens: 4096
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
                    if (resAi.statusCode !== 200) return reject(new Error(`Vertex AI Error (${resAi.statusCode}): ${body}`));
                    try {
                        const response = JSON.parse(body);
                        resolve(response.candidates[0].content.parts[0].text.trim());
                    } catch (err) { reject(err); }
                });
            });
            reqAi.on('error', reject);
            reqAi.write(data);
            reqAi.end();
        });

        res.status(200).json({ text: aiResponse });
    } catch (error) {
        console.error('API Generate Text Error:', error);
        res.status(500).json({ error: error.message });
    }
}
