// POST /approve-master — usuário aprovou o master plate.
// Despacha os N tiles em paralelo com:
//   - prompt = master_prompt + regional focus do tile
//   - reference_images[0] = master_url (âncora visual global)
//   - reference_images[1] = soul_id (se houver)
//   - reference_images[2..] = refs do usuário
//   - seed = base_seed + i (variação dentro de continuidade)
// Body: { job_id: string }
// Retorna 202 com { job_id, status: "tiles_pending", tile_count }.
//
// Nota: passa o master_url inteiro como referência (não um crop regional).
// O crop preciso (tiling-math.master_crop) requer processamento de imagem
// indisponível neste runtime. O prompt regional + seed compensam na prática.

import { corsHeaders, err, json } from "./utils/response.ts";
import { loadPreset, computeTilePositions } from "./tiling-math.ts";
import { dbGetJobById, dbPatchJob } from "./utils/supabase.ts";

const HF_BASE = "https://api.higgsfield.ai";

const REGION_FALLBACK = [
  "leftmost portion of the scene",
  "left-center portion of the scene",
  "center portion of the scene",
  "right-center portion of the scene",
  "rightmost portion of the scene",
  "far-left edge of the scene",
  "far-right edge of the scene",
];

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

export async function handleApproveMaster(
  req: Request,
  userId: string,
  origin: string | null,
): Promise<Response> {
  let body: { job_id?: string };
  try {
    body = await req.json();
  } catch {
    return err("JSON inválido", 400, corsHeaders(origin));
  }

  const jobId = body?.job_id;
  if (!jobId) return err("job_id é obrigatório", 400, corsHeaders(origin));

  const job = await dbGetJobById(jobId);
  if (!job) return err("Job não encontrado", 404, corsHeaders(origin));
  if (job.user_id !== userId) return err("Acesso negado", 403, corsHeaders(origin));
  if (job.status !== "master_ready") {
    return err(`Job não está em master_ready (status atual: ${job.status})`, 409, corsHeaders(origin));
  }

  const brief: any = job.brief;
  const presetKey: string = brief?.display?.preset;
  const masterPrompt: string = brief?.scene?.master_prompt ?? "";
  const regions: Array<{ focus?: string }> = Array.isArray(brief?.regions) ? brief.regions : [];
  const baseSeed: number = brief?.consistency?.seed ?? 0;
  const soulId: string | undefined = brief?.consistency?.soul_id;
  const maxRefs = parseInt(Deno.env.get("MAX_REFS_PER_JOB") ?? "5");

  let preset: ReturnType<typeof loadPreset>;
  try {
    preset = loadPreset(presetKey);
  } catch (e: any) {
    return err(e.message, e.status ?? 400, corsHeaders(origin));
  }

  const tilePositions = computeTilePositions(preset);
  const [tileGenW, tileGenH] = preset.tile_generation_resolution.split("x").map(Number);
  const webhookUrl = `${getEnv("PUBLIC_EDGE_URL")}/hf-webhook`;
  const webhookSecret = getEnv("WEBHOOK_SECRET");
  const masterUrl = job.master_url!;

  await dbPatchJob(jobId, { status: "tiles_pending" });

  // Dispatch N tiles em paralelo — não aguardamos conclusão (webhook traz resultado)
  const dispatches = tilePositions.map((pos, i) => {
    const regionFocus = regions[i]?.focus ?? REGION_FALLBACK[i] ?? "portion of the scene";
    const prompt = `${masterPrompt}, ${regionFocus}, maintain continuity with reference image`;

    const referenceImages: Array<{ url: string; type?: string }> = [{ url: masterUrl }];
    if (soulId) referenceImages.push({ url: soulId, type: "soul_id" });
    for (const refUrl of (job.ref_urls ?? []).slice(0, maxRefs)) {
      referenceImages.push({ url: refUrl });
    }

    return fetch(`${HF_BASE}/v2/generations`, {
      method: "POST",
      headers: hfHeaders({ "Idempotency-Key": `wide-tile-${jobId}-${i}` }),
      body: JSON.stringify({
        model: preset.tile_model,
        prompt,
        width: tileGenW,
        height: tileGenH,
        seed: baseSeed + i,
        reference_images: referenceImages,
        webhook: { url: webhookUrl, secret: webhookSecret },
      }),
    });
  });

  const responses = await Promise.all(dispatches);

  const hfTileJobIds: string[] = [];
  const failed: number[] = [];

  for (let i = 0; i < responses.length; i++) {
    const res = responses[i];
    if (!res.ok) {
      const msg = await res.text().catch(() => "HF error");
      console.error(`[approve-master] tile ${i} falhou:`, res.status, msg);
      failed.push(i);
      hfTileJobIds.push("");
    } else {
      const data = await res.json();
      hfTileJobIds.push(data.id ?? data.job_id ?? "");
    }
  }

  if (failed.length > 0) {
    await dbPatchJob(jobId, {
      status: "failed",
      error_log: [
        ...(job.error_log ?? []),
        {
          phase: "tiles_dispatch",
          error: `Tiles com falha no dispatch: ${failed.join(", ")}`,
          timestamp: new Date().toISOString(),
        },
      ],
    });
    return err(`Dispatch de ${failed.length} tile(s) falhou`, 502, corsHeaders(origin));
  }

  await dbPatchJob(jobId, { hf_tile_job_ids: hfTileJobIds });

  return json(
    { job_id: jobId, status: "tiles_pending", tile_count: preset.tile_count },
    202,
    corsHeaders(origin),
  );
}
