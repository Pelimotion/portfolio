@AI_AGENT_BRIEFING.md
@STATUS.md
@README.md
@ARCHITECTURE.md

# PELIMOTION — Orquestrador Maestro
**Versão:** 1.3 | **Última atualização:** 2026-09-13

---

## Visão do Ecossistema
Pelimotion é um estúdio de direção criativa, motion design e experiências espaciais em WebGL.
Composto por subprojetos ativos coordenados sob um único domínio e repositório.

## Subprojetos e Agentes
| Pasta | Responsabilidade | Status | Agente / Docs |
|-------|----------------|--------|--------|
| `/` (raiz) | Landing page comercial + admin Bunny.net | ESTÁVEL | `README.md` & `ARCHITECTURE.md` |
| `/gigantera` | Pavilhão de Arte 3D + Som Autoral + CD Jewel Case POV | ESTÁVEL / PRODUÇÃO | `gigantera/README.md` |
| `/blog` | Portal público editorial | ESTÁVEL | `blog/CLAUDE.md` |
| `/blog-generator` | CMS + gerador de conteúdo IA | EM DESENVOLVIMENTO | `blog-generator/CLAUDE.md` |
| `/projetos-app` | Gestão interna de projetos Kanban (React) | BETA | `AGENTS.md` |
| `/wide-image-studio` | Gerador de imagens ultra-wide via Higgsfield | EM DESENVOLVIMENTO | `wide-image-studio/CLAUDE.md` |

---

## Stack Global & Regras de Infraestrutura
- **Frontend Raiz:** Vanilla HTML5 / CSS3 / ES Modules.
- **Frontend 3D (`/gigantera`):** React 19, TypeScript, Vite, Three.js, Web Audio API, GSAP, Zustand.
- **Armazenamento de Mídia & Streaming:** Bunny.net Storage & CDN (`https://pelimotion-portfolio.b-cdn.net/`).
  - *Regra Estrita de Cota:* NUNCA commite arquivos de áudio (.mp3, .wav), vídeos (.mp4) ou binários WebAssembly (.wasm) no Git.
  - Toda a mídia de alta largura de banda deve ser servida via Bunny CDN com suporte a Byte-Range Requests (HTTP 206) e CORS liberado.
- **Deploy:** Vercel via push na branch `main`. Roteamento configurado em `vercel.json` com payload restrito a ~17 MB de arquivos de texto e código minificado.
- **Autenticação & DB:** Supabase (PostgreSQL + RLS + Google OAuth).
- **Design Tokens:** `/design-tokens.json` e `gigantera/src/tokens.ts`.

## Convenções de Código
- Commits: Conventional Commits (`feat:`, `fix:`, `perf:`, `docs:`, `refactor:`).
- Nomes de arquivo: `kebab-case` para assets/docs e `PascalCase` para componentes React.
- Variáveis de ambiente: Sempre em `.env` (nunca hardcoded no código).
- Estilo: Brutalismo contemporâneo, tipografia rigorosa (`Syne`, `Fraunces`, `Space Mono`), microinterações com feedback tátil e sonoro.

## Limites Operacionais Conhecidos
- **Vercel Hobby:** Limite de 10 GB mensais para Fast Origin Transfer. Protegido rigorosamente via `.vercelignore` e CDN da Bunny.net.
- **Bunny CDN:** Cache global persistente (30 dias) e distribuição edge de ultra-baixa latência.

