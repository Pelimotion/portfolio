// Validação de JWT Supabase e verificação de role wide_studio.
// Usa Deno.env.get() — runtime Bunny Edge (Deno modificado).

interface SupabaseUser {
  id: string;
  email: string;
  app_metadata: { role?: string };
}

function getEnv(key: string): string {
  const val = Deno.env.get(key);
  if (!val) throw new Error(`Missing env: ${key}`);
  return val;
}

export async function requireWideStudioRole(
  req: Request,
): Promise<{ userId: string; email: string }> {
  const authHeader = req.headers.get("Authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    throw Object.assign(new Error("Missing Authorization header"), { status: 401 });
  }

  const token = authHeader.slice(7);
  const supabaseUrl = getEnv("SUPABASE_URL");
  const anonKey = getEnv("SUPABASE_ANON_KEY");

  const res = await fetch(`${supabaseUrl}/auth/v1/user`, {
    headers: {
      Authorization: `Bearer ${token}`,
      apikey: anonKey,
    },
  });

  if (!res.ok) {
    throw Object.assign(new Error("Invalid or expired token"), { status: 401 });
  }

  const user: SupabaseUser = await res.json();

  if (user.app_metadata?.role !== "wide_studio") {
    throw Object.assign(new Error("Insufficient role"), { status: 403 });
  }

  return { userId: user.id, email: user.email };
}

// Verifica HMAC-SHA256 do webhook Higgsfield.
// Higgsfield envia: X-HF-Signature: sha256=<hex>
export async function verifyHmac(req: Request, body: string): Promise<void> {
  const signature = req.headers.get("X-HF-Signature");
  if (!signature?.startsWith("sha256=")) {
    throw Object.assign(new Error("Missing webhook signature"), { status: 401 });
  }

  const secret = getEnv("WEBHOOK_SECRET");
  const encoder = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );

  const mac = await crypto.subtle.sign("HMAC", keyMaterial, encoder.encode(body));
  const expected = "sha256=" + Array.from(new Uint8Array(mac))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");

  if (expected !== signature) {
    throw Object.assign(new Error("Invalid webhook signature"), { status: 401 });
  }
}
