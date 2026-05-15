import { createClient } from '@supabase/supabase-js';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { email, full_name } = req.body;
  const SUPABASE_URL = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
  const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!SUPABASE_SERVICE_KEY) {
    return res.status(500).json({ error: 'Service role key not configured' });
  }

  const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });

  try {
    // 1. Verificar se o usuário já existe
    const { data: existingUser } = await supabaseAdmin.from('profiles').select('id').eq('email', email).single();
    if (existingUser) {
      return res.status(400).json({ error: 'Usuário já cadastrado no sistema.' });
    }

    // 2. Convidar usuário (Envia e-mail e cria no Auth sem deslogar o admin)
    const { data, error } = await supabaseAdmin.auth.admin.inviteUserByEmail(email, {
      data: { full_name }
    });

    if (error) throw error;

    return res.status(200).json({ message: 'Convite enviado com sucesso!', user: data.user });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
