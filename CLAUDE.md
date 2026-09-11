@AI_AGENT_BRIEFING.md
@STATUS.md

# PELIMOTION — Orquestrador Maestro
**Versão:** 1.2 | **Última atualização:** 2026-05-18

---

## Visão do Ecossistema
Pelimotion é um hub editorial e operacional focado em motion design, branding e design.
Composto por 5 subprojetos ativos num único repositório.

## Subprojetos e Agentes
| Pasta | Responsabilidade | Status | Agente |
|-------|----------------|--------|--------|
| `/` (raiz) | Landing page + admin Bunny.net | ESTÁVEL | Este arquivo |
| `/gigantera` | Portfólio de Arte Digital 3D + Brutalismo Experimental | ESTÁVEL / ONLINE | `gigantera/README.md` |
| `/blog` | Portal público (blog → hub editorial) | ESTÁVEL | `blog/CLAUDE.md` |
| `/blog-generator` | CMS + gerador de conteúdo IA | EM DESENVOLVIMENTO ATIVO | `blog-generator/CLAUDE.md` |
| `/projetos-app` | Gerenciador interno de projetos (React) | BETA | `projetos-app/CLAUDE.md` |
| `/wide-image-studio` | Gerador de imagens ultra-wide via Higgsfield (frontend + Bunny Edge) | EM DESENVOLVIMENTO ATIVO | `wide-image-studio/CLAUDE.md` |

> **REGRA DE OURO:** Para trabalhar em qualquer subprojeto, navegue para sua pasta
> e inicie uma nova sessão do Claude Code lá. Não trabalhe no ecossistema inteiro em uma única sessão.

---

## Stack Global
- **Frontend:** Vanilla HTML/CSS/JS (blog, landing, admin, generator, wide-image-studio)
- **Exceções:** `projetos-app` e `gigantera` usam React + Vite + TypeScript (Three.js, Tone.js, GSAP, OGL em Gigantera)
- **DB:** Supabase (PostgreSQL + RLS + Realtime)
- **CDN/Storage:** Bunny.net (`pelimotion-portfolio.b-cdn.net`)
- **Edge compute:** Bunny Edge Scripting (alternativa ao Vercel quando o limite de 12 functions importa)
- **Deploy:** Vercel para os subprojetos hospedados nele via push no `main`; Bunny Edge Scripting via deploy manual ou CLI
- **IA imagem/vídeo (editorial):** Vertex AI — Gemini 2.5 Pro/Flash + Imagen 3.0
- **IA imagem/vídeo (ultra-wide cinematográfica):** Higgsfield AI (Soul, Nano Banana Pro, Seedream, Seedance)
- **Design Tokens:** `/design-tokens.json`

## Convenções (ver STANDARDS.md para detalhes)
- Commits: conventional commits (`feat:`, `fix:`, `refactor:`, `docs:`)
- Nomes de arquivo: `kebab-case`
- Variáveis de ambiente: nunca no código, sempre em `.env` + Vercel dashboard ou painel Bunny
- Imagens editoriais: sempre via Bunny.net CDN, nunca commitadas no repositório
- **Mídia gerada via wide-image-studio: NUNCA hospedada nos nossos serviços** — passa direto Higgsfield ↔ cliente

## O Que Nunca Fazer na Raiz
- Editar arquivos dentro de `/blog/*.html` — são gerados pelo build engine
- Instalar dependências globais que quebrem `projetos-app/package.json`
- Abrir `/projetos-app/` nesta sessão — tem seu próprio agente
- Abrir `/wide-image-studio/` nesta sessão — tem seu próprio agente

## Tom e Clareza nas Respostas

Toda instrução, explicação ou resposta a comandos deve seguir estas regras:

- **Linguagem simples:** escreva como se o leitor nunca tivesse visto o código antes
- **Passo a passo numerado:** cada ação em um item separado (1. faça X → 2. faça Y)
- **Definições curtas:** ao usar um termo técnico, explique em uma linha o que ele faz
- **Sem jargão desnecessário:** evite siglas ou nomes de ferramentas sem contexto
- **Máximo 5 passos por bloco:** se precisar de mais, quebre em sub-tarefas

## Limites operacionais conhecidos
- Vercel Hobby: 12 serverless functions (no limite). Features novas usam Bunny Edge Scripting.
- Bunny Edge Scripting: 128MB RAM, 30s CPU, 50 subrequests, bundle ≤1MB. Suficiente para orquestração; computação pesada vai pro cliente (WASM) ou container.
- Supabase Realtime: 1 conexão por job em curso; OK para uso interno.
