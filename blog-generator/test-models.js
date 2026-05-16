require('dotenv').config({ path: '../.env' });
const { GoogleAuth } = require('google-auth-library');
const https = require('https');

async function check() {
    const auth = new GoogleAuth({ scopes: 'https://www.googleapis.com/auth/cloud-platform' });
    const client = await auth.getClient();
    const token = await client.getAccessToken();
    const projectId = 'pelimotion-blog';
    
    const opts = {
        hostname: 'us-central1-aiplatform.googleapis.com',
        path: `/v1beta1/projects/${projectId}/locations/us-central1/publishers/google/models/gemini-1.5-flash:generateContent`,
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token.token}`, 'Content-Type': 'application/json' }
    };
    
    const req = https.request(opts, res => {
        let body = '';
        res.on('data', c => body += c);
        res.on('end', () => console.log('Response:', res.statusCode, body));
    });
    req.write(JSON.stringify({contents: [{role: "user", parts: [{text: "Hi"}]}]}));
    req.end();
}
check();
