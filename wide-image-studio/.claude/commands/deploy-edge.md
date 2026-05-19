---
description: Builda o bundle do edge script e deploya para Bunny (stub — implementado em PR 4).
---

⚠️ **Stub — implementação real chega no PR 4.** Por enquanto, este comando documenta o fluxo esperado.

Fluxo de deploy do edge script:

1. **Verificar pre-condições:**
   - `wide-image-studio/edge-script/src/index.ts` existe
   - `.env` local (não commitado) tem todas as variáveis de `.env.example`
   - Bunny CLI instalado e autenticado (`bunny auth status`)

2. **Build:**
   - `cd edge-script && pnpm run build`
   - Garantir que `dist/index.js` ficou ≤1MB
   - Falhar se exceder o limite

3. **Deploy:**
   - `bunny edge-scripting deploy --script wide-api dist/index.js`
   - Ou via painel: upload manual com versionamento

4. **Verificação pós-deploy:**
   - `curl https://pelimotion.com/wide-api/health` retorna 200
   - Logs no painel Bunny mostram script ativo

5. **Rollback se algo quebra:**
   - `bunny edge-scripting rollback --script wide-api --to PREVIOUS_VERSION`

Por agora (antes do PR 4), apenas mostre este fluxo ao usuário e diga que será implementado.
