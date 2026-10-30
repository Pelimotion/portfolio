export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { email, full_name, adminToken } = req.body || {};
  const SUPABASE_URL = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
  const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;

  if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
    return res.status(500).json({ error: 'Service role key or Supabase URL not configured' });
  }

  if (!email || typeof email !== 'string' || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({ error: 'E-mail inválido.' });
  }

  // Extract caller Bearer token from Authorization header or req.body.adminToken
  const authHeader = req.headers.authorization || '';
  const callerToken = authHeader.startsWith('Bearer ')
    ? authHeader.slice(7).trim()
    : (typeof adminToken === 'string' ? adminToken.trim() : '');

  if (!callerToken) {
    return res.status(401).json({ error: 'Não autorizado: token de administrador ausente.' });
  }

  try {
    // 1. Verify caller session via Supabase Auth API
    const authResp = await fetch(`${SUPABASE_URL}/auth/v1/user`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${callerToken}`,
        'apikey': SUPABASE_ANON_KEY || SUPABASE_SERVICE_KEY,
      },
    });

    if (!authResp.ok) {
      return res.status(401).json({ error: 'Sessão inválida ou expirada.' });
    }

    const callerUser = await authResp.json();
    if (!callerUser?.id) {
      return res.status(401).json({ error: 'Usuário não identificado.' });
    }

    // Verify caller has admin role in profiles
    const callerProfileResp = await fetch(
      `${SUPABASE_URL}/rest/v1/profiles?id=eq.${encodeURIComponent(callerUser.id)}&select=role`,
      {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
          'apikey': SUPABASE_SERVICE_KEY,
        },
      }
    );

    const callerProfiles = callerProfileResp.ok ? await callerProfileResp.json() : [];
    const callerRole = Array.isArray(callerProfiles) ? callerProfiles[0]?.role : null;
    if (callerRole !== 'admin') {
      return res.status(403).json({ error: 'Acesso negado: privilégios de administrador exigidos.' });
    }

    // 2. Check if target email already exists in profiles
    const existingResp = await fetch(
      `${SUPABASE_URL}/rest/v1/profiles?email=eq.${encodeURIComponent(email)}&select=id`,
      {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
          'apikey': SUPABASE_SERVICE_KEY,
        },
      }
    );

    if (existingResp.ok) {
      const existingRows = await existingResp.json();
      if (Array.isArray(existingRows) && existingRows.length > 0) {
        return res.status(400).json({ error: 'Usuário já cadastrado no sistema.' });
      }
    }

    // 3. Invite user via Supabase Auth Admin REST endpoint
    const inviteResp = await fetch(`${SUPABASE_URL}/auth/v1/invite`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': SUPABASE_SERVICE_KEY,
        'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
      },
      body: JSON.stringify({
        email,
        data: { full_name: full_name || '' },
      }),
    });

    const inviteData = await inviteResp.json();
    if (!inviteResp.ok) {
      throw new Error(inviteData.msg || inviteData.error_description || inviteData.message || 'Erro ao enviar convite.');
    }

    return res.status(200).json({ message: 'Convite enviado com sucesso!', user: inviteData });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
