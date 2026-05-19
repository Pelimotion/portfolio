// Helpers de resposta e CORS para o edge script.
// ALLOWED_ORIGIN é lido em runtime — não inlinado pelo esbuild.

export function getAllowedOrigin(): string {
  return (globalThis as any).process?.env?.ALLOWED_ORIGIN ?? "";
}

export function corsHeaders(requestOrigin: string | null): Record<string, string> {
  const allowed = getAllowedOrigin();
  const headers: Record<string, string> = {
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Authorization, Content-Type",
    "Access-Control-Max-Age": "86400",
  };
  if (requestOrigin && requestOrigin === allowed) {
    headers["Access-Control-Allow-Origin"] = requestOrigin;
  }
  return headers;
}

export function handleCors(req: Request): Response | null {
  if (req.method !== "OPTIONS") return null;
  return new Response(null, {
    status: 204,
    headers: corsHeaders(req.headers.get("Origin")),
  });
}

export function json(
  body: unknown,
  status = 200,
  extra: Record<string, string> = {},
): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json", ...extra },
  });
}

export function err(
  message: string,
  status = 400,
  extra: Record<string, string> = {},
): Response {
  return json({ error: message }, status, extra);
}
