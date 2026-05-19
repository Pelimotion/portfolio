/**
 * Bunny Edge Script — /extract-text
 * Extrai texto plano de arquivos do Google Drive.
 *
 * Bundling (antes do deploy):
 *   npm install --save-dev esbuild pdf-parse mammoth
 *   npx esbuild index.js --bundle --platform=browser --outfile=dist/index.js --minify
 *   # Verificar: ls -lh dist/index.js  → deve ser < 1MB
 *
 * Limite de RAM: 128MB | CPU: 30s | Bundle: ≤ 1MB
 *
 * ATENÇÃO: pdf-parse (~150KB) + mammoth (~300KB) ≈ 450KB bundled.
 * Se ultrapassar 1MB após minificação, mover extração de PDF/DOCX
 * para client-side (WASM) ou job assíncrono.
 */

import pdfParse from 'pdf-parse';
import mammoth from 'mammoth';

const ALLOWED_ORIGINS = ['https://app.pelimotion.com', 'http://localhost:5173'];

async function handleRequest(request) {
  const origin = request.headers.get('Origin') || '';
  const corsHeaders = {
    'Access-Control-Allow-Origin': ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0],
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };

  if (request.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: corsHeaders });
  }

  if (request.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid JSON body' }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  const { driveFileId, mimeType, accessToken } = body;

  if (!driveFileId || !mimeType || !accessToken) {
    return new Response(JSON.stringify({ error: 'driveFileId, mimeType e accessToken são obrigatórios' }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  try {
    const result = await extractText(driveFileId, mimeType, accessToken);
    return new Response(JSON.stringify(result), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (err) {
    console.error('[extract-text] error:', err.message);
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
}

async function extractText(fileId, mimeType, accessToken) {
  const authHeader = { Authorization: `Bearer ${accessToken}` };

  // ── Google Docs → export como texto plano ──────────────────
  if (mimeType === 'application/vnd.google-apps.document') {
    const res = await fetch(
      `https://www.googleapis.com/drive/v3/files/${fileId}/export?mimeType=text%2Fplain`,
      { headers: authHeader }
    );
    if (!res.ok) throw new Error(`Google Docs export falhou: ${res.status} ${res.statusText}`);
    const text = await res.text();
    return { text, headings: extractMarkdownHeadings(text) };
  }

  // ── Texto plano / Markdown → passthrough ───────────────────
  if (mimeType === 'text/plain' || mimeType === 'text/markdown') {
    const res = await fetch(
      `https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`,
      { headers: authHeader }
    );
    if (!res.ok) throw new Error(`Download falhou: ${res.status}`);
    const text = await res.text();
    return { text, headings: extractMarkdownHeadings(text) };
  }

  // ── PDF → pdf-parse ────────────────────────────────────────
  if (mimeType === 'application/pdf') {
    const res = await fetch(
      `https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`,
      { headers: authHeader }
    );
    if (!res.ok) throw new Error(`Download PDF falhou: ${res.status}`);
    const buffer = await res.arrayBuffer();
    const parsed = await pdfParse(Buffer.from(buffer));
    return { text: parsed.text, headings: [] };
  }

  // ── DOCX → mammoth ─────────────────────────────────────────
  if (mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
    const res = await fetch(
      `https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`,
      { headers: authHeader }
    );
    if (!res.ok) throw new Error(`Download DOCX falhou: ${res.status}`);
    const buffer = await res.arrayBuffer();
    const result = await mammoth.extractRawText({ buffer });
    return { text: result.value, headings: [] };
  }

  throw new Error(`Tipo não suportado: ${mimeType}`);
}

function extractMarkdownHeadings(text) {
  const headings = [];
  let offset = 0;
  for (const line of text.split('\n')) {
    const match = line.match(/^#{1,6}\s+(.+)/);
    if (match) {
      headings.push({ text: match[1].trim(), charOffset: offset });
    }
    offset += line.length + 1; // +1 para o \n
  }
  return headings;
}

addEventListener('fetch', (event) => {
  event.respondWith(handleRequest(event.request));
});
