// Bunny Edge Script — wide-image-studio router
// Entry point. Roteia /wide-api/* para os handlers correspondentes.
// Handlers individuais chegam nos PRs 6, 7 e 8; aqui está o scaffold de roteamento.

import { corsHeaders, handleCors, json, err } from "./utils/response.ts";
import { requireWideStudioRole, verifyHmac } from "./utils/auth.ts";

// Bunny Edge Scripting usa o padrão addEventListener("fetch")
addEventListener("fetch", (event: FetchEvent) => {
  event.respondWith(route(event.request));
});

async function route(req: Request): Promise<Response> {
  const origin = req.headers.get("Origin");

  // CORS preflight
  const preflight = handleCors(req);
  if (preflight) return preflight;

  const url = new URL(req.url);
  // Normaliza: /wide-api/start → /start
  const path = url.pathname.replace(/^\/wide-api/, "") || "/";

  try {
    if (path === "/health" && req.method === "GET") {
      return json({ ok: true, ts: Date.now() }, 200, corsHeaders(origin));
    }

    if (path === "/upload-ref" && req.method === "POST") {
      const { userId } = await requireWideStudioRole(req);
      return handleUploadRef(req, userId, origin);
    }

    if (path === "/start" && req.method === "POST") {
      const { userId } = await requireWideStudioRole(req);
      return handleStart(req, userId, origin);
    }

    if (path === "/approve-master" && req.method === "POST") {
      const { userId } = await requireWideStudioRole(req);
      return handleApproveMaster(req, userId, origin);
    }

    if (path === "/hf-webhook" && req.method === "POST") {
      // Webhook não usa JWT — usa HMAC do secret compartilhado com HF
      const body = await req.text();
      await verifyHmac(req, body);
      return handleWebhook(req, body);
    }

    return err("Not found", 404, corsHeaders(origin));
  } catch (e: unknown) {
    const status = (e as any).status ?? 500;
    const message = e instanceof Error ? e.message : "Internal error";
    if (status === 500) console.error("[wide-api] Unhandled error:", e);
    return err(message, status, corsHeaders(origin));
  }
}

// Stubs — implementados nos PRs 6, 7 e 8
// Retornam 501 Not Implemented para que o router e auth já possam ser testados.

async function handleUploadRef(
  _req: Request,
  _userId: string,
  origin: string | null,
): Promise<Response> {
  return err("Not implemented — chega no PR 6", 501, corsHeaders(origin));
}

async function handleStart(
  _req: Request,
  _userId: string,
  origin: string | null,
): Promise<Response> {
  return err("Not implemented — chega no PR 6", 501, corsHeaders(origin));
}

async function handleApproveMaster(
  _req: Request,
  _userId: string,
  origin: string | null,
): Promise<Response> {
  return err("Not implemented — chega no PR 8", 501, corsHeaders(origin));
}

async function handleWebhook(
  _req: Request,
  _body: string,
): Promise<Response> {
  return err("Not implemented — chega no PR 7", 501);
}
