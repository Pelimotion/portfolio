import path from "path";
import type { NextConfig } from "next";

// Raiz do repositório — 2 níveis acima de felipe-workspace/app/
// Vercel: /vercel/path0/felipe-workspace/app → /vercel/path0 (repo root)
// Local:  .../Portfolio/felipe-workspace/app → .../Portfolio (repo root)
const repoRoot = path.resolve(__dirname, "../..");

const nextConfig: NextConfig = {
  basePath: "/pelispace",
  // outputFileTracingRoot e turbopack.root DEVEM ter o mesmo valor.
  // Vercel CLI 54+ seta outputFileTracingRoot = repo root automaticamente;
  // definir aqui explicitamente evita conflito no modifyConfig.
  outputFileTracingRoot: repoRoot,
  turbopack: {
    root: repoRoot,
  },
};

export default nextConfig;
