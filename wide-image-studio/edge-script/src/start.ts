// POST /start — valida brief, credit check, cria job no Supabase, despacha master plate para HF.
// Body esperado: { brief: BriefJSON, ref_urls: string[] }
// Retorna 202 com { job_id, status: "master_pending", estimated_cost_usd }.

import { corsHeaders, err, json } from "./utils/response.ts";
import { loadPreset, estimateCost } from "./tiling-math.ts";
import { dbCreateJob, dbPatchJob } from "./utils/supabase.ts";

const HF_BASE = "https://api.higgsfield.ai";

function getEnv(key: string): string {
  const val = Deno.env.get(key);
  if (!val) throw new Error(`Missing env: ${key}`);
  return val;
}

function hfHeaders(extra?: Record<string, string>): Record<string, string> {
  return {
    Authorization: `Key ${getEnv("HF_API_KEY")}:${getEnv("HF_SECRET")}`,
    "Content-Type": "application/json",
    ...extra,
  };
}

// Verifica saldo HF antes de gastar. Best-effort: erros de rede não bloqueiam.
async function preflightCreditCheck(required: number): Promise<void> {
  try {
    const res = await fetch(`${HF_BASE}/v2/account/credits`, {
      headers: hfHeaders(),
    });
    if (!res.ok) return;
    const data = await res.json();
    const credits = typeof data.credits === "number" ? data.credits : null;
    if (credits !== null && credits < required * 1.5) {
      throw Object.assign(
        new Error(
          `Créditos insuficientes: ${credits.toFixed(2)} disponíveis, necessário ${(required * 1.5).toFixed(2)}`,
        ),
        { status: 402 },
      );
    }
  } catch (e: unknown) {
    if ((e as any).status === 402) throw e;
    // Outros erros de rede → não bloquear
  }
}

export async function handleStart(
  req: Request,
  userId: string,
  origin: string | null,
): Promise<Response> {
  let body: { brief?: any; ref_urls?: string[] };
  try {
    body = await req.json();
  } catch {
    return err("JSON inválido", 400, corsHeaders(origin));
  }

  const brief = body?.brief;
  const refUrls: string[] = Array.isArray(body?.ref_urls) ? body.ref_urls : [];

  const presetKey = brief?.display?.preset;
  const masterPrompt = brief?.scene?.master_prompt;
  if (!presetKey) return err("brief.display.preset é obrigatório", 400, corsHeaders(origin));
  if (!masterPrompt) return err("brief.scene.master_prompt é obrigatório", 400, corsHeaders(origin));

  let preset: ReturnType<typeof loadPreset>;
  try {
    preset = loadPreset(presetKey);
  } catch (e: any) {
    return err(e.message, e.status ?? 400, corsHeaders(origin));
  }

  const cost = estimateCost(preset);

  try {
    await preflightCreditCheck(cost);
  } catch (e: any) {
    return err(e.message, e.status ?? 402, corsHeaders(origin));
  }

  let jobId: string;
  try {
    jobId = await dbCreateJob({ userId, brief, refUrls, estimatedCost: cost });
  } catch (e: any) {
    console.error("[start] dbCreateJob:", e);
    return err("Falha ao criar job", 500, corsHeaders(origin));
  }

  const seed: number = brief?.consistency?.seed ?? Math.floor(Math.random() * 2_000_000);
  const soulId: string | undefined = brief?.consistency?.soul_id;
  const maxRefs = parseInt(Deno.env.get("MAX_REFS_PER_JOB") ?? "5");

  // Soul ID vem primeiro — ancora identidade visual antes das refs do usuário
  const referenceImages: Array<{ url: string; type?: string }> = [];
  if (soulId) referenceImages.push({ url: soulId, type: "soul_id" });
  for (const url of refUrls.slice(0, maxRefs)) {
    referenceImages.push({ url });
  }

  const [masterW, masterH] = preset.master_resolution.split("x").map(Number);

  await dbPatchJob(jobId, { status: "master_pending" });

  const hfRes = await fetch(`${HF_BASE}/v2/generations`, {
    method: "POST",
    headers: hfHeaders({ "Idempotency-Key": `wide-master-${jobId}` }),
    body: JSON.stringify({
      model: preset.master_model,
      prompt: masterPrompt,
      width: masterW,
      height: masterH,
      seed,
      reference_images: referenceImages,
      webhook: {
        url: `${getEnv("PUBLIC_EDGE_URL")}/hf-webhook`,
        secret: getEnv("WEBHOOK_SECRET"),
      },
    }),
  });

  if (!hfRes.ok) {
    const msg = await hfRes.text().catch(() => "HF error");
    console.error("[start] HF generations:", hfRes.status, msg);
    await dbPatchJob(jobId, {
      status: "failed",
      error_log: [{ phase: "master", error: msg, timestamp: new Date().toISOString() }],
    });
    return err("Falha ao iniciar geração no Higgsfield", 502, corsHeaders(origin));
  }

  const hfData = await hfRes.json();
  const hfJobId: string = hfData.id ?? hfData.job_id ?? "";
  await dbPatchJob(jobId, { hf_master_job_id: hfJobId });

  return json(
    { job_id: jobId, status: "master_pending", estimated_cost_usd: cost },
    202,
    corsHeaders(origin),
  );
}
