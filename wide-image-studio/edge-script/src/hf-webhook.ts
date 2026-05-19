// POST /hf-webhook — recebe notificações do Higgsfield, atualiza state machine no Supabase.
// HMAC-SHA256 já verificado em index.ts antes de chamar este handler.
//
// Fluxo de estados:
//   master job completed  → master_ready  (frontend mostra para aprovação humana)
//   tile job completed    → tiles_partial → tiles_ready (todos os N tiles prontos)
//   qualquer job failed   → failed        (error_log append)

import { err, json } from "./utils/response.ts";
import {
  dbGetJobByMasterHfId,
  dbGetJobByTileHfId,
  dbPatchJob,
  WideJob,
} from "./utils/supabase.ts";

// Status HF que indicam conclusão ou falha — ignorar intermediários (queued, processing...)
const TERMINAL_HF_STATUSES = new Set(["completed", "success", "failed", "error"]);
const FAILED_HF_STATUSES = new Set(["failed", "error"]);

// Estados do nosso job onde já não faz sentido regredir para master_ready
const POST_MASTER_STATUSES = new Set([
  "tiles_pending",
  "tiles_partial",
  "tiles_ready",
  "done",
  "failed",
  "cancelled",
  "expired",
]);

export async function handleWebhook(
  _req: Request,
  body: string,
): Promise<Response> {
  let payload: any;
  try {
    payload = JSON.parse(body);
  } catch {
    return err("JSON inválido", 400);
  }

  const hfJobId: string | undefined = payload.id ?? payload.job_id;
  const hfStatus: string | undefined = payload.status;

  if (!hfJobId) {
    console.error("[webhook] Payload sem job ID:", JSON.stringify(payload));
    return json({ ok: true }); // 200 para HF não retentar
  }

  // Ignorar status intermediários
  if (!TERMINAL_HF_STATUSES.has(hfStatus ?? "")) {
    return json({ ok: true });
  }

  const isFailed = FAILED_HF_STATUSES.has(hfStatus ?? "");
  // URL de output — HF pode mandar string ou array; normaliza os dois casos.
  const rawOutput = payload.output ?? payload.output_url ?? payload.outputs ?? payload.result;
  const outputUrl: string | null = typeof rawOutput === "string"
    ? rawOutput
    : Array.isArray(rawOutput) ? (rawOutput[0] ?? null) : null;

  // Tentar pelo master ID primeiro
  const masterMatch = await dbGetJobByMasterHfId(hfJobId);
  if (masterMatch) {
    await handleMasterEvent(masterMatch, isFailed, outputUrl, payload);
    return json({ ok: true });
  }

  // Tentar pelos tile IDs
  const tileMatch = await dbGetJobByTileHfId(hfJobId);
  if (tileMatch) {
    await handleTileEvent(tileMatch.job, tileMatch.tileIndex, isFailed, outputUrl, payload);
    return json({ ok: true });
  }

  // Job não encontrado — expirado ou de outro sistema
  console.warn("[webhook] Job não encontrado para hf_job_id:", hfJobId);
  return json({ ok: true }); // 200 para não causar retentativa infinita
}

async function handleMasterEvent(
  job: WideJob,
  isFailed: boolean,
  outputUrl: string | null,
  payload: any,
): Promise<void> {
  if (isFailed) {
    await dbPatchJob(job.id, {
      status: "failed",
      error_log: [
        ...job.error_log,
        { phase: "master", error: payload.error ?? "HF master job failed", timestamp: now() },
      ],
    });
    return;
  }

  // Idempotência: não regredir se o job já avançou além de master_ready
  if (POST_MASTER_STATUSES.has(job.status)) return;

  await dbPatchJob(job.id, { status: "master_ready", master_url: outputUrl });
}

async function handleTileEvent(
  job: WideJob,
  tileIndex: number,
  isFailed: boolean,
  outputUrl: string | null,
  payload: any,
): Promise<void> {
  if (isFailed) {
    await dbPatchJob(job.id, {
      status: "failed",
      error_log: [
        ...job.error_log,
        {
          phase: `tile_${tileIndex}`,
          error: payload.error ?? "HF tile job failed",
          timestamp: now(),
        },
      ],
    });
    return;
  }

  // Atualiza o array de tile_urls na posição correta.
  // Race condition possível se dois tiles chegarem simultaneamente — aceitável para uso interno.
  const totalTiles = job.hf_tile_job_ids.length;
  const tileUrls: (string | null)[] = [...(job.tile_urls ?? [])];
  while (tileUrls.length < totalTiles) tileUrls.push(null);
  tileUrls[tileIndex] = outputUrl;

  const allDone = tileUrls.length === totalTiles && tileUrls.every((u) => u !== null);
  await dbPatchJob(job.id, {
    tile_urls: tileUrls,
    status: allDone ? "tiles_ready" : "tiles_partial",
  });
}

function now(): string {
  return new Date().toISOString();
}
