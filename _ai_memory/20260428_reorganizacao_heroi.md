---
data: 2026-04-28
horario: 00:40
origem: Antigravity / Gemini-2-0-Flash-Thinking
---

# REORGANIZAÇÃO DE ARQUITETURA E OTIMIZAÇÃO DE HERÓI

## 1. INFRAESTRUTURA E DEVOPS
- Implementado script `limpeza.sh` para reorganização de arquivos.
- Estrutura de pastas atualizada:
    - `/assets/js`: Centralização de scripts globais (`theme.js`).
    - `/contra_pipeline/medias`: Migração da pasta legada `Medias Portfolio` para suporte à estratégia B2B.
- Atualizados caminhos (`src`, `href`) em `index.html`, `cv.html` e `admin.js` para refletir a nova hierarquia.

## 2. LANDING PAGE (UX/UI)
- **Hero Video Preload**: Adicionado frame estático (`hero_first_frame.png`) gerado via IA para exibição imediata antes do autoplay do vídeo.
- **Animação de Entrada**: 
    - Escala: 133% → 100% em 1.5s.
    - Ease: `cubic-bezier(0, 0, 0.2, 1)` (0 outcoming / 80 incoming).
- **Lógica de Transição**: O poster desaparece suavemente assim que o vídeo está pronto para reprodução.

## 3. DEPLOY
- Deploy realizado via `deploy_site.py` (Push direto para Vercel via GitHub).
- Deploy rápido focado apenas em código e assets novos, pulando sincronização pesada de mídias do portfólio.
