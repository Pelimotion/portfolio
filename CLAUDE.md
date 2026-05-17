@AI_AGENT_BRIEFING.md
@STATUS.md

# PELIMOTION — Orquestrador Maestro
**Versão:** 1.1 | **Última atualização:** 2026-05-17

---

## Visão do Ecossistema
Pelimotion é um hub editorial e operacional focado em motion design, branding e design.
Composto por 4 subprojetos ativos num único repositório.

## Subprojetos e Agentes
| Pasta | Responsabilidade | Status | Agente |
|-------|----------------|--------|--------|
| `/` (raiz) | Landing page + admin Bunny.net | ESTÁVEL | Este arquivo |
| `/blog` | Portal público (blog → hub editorial) | ESTÁVEL | `blog/CLAUDE.md` |
| `/blog-generator` | CMS + gerador de conteúdo IA | EM DESENVOLVIMENTO ATIVO | `blog-generator/CLAUDE.md` |
| `/projetos-app` | Gerenciador interno de projetos (React) | BETA | `projetos-app/CLAUDE.md` |

> **REGRA DE OURO:** Para trabalhar em qualquer subprojeto, navegue para sua pasta
> e inicie uma nova sessão do Claude Code lá. Não trabalhe no ecossistema inteiro em uma única sessão.

---

## Stack Global
- **Frontend:** Vanilla HTML/CSS/JS (blog, landing, admin, generator)
- **Exceção:** `projetos-app` usa React + Vite
- **DB:** Supabase (PostgreSQL + RLS)
- **CDN/Storage:** Bunny.net (`pelimotion-portfolio.b-cdn.net`)
- **Deploy:** Vercel (todos os subprojetos via push no `main`)
- **IA:** Vertex AI — Gemini 2.5 Pro/Flash + Imagen 3.0
- **Design Tokens:** `/design-tokens.json`

## Convenções (ver STANDARDS.md para detalhes)
- Commits: conventional commits (`feat:`, `fix:`, `refactor:`, `docs:`)
- Nomes de arquivo: `kebab-case`
- Variáveis de ambiente: nunca no código, sempre em `.env` + Vercel dashboard
- Imagens: sempre via Bunny.net CDN, nunca commitadas no repositório

## O Que Nunca Fazer na Raiz
- Editar arquivos dentro de `/blog/*.html` — são gerados pelo build engine
- Instalar dependências globais que quebrem `projetos-app/package.json`
- Abrir `/projetos-app/` nesta sessão — tem seu próprio agente
