const MAX_BASE64_BYTES = 10 * 1024 * 1024; // 10MB max payload

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { filename, contentType, base64Data } = req.body || {};
  if (!filename || !contentType || !base64Data) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  if (typeof filename !== 'string' || typeof contentType !== 'string' || typeof base64Data !== 'string') {
    return res.status(400).json({ error: 'Invalid field types' });
  }

  const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
  if (!validTypes.includes(contentType)) {
    return res.status(400).json({ error: 'Invalid content type' });
  }

  // Enforce 10MB maximum decoded size
  const estimatedBytes = Math.ceil((base64Data.length * 3) / 4);
  if (estimatedBytes > MAX_BASE64_BYTES) {
    return res.status(413).json({ error: 'Payload too large (max 10MB)' });
  }

  // Verify session if Authorization header is provided, or validate trusted pelimotion.art origin/referer
  const authHeader = req.headers.authorization || '';
  const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_ANON_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (authHeader.startsWith('Bearer ') && supabaseUrl && supabaseKey) {
    const token = authHeader.slice(7).trim();
    const userResp = await fetch(`${supabaseUrl}/auth/v1/user`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'apikey': supabaseKey,
      },
    });
    if (!userResp.ok) {
      return res.status(401).json({ error: 'Invalid or expired authentication token' });
    }
  } else {
    const origin = req.headers.origin || '';
    const referer = req.headers.referer || '';
    const isTrustedOrigin =
      origin.includes('pelimotion.art') ||
      referer.includes('pelimotion.art') ||
      origin.includes('localhost') ||
      referer.includes('localhost');
    if (!isTrustedOrigin) {
      return res.status(403).json({ error: 'Unauthorized origin' });
    }
  }

  const BUNNY_API_KEY = process.env.BUNNY_API_KEY;
  if (!BUNNY_API_KEY) {
    return res.status(500).json({ error: 'BUNNY_API_KEY environment variable is not configured on Vercel.' });
  }

  const zone = 'pelimotion-portfolio';
  const cdnBase = 'https://pelimotion-portfolio.b-cdn.net';

  // Strict path traversal & basename sanitization
  const baseName = filename.split(/[\\/]/).pop() || 'frame.jpg';
  const safeFilename = baseName.replace(/\.\.+/g, '.').replace(/[^a-zA-Z0-9._-]/g, '_').slice(0, 120);
  const path = `/frames/${Date.now()}-${safeFilename}`;
  const url = `https://storage.bunnycdn.com/${zone}${path}`;

  try {
    const buffer = Buffer.from(base64Data, 'base64');
    if (buffer.byteLength > MAX_BASE64_BYTES) {
      return res.status(413).json({ error: 'Decoded image exceeds 10MB limit' });
    }

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
