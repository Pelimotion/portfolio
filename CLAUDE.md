@AI_AGENT_BRIEFING.md
@STATUS.md
@README.md
@ARCHITECTURE.md

# PELIMOTION — Orquestrador Maestro
**Versão:** 2.0 | **Última atualização:** 2026-10-22

---

## Visão do Ecossistema
Pelimotion é um ateliê de direção criativa, motion branding e experiências cinéticas de alta precisão sediado no Rio de Janeiro.
Composto por subprojetos ativos coordenados sob um único domínio (`pelimotion.art`) e distribuição de mídia em CDN dedicada.

## Subprojetos e Módulos Ativos
| Rota / Pasta | Responsabilidade | Status | Documentação / Guia |
|---|---|---|---|
| `/` (raiz) | Landing page comercial, reel cinético e marcas atendidas | ESTÁVEL | `README.md` & `ARCHITECTURE.md` |
| `/bora` | Intake de briefing, Black Neumorphism e saída dupla (WhatsApp/Email) | PRODUÇÃO | `bora/index.html` & `README.md` |
| `/portfolio` (`/v1`) | Catálogo de projetos e reprodução de alta fidelidade | ESTÁVEL | `legacy/V1/portfolio/` |
| `/curriculum` | Dossiê de carreira executivo e capabilities de Felipe Conceição | ESTÁVEL | `Curriculum/index.html` |
| `/penumbra` | TouchDesigner Web Bridge e telemetria de engine VJ | ESTÁVEL | `penumbra/index.html` |
| `/briefing` | Formulário imersivo com canvas animado | ESTÁVEL | `briefing/index.html` |
| `/ads` | Autopilot Engine e inteligência de tráfego | ESTÁVEL | `ads/index.html` |
| `/admin` | Painel de controle de mídia e deploy hub | ESTÁVEL | `admin/index.html` |
| `/login` | Portal de autenticação unificado Supabase | ESTÁVEL | `login/index.html` |
| `/blog` | Portal editorial e ensaios com RSS | ESTÁVEL | `blog/index.html` |
| `/gigantera` | 301 Redirect para o pavilhão autoral 3D independente | PRODUÇÃO | `https://gigantera.xyz` |

---

## Stack Global & Regras de Infraestrutura
- **Frontend Raiz:** Vanilla HTML5 / CSS3 / ES Modules. Sem overhead de frameworks no core.
- **Armazenamento de Mídia & Streaming:** Bunny.net Storage & CDN (`https://pelimotion-portfolio.b-cdn.net/`).
  - *Regra Estrita de Cota:* NUNCA commite arquivos de áudio (.mp3, .wav), vídeos (.mp4) ou binários WebAssembly (.wasm) no Git.
  - Toda a mídia de alta largura de banda deve ser servida via Bunny CDN com suporte a Byte-Range Requests (HTTP 206) e CORS liberado.
- **Deploy:** Vercel via push na branch `main`. Roteamento e headers configurados em `vercel.json` com payload restrito a ~17 MB.
- **Autenticação & DB:** Supabase (PostgreSQL + RLS + Google OAuth / Email).
- **Design Tokens:** `/design-tokens.json`.

## Convenções de Código
- Commits: Conventional Commits (`feat:`, `fix:`, `perf:`, `docs:`, `refactor:`, `chore:`).
- Nomes de arquivo: `kebab-case` para assets/docs e `PascalCase` para componentes quando aplicável.
- Variáveis de ambiente: Sempre em `.env` (nunca hardcoded no código).
- Estilo: Brutalismo contemporâneo, tipografia rigorosa (`Instrument Serif`, `Space Grotesk`, `Inter`), microinterações com feedback sonoro via Web Audio API.

## Limites Operacionais Conhecidos
- **Vercel Hobby:** Limite de 10 GB mensais para Fast Origin Transfer. Protegido rigorosamente via `.vercelignore` e CDN da Bunny.net.
- **Bunny CDN:** Cache global persistente (30 dias) e distribuição edge de ultra-baixa latência.
