/**
 * Bunny Edge Script — /reindex-cron (K.7)
 * Re-indexação incremental de documentos do Drive via `changes.list`.
 * Deve ser agendado como Bunny Edge Cron (ex: a cada 30 minutos).
 *
 * Estratégia:
 *   1. Lê o `pageToken` salvo no Supabase (tabela `kv_store`).
 *   2. Chama Drive `changes.list` com esse token para obter arquivos modificados.
 *   3. Para cada arquivo modificado relevante, re-extrai e re-indexa os chunks.
 *   4. Salva o novo `pageToken` no Supabase.
 *
 * PRÉ-REQUISITO — tabela `kv_store` no Supabase:
 *   CREATE TABLE IF NOT EXISTS kv_store (
 *     key   TEXT PRIMARY KEY,
 *     value TEXT,
 *     updated_at TIMESTAMPTZ DEFAULT now()
 *   );
 *   -- RLS: somente service_role pode escrever
 *   ALTER TABLE kv_store ENABLE ROW LEVEL SECURITY;
 *   CREATE POLICY "service_role_only" ON kv_store
 *     USING (auth.role() = 'service_role');
 *
 * Variáveis de ambiente (configurar no painel Bunny Edge):
 *   SUPABASE_URL          — ex: "https://gfaqnkmmbozmhroicqyc.supabase.co"
 *   SUPABASE_SERVICE_KEY  — service_role key (NÃO expor no client)
 *   EXTRACT_TEXT_URL      — URL do Bunny Edge /extract-text
 *   DRIVE_SERVICE_TOKEN   — OAuth access token de service account Google Drive
 *                           (renovar via `refresh_token` + `DRIVE_CLIENT_*` abaixo)
 *   DRIVE_CLIENT_ID
 *   DRIVE_CLIENT_SECRET
 *   DRIVE_REFRESH_TOKEN
 *
 * Bundling:
 *   npx esbuild index.js --bundle --platform=browser --outfile=dist/index.js --minify
 */

const SUPPORTED_MIME_TYPES = new Set([
  'application/vnd.google-apps.document',
  'text/plain',
  'text/markdown',
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
]);

const CHUNK_SIZE = 800;
const CHUNK_OVERLAP = 100;
const KV_KEY = 'drive_changes_page_token';

// ── Entry point ───────────────────────────────────────────────

addEventListener('fetch', (event) => {
  event.respondWith(handleRequest(event.request));
});

async function handleRequest(request) {
  // Allow cron trigger (GET) or manual POST trigger
  if (request.method !== 'GET' && request.method !== 'POST') {
    return jsonResponse({ error: 'Method not allowed' }, 405);
  }

  const env = BunnyEdge?.env ?? {};
  const supabaseUrl = env.SUPABASE_URL;
  const supabaseKey = env.SUPABASE_SERVICE_KEY;
  const extractUrl = env.EXTRACT_TEXT_URL;

  if (!supabaseUrl || !supabaseKey || !extractUrl) {
    return jsonResponse({ error: 'Variáveis de ambiente incompletas' }, 503);
  }

  try {
    const accessToken = await getOrRefreshDriveToken(env);
    const pageToken = await getPageToken(supabaseUrl, supabaseKey, accessToken);

    const { changes, newPageToken } = await listChanges(accessToken, pageToken);
    const relevant = changes.filter(c =>
      !c.removed &&
      c.file &&
      SUPPORTED_MIME_TYPES.has(c.file.mimeType) &&
      c.file.trashed !== true
    );

    const results = { processed: 0, skipped: 0, errors: [] };

    for (const change of relevant) {
      try {
        await reindexFile(change.file, accessToken, extractUrl, supabaseUrl, supabaseKey);
        results.processed++;
      } catch (err) {
        console.error(`[reindex-cron] erro ao reindexar ${change.file.name}:`, err.message);
        results.errors.push({ file: change.file.name, error: err.message });
        results.skipped++;
      }
    }

    await savePageToken(supabaseUrl, supabaseKey, newPageToken);

    console.log(`[reindex-cron] concluído: ${results.processed} reindexados, ${results.skipped} pulados`);
    return jsonResponse({ ok: true, changes: relevant.length, ...results });
  } catch (err) {
    console.error('[reindex-cron] erro crítico:', err.message);
    return jsonResponse({ error: err.message }, 500);
  }
}

// ── Drive helpers ─────────────────────────────────────────────

