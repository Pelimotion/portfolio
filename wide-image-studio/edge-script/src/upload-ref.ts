// POST /upload-ref — proxy stream cliente → Higgsfield /v2/files.
// Nunca faz buffer do arquivo em RAM. Zero-storage: nenhum byte fica em nossos sistemas.

import { corsHeaders, err, json } from "./utils/response.ts";

const HF_BASE = "https://api.higgsfield.ai";

function getEnv(key: string): string {
  const val = Deno.env.get(key);
  if (!val) throw new Error(`Missing env: ${key}`);
  return val;
}

export async function handleUploadRef(
  req: Request,
  _userId: string,
  origin: string | null,
): Promise<Response> {
  const contentType = req.headers.get("Content-Type");
  if (!contentType) {
    return err("Content-Type header obrigatório", 400, corsHeaders(origin));
  }

  const hfRes = await fetch(`${HF_BASE}/v2/files`, {
    method: "POST",
    headers: {
      Authorization: `Key ${getEnv("HF_API_KEY")}:${getEnv("HF_SECRET")}`,
      "Content-Type": contentType,
    },
    // Stream direto sem buffer — req.body é ReadableStream
    body: req.body,
    // @ts-ignore — Deno extended fetch requer duplex para body streaming
    duplex: "half",
  });

  if (!hfRes.ok) {
    const msg = await hfRes.text().catch(() => "");
    console.error("[upload-ref] HF error:", hfRes.status, msg);
    return err("Upload para Higgsfield falhou", 502, corsHeaders(origin));
  }

  const data = await hfRes.json();
  return json(data, 200, corsHeaders(origin));
}
