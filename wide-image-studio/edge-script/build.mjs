// Build script para Bunny Edge Scripting.
// Roda com: deno run -A build.mjs
// Usa esbuild-deno-loader para resolver imports de URL (esm.sh, jsr:, npm:).

import * as esbuild from "npm:esbuild";
import { denoPlugins } from "jsr:@luca/esbuild-deno-loader";

const OUTFILE = "./dist/index.js";
const MAX_BYTES = 1_048_576; // 1MB

await esbuild.build({
  plugins: [...denoPlugins()],
  entryPoints: ["./src/index.ts"],
  outfile: OUTFILE,
  bundle: true,
  format: "esm",
  minify: true,
  legalComments: "none",
  target: "es2022",
});

esbuild.stop();

// Guard de tamanho: falha o deploy se exceder 1MB
const info = await Deno.stat(OUTFILE);
const size = info.size;
console.log(`→ Bundle: ${size} bytes / ${MAX_BYTES} bytes (1MB limit)`);

if (size > MAX_BYTES) {
  console.error("✗ Bundle excedeu 1MB — deploy abortado.");
  Deno.exit(1);
}

console.log(`✓ Build OK — ${Math.round(size / 1024)}KB usado de 1024KB disponíveis`);