async function getOrRefreshDriveToken(env) {
  // Se houver token direto, use-o
  if (env.DRIVE_SERVICE_TOKEN) return env.DRIVE_SERVICE_TOKEN;

  // Refresh via OAuth2
  const res = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: env.DRIVE_CLIENT_ID,
      client_secret: env.DRIVE_CLIENT_SECRET,
      refresh_token: env.DRIVE_REFRESH_TOKEN,
      grant_type: 'refresh_token',
    }),
  });
  if (!res.ok) throw new Error(`OAuth refresh falhou: ${res.status}`);
  const data = await res.json();
  return data.access_token;
}

async function listChanges(accessToken, pageToken) {
  const params = new URLSearchParams({
    pageToken,
    fields: 'nextPageToken,newStartPageToken,changes(removed,file(id,name,mimeType,trashed,modifiedTime))',
    spaces: 'drive',
  });
  const res = await fetch(
    `https://www.googleapis.com/drive/v3/changes?${params}`,
    { headers: { Authorization: `Bearer ${accessToken}` } }
  );
  if (!res.ok) throw new Error(`Drive changes.list falhou: ${res.status}`);
  const data = await res.json();
  return {
    changes: data.changes ?? [],
    newPageToken: data.nextPageToken ?? data.newStartPageToken,
  };
}

// ── Supabase KV helpers ───────────────────────────────────────

async function getPageToken(supabaseUrl, supabaseKey, driveAccessToken) {
  const res = await fetch(`${supabaseUrl}/rest/v1/kv_store?key=eq.${KV_KEY}&select=value`, {
    headers: supabaseHeaders(supabaseKey),
  });
  const rows = res.ok ? await res.json() : [];
  if (rows.length > 0) return rows[0].value;

  // First run: get a fresh start page token from Drive
  const tokenRes = await fetch(
    'https://www.googleapis.com/drive/v3/changes/startPageToken',
    { headers: { Authorization: `Bearer ${driveAccessToken}` } }
  );
  if (!tokenRes.ok) throw new Error(`Não foi possível obter startPageToken: ${tokenRes.status}`);
  const { startPageToken } = await tokenRes.json();
  await savePageToken(supabaseUrl, supabaseKey, startPageToken);
  return startPageToken;
}

async function savePageToken(supabaseUrl, supabaseKey, token) {
  await fetch(`${supabaseUrl}/rest/v1/kv_store`, {
    method: 'POST',
    headers: {
      ...supabaseHeaders(supabaseKey),
      'Content-Type': 'application/json',
      Prefer: 'resolution=merge-duplicates',
    },
    body: JSON.stringify({ key: KV_KEY, value: token, updated_at: new Date().toISOString() }),
  });
}

function supabaseHeaders(serviceKey) {
  return {
    apikey: serviceKey,
    Authorization: `Bearer ${serviceKey}`,
  };
}

// ── Re-indexing logic ─────────────────────────────────────────

async function reindexFile(file, accessToken, extractUrl, supabaseUrl, supabaseKey) {
  // Extract text via Bunny Edge /extract-text
  const extractRes = await fetch(extractUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      driveFileId: file.id,
      mimeType: file.mimeType,
      accessToken,
    }),
  });
  if (!extractRes.ok) throw new Error(`extract-text falhou: ${extractRes.status}`);
  const { text } = await extractRes.json();
  if (!text) throw new Error('Texto vazio — arquivo pulado');

  // Garbled text detection (> 30% non-ASCII → skip)
  const nonAscii = (text.match(/[^\x00-\x7F]/g) ?? []).length;
  if (nonAscii / text.length > 0.3) throw new Error('Texto garbled (>30% non-ASCII) — pulado');

  const chunks = chunkText(text);

  // Delete existing chunks for this file
  await fetch(
    `${supabaseUrl}/rest/v1/document_chunks?drive_file_id=eq.${file.id}`,
    { method: 'DELETE', headers: supabaseHeaders(supabaseKey) }
  );

  // Insert new chunks
  if (chunks.length === 0) return;
  const rows = chunks.map((content, i) => ({
    drive_file_id: file.id,
    file_name: file.name,
    chunk_index: i,
    content,
    modified_at: file.modifiedTime,
  }));

  const insertRes = await fetch(`${supabaseUrl}/rest/v1/document_chunks`, {
    method: 'POST',
    headers: {
      ...supabaseHeaders(supabaseKey),
      'Content-Type': 'application/json',
      Prefer: 'return=minimal',
    },
    body: JSON.stringify(rows),
  });
  if (!insertRes.ok) {
    const err = await insertRes.text().catch(() => insertRes.statusText);
    throw new Error(`Supabase insert falhou: ${err.slice(0, 200)}`);
  }
}

function chunkText(text) {
  const chunks = [];
  let start = 0;
  while (start < text.length) {
    chunks.push(text.slice(start, start + CHUNK_SIZE));
    start += CHUNK_SIZE - CHUNK_OVERLAP;
  }
  return chunks;
}

function jsonResponse(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}
