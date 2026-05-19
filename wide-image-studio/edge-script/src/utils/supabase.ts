// Supabase REST helpers — service role key (bypasses RLS).
// Usado apenas por start.ts e hf-webhook.ts (operações server-to-server).

export interface WideJob {
  id: string;
  user_id: string;
  status: string;
  brief: unknown;
  ref_urls: string[];
  hf_master_job_id: string | null;
  hf_tile_job_ids: string[];
  master_url: string | null;
  tile_urls: (string | null)[];
  estimated_cost_usd: number | null;
  error_log: Array<{ phase: string; error: string; timestamp: string }>;
}

function getEnv(key: string): string {
  const val = Deno.env.get(key);
  if (!val) throw new Error(`Missing env: ${key}`);
  return val;
}

function headers(): Record<string, string> {
  const key = getEnv("SUPABASE_SERVICE_ROLE_KEY");
  return {
    "Content-Type": "application/json",
    apikey: key,
    Authorization: `Bearer ${key}`,
  };
}

function baseUrl(): string {
  return `${getEnv("SUPABASE_URL")}/rest/v1/wide_jobs`;
}

export async function dbCreateJob(params: {
  userId: string;
  brief: unknown;
  refUrls: string[];
  estimatedCost: number;
}): Promise<string> {
  const res = await fetch(baseUrl(), {
    method: "POST",
    headers: { ...headers(), Prefer: "return=representation" },
    body: JSON.stringify({
      user_id: params.userId,
      status: "created",
      brief: params.brief,
      ref_urls: params.refUrls,
      estimated_cost_usd: params.estimatedCost,
    }),
  });
  if (!res.ok) {
    throw new Error(`Supabase createJob: ${res.status} ${await res.text()}`);
  }
  const [row] = (await res.json()) as [WideJob];
  return row.id;
}

export async function dbPatchJob(
  jobId: string,
  patch: Record<string, unknown>,
): Promise<void> {
  const res = await fetch(`${baseUrl()}?id=eq.${jobId}`, {
    method: "PATCH",
    headers: headers(),
    body: JSON.stringify(patch),
  });
  if (!res.ok) {
    console.error(`[supabase] patchJob ${jobId}:`, res.status, await res.text());
  }
}

export async function dbGetJobById(jobId: string): Promise<WideJob | null> {
  const res = await fetch(
    `${baseUrl()}?id=eq.${encodeURIComponent(jobId)}&select=*`,
    { headers: headers() },
  );
  if (!res.ok) return null;
  const rows = (await res.json()) as WideJob[];
  return rows[0] ?? null;
}

export async function dbGetJobByMasterHfId(
  hfJobId: string,
): Promise<WideJob | null> {
  const res = await fetch(
    `${baseUrl()}?hf_master_job_id=eq.${encodeURIComponent(hfJobId)}&select=*`,
    { headers: headers() },
  );
  if (!res.ok) return null;
  const rows = (await res.json()) as WideJob[];
  return rows[0] ?? null;
}

export async function dbGetJobByTileHfId(
  hfJobId: string,
): Promise<{ job: WideJob; tileIndex: number } | null> {
  // cs = PostgREST "contains" filter para text[]
  const res = await fetch(
    `${baseUrl()}?hf_tile_job_ids=cs.{${encodeURIComponent(hfJobId)}}&select=*`,
    { headers: headers() },
  );
  if (!res.ok) return null;
  const rows = (await res.json()) as WideJob[];
  if (rows.length === 0) return null;
  const job = rows[0];
  const tileIndex = job.hf_tile_job_ids.indexOf(hfJobId);
  return tileIndex === -1 ? null : { job, tileIndex };
}
