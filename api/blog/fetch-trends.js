const https = require('https');

export default async function handler(req, res) {
    if (req.method !== 'POST') return res.status(405).end();
    
    const { topic, category } = req.body;

    try {
        // In a real scenario, we would call SerpAPI or Google Trends here.
        // For this implementation, we use Gemini to 'predict' trends and provide editorial angles.
        
        const prompt = `Analise o tema "${topic}" na categoria "${category || 'Geral'}". 
        Aja como um motor de inteligência de tendências para Motion Design e Branding.
        Sugira 5 ângulos editoriais únicos, cada um com um "hype_score" (0-100) e sub-tópicos relacionados.
        Retorne APENAS um JSON array: 
        [{"angle": "Título do Ângulo", "hype": 85, "subtopics": ["sub1", "sub2"], "description": "Breve motivo do hype"}]`;

        const aiRes = await fetch(process.env.DOMAIN + '/api/blog/generate-text', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ prompt, modelType: 'flash' })
        });
        
        const data = await aiRes.json();
        const clean = data.content.replace(/```json/g, '').replace(/```/g, '').trim();
        const trends = JSON.parse(clean);

        res.status(200).json(trends);
    } catch (error) {
        console.error('Trend API Error:', error);
        res.status(500).json({ error: error.message });
    }
}
