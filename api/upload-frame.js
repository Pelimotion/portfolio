export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  
  const { filename, contentType, base64Data } = req.body;
  if (!filename || !contentType || !base64Data) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
  if (!validTypes.includes(contentType)) {
    return res.status(400).json({ error: 'Invalid content type' });
  }

  const BUNNY_API_KEY = process.env.BUNNY_API_KEY;
  if (!BUNNY_API_KEY) {
    return res.status(500).json({ error: 'BUNNY_API_KEY environment variable is not configured on Vercel.' });
  }

  const zone = 'pelimotion-portfolio';
  const cdnBase = 'https://pelimotion-portfolio.b-cdn.net';
  
  const safeFilename = filename.replace(/[^a-zA-Z0-9.-]/g, '_');
  const path = `/frames/${Date.now()}-${safeFilename}`;
  const url = `https://storage.bunnycdn.com/${zone}${path}`;

  try {
    const buffer = Buffer.from(base64Data, 'base64');
    
    const response = await fetch(url, {
      method: 'PUT',
      headers: {
        'AccessKey': BUNNY_API_KEY,
        'Content-Type': contentType,
        'Accept': '*/*'
      },
      body: buffer
    });

    if (!response.ok) {
      const errText = await response.text();
      return res.status(500).json({ error: `Bunny.net storage error: ${errText}` });
    }

    return res.status(200).json({ 
      success: true, 
      url: `${cdnBase}${path}`
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}
