---
description: Builda o bundle do edge script e deploya para Bunny Edge Scripting.
---

Builda e deploya o edge script para Bunny. Roda os passos abaixo em sequência.

**Pré-condições:**
- `wide-image-studio/edge-script/src/index.ts` existe
- `.env` local preenchido com todas as variáveis de `.env.example`
- Bunny CLI instalado (`npm i -g @bunny.net/cli`) e autenticado (`bunny login`)
- Node.js ≥18 instalado (para esbuild)

**Passo 1 — Instalar dependências (primeira vez ou após atualizar package.json):**
```bash
cd wide-image-studio/edge-script
npm install
```

**Passo 2 — Build com guard de 1MB:**
```bash
npm run build
# Falha automaticamente se dist/index.js exceder 1MB.
# Saída esperada: "✓ Build OK — XXX KB usado de 1024KB disponíveis"
```

**Passo 3 — Deploy para Bunny:**
```bash
# Via CLI (recomendado):
bunny edge-scripting deploy --script wide-api dist/index.js

# Via painel (alternativa manual):
# Bunny Dashboard → Edge Scripting → wide-api → Upload new version
```

**Passo 4 — Verificação pós-deploy:**
```bash
curl https://pelimotion.com/wide-api/health
# Esperado: {"ok":true,"ts":1234567890}
```

**Rollback se algo quebrar:**
```bash
bunny edge-scripting rollback --script wide-api --to PREVIOUS_VERSION
# Ou no painel: Edge Scripting → wide-api → Version history → Activate anterior
```

**Edge Rule (configurar 1× no painel Bunny, não precisa re-deploy):**
Bunny Dashboard → CDN → pelimotion.com Pull Zone → Edge Rules → Add Rule:
- Condition: URL Path starts with `/wide-api/`
- Action: Route to Edge Script → `wide-api`

> Esta regra faz o URL rewrite de `pelimotion.com/wide-api/*` para o edge script sem passar pelo origin (evita o bug de middleware com storage pull zones).
