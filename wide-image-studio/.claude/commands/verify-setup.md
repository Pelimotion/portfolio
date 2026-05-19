---
description: Valida que Higgsfield CLI, Skills oficiais, créditos e dependências do edge script estão OK.
---

Execute a validação completa do setup do wide-image-studio:

1. Rode `./scripts/verify-setup.sh` e capture a saída.
2. Se o script falhar em qualquer step, identifique qual e proponha o fix:
   - **HF CLI não autenticado** → instruir `hf login`
   - **Créditos baixos (< $5)** → instruir top-up em https://cloud.higgsfield.ai/credits
   - **Skill oficial Higgsfield ausente** → instruir `./scripts/install-hf-skills.sh`
   - **Skill custom wide-image ausente** → algo deletou; restaurar do git
   - **Bunny CLI não instalado** → instruir `npm install -g @bunny.net/cli` (necessário apenas para deploy)
   - **Supabase CLI não instalado** → instruir `brew install supabase/tap/supabase`
3. Se tudo OK, mostre um resumo com:
   - HF user logado + saldo
   - Modelos disponíveis (especialmente seedream-5-lite e nano-banana-pro)
   - Skills carregadas (higgsfield + wide-image)
   - Status de cada dependência

Não corra o script em si — apenas reporte. Para fixes, peça confirmação antes de executar comandos que mudem o ambiente.
