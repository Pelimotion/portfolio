---
description: Builda o bundle do edge script e deploya para Bunny Edge Scripting.
---

Builda e deploya o edge script para Bunny. Roda os passos abaixo em sequência.

**URL pública:** `https://wide-api-ilgmz.bunny.run`
> DNS de pelimotion.art aponta direto para Vercel — Edge Rule descartada.
> O frontend chama a URL do Bunny diretamente.

**Pré-condições:**
- Deno instalado (`curl -fsSL https://deno.land/install.sh | sh`)
- Bunny CLI instalado (`npm i -g @bunny.net/cli`) e autenticado (`bunny login`)

**Passo 1 — Build com guard de 1MB:**
```bash
cd wide-image-studio/edge-script
npm run build
# Saída esperada: "✓ Build OK — XKB usado de 1024KB disponíveis"
```

**Passo 2 — Deploy para Bunny (Script ID: 75395):**
```bash
bunny scripts deploy dist/index.js 75395
# Saída esperada: "✓ Deployment published. ℹ Live at: https://wide-api-ilgmz.bunny.run"
```

**Passo 3 — Verificação pós-deploy:**
```bash
curl https://wide-api-ilgmz.bunny.run/health
# Esperado: {"ok":true,"ts":1234567890}
```

**Rollback se algo quebrar:**
```bash
bunny scripts deployments list 75395       # ver versões disponíveis
bunny scripts deployments activate <ID>    # ativar versão anterior
```
