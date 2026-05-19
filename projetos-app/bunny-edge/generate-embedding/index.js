/**
 * Bunny Edge Script — /generate-embedding (K.5)
 * Gera embedding de texto via Vertex AI text-embedding-004.
 * Retorna vetor de 768 dimensões para uso em busca híbrida (pgvector).
 *
 * Variáveis de ambiente (configurar no painel Bunny Edge):
 *   VERTEX_PROJECT_ID   — GCP project ID (ex: "pelimotion-prod")
 *   VERTEX_LOCATION     — região (ex: "us-central1")
 *   VERTEX_API_KEY      — API key do Google Cloud com acesso ao Vertex AI
 *   ALLOWED_ORIGIN      — origem permitida (ex: "https://app.pelimotion.com")
 *
 * Bundling (antes do deploy):
 *   npx esbuild index.js --bundle --platform=browser --outfile=dist/index.js --minify
 *   # Verificar: ls -lh dist/index.js → deve ser << 1MB (sem dependências externas)
 *
 * Limite: 128MB RAM | 30s CPU | Bundle ≤ 1MB
 */

const ALLOWED_ORIGINS = [
  BunnyEdge?.env?.ALLOWED_ORIGIN ?? 'https://app.pelimotion.com',
  'http://localhost:5173',
];

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

  const { text } = body;
  if (!text || typeof text !== 'string' || text.trim().length === 0) {
    return new Response(JSON.stringify({ error: 'Campo "text" obrigatório' }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  const projectId = BunnyEdge?.env?.VERTEX_PROJECT_ID;
  const location = BunnyEdge?.env?.VERTEX_LOCATION ?? 'us-central1';
  const apiKey = BunnyEdge?.env?.VERTEX_API_KEY;

  if (!projectId || !apiKey) {
    return new Response(JSON.stringify({ error: 'Vertex AI não configurado' }), {
      status: 503,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  try {
    const embedding = await generateEmbedding(text.slice(0, 8192), projectId, location, apiKey);
    return new Response(JSON.stringify({ embedding }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (err) {
    console.error('[generate-embedding] error:', err.message);
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
}

/**
 * Chama Vertex AI text-embedding-004.
 * Retorna float[] com 768 dimensões.
 */
async function generateEmbedding(text, projectId, location, apiKey) {
  const endpoint = `https://${location}-aiplatform.googleapis.com/v1/projects/${projectId}/locations/${location}/publishers/google/models/text-embedding-004:predict`;

  const res = await fetch(`${endpoint}?key=${apiKey}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      instances: [{ content: text, task_type: 'RETRIEVAL_QUERY' }],
    }),
  });

  if (!res.ok) {
    const errText = await res.text().catch(() => res.statusText);
    throw new Error(`Vertex AI error ${res.status}: ${errText.slice(0, 200)}`);
  }

  const data = await res.json();
  const values = data?.predictions?.[0]?.embeddings?.values;

  if (!Array.isArray(values) || values.length === 0) {
    throw new Error('Resposta inesperada do Vertex AI (sem embeddings.values)');
  }

  return values;
}

addEventListener('fetch', (event) => {
  event.respondWith(handleRequest(event.request));
});
