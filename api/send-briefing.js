import { createClient } from '@supabase/supabase-js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { slug, cliente_nome, respostas } = req.body;

  const RESEND_API_KEY = process.env.RESEND_API_KEY;
  const NOTIFICATION_EMAIL = process.env.NOTIFICATION_EMAIL || 'hello@pelimotion.art';

  if (!RESEND_API_KEY) {
    console.warn('RESEND_API_KEY não está configurada nos environment variables do Vercel.');
    return res.status(200).json({ 
      success: true, 
      warning: 'Briefing salvo, mas e-mail não enviado: RESEND_API_KEY ausente.' 
    });
  }

  // Formatar o e-mail de forma editorial e bonita (dark mode)
  let emailHtml = `
    <div style="font-family: 'DM Sans', -apple-system, sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 30px; background-color: #080808; color: #efefef; border-radius: 8px; border: 1px solid #1a1a1a;">
      <header style="margin-bottom: 40px; border-bottom: 1px solid #1a1a1a; padding-bottom: 20px;">
        <span style="font-size: 10px; text-transform: uppercase; letter-spacing: 0.2em; color: #909090; font-weight: 700;">Briefing Recebido</span>
        <h1 style="font-family: 'Syne', sans-serif; font-size: 28px; font-weight: 800; color: #ffffff; margin: 5px 0 0 0; letter-spacing: -0.02em;">
          ${cliente_nome}
        </h1>
        <p style="font-size: 13px; color: #909090; margin: 5px 0 0 0;">URL do Briefing: pelimotion.art/briefing/${slug}</p>
      </header>

      <div style="display: grid; gap: 30px;">
  `;

  for (const [pergunta, resposta] of Object.entries(respostas)) {
    if (resposta !== null && resposta !== undefined && (!Array.isArray(resposta) || resposta.length > 0)) {
      let formattedResposta = '';
      if (Array.isArray(resposta)) {
        formattedResposta = resposta.join(', ');
      } else {
        formattedResposta = String(resposta).replace(/\n/g, '<br/>');
      }

      emailHtml += `
        <div style="margin-bottom: 25px;">
          <h3 style="color: #909090; margin: 0 0 8px 0; font-size: 11px; text-transform: uppercase; letter-spacing: 0.1em; font-weight: 700;">
            ${pergunta}
          </h3>
          <div style="font-size: 15px; line-height: 1.6; color: #ffffff; background-color: #0f0f0f; padding: 16px 20px; border-radius: 4px; border: 1px solid rgba(255, 255, 255, 0.03); white-space: pre-wrap;">
            ${formattedResposta}
          </div>
        </div>
      `;
    }
  }

  emailHtml += `
      </div>

      <footer style="margin-top: 50px; padding-top: 20px; border-top: 1px solid #1a1a1a; text-align: center; color: #4a4a4a; font-size: 11px; letter-spacing: 0.05em;">
        Pelimotion Studio &copy; ${new Date().getFullYear()} &bull; Sistema de Gestão de Briefings
      </footer>
    </div>
  `;

  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: 'Pelimotion Briefing <onboarding@resend.dev>',
        to: NOTIFICATION_EMAIL,
        subject: `✦ Novo Briefing: ${cliente_nome}`,
        html: emailHtml,
      }),
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || 'Erro ao enviar email via Resend API.');
    }

    return res.status(200).json({ success: true, data });
  } catch (error) {
    console.error('Erro ao processar envio de email:', error);
    return res.status(500).json({ error: error.message });
  }
}
