# PELIMOTION — STANDARDS.md
**Convenções de engenharia, design system, branding, git e workflow para todos os subprojetos.**

---

## 1. Identidade de Marca & Assets Oficiais

### 1.1 Símbolos e Logotipos Oficiais (`PLM_SIMBOLO`)
- O repositório e as subpáginas utilizam exclusivamente a família de marcas `PLM_SIMBOLO`:
  - `PLM_SIMBOLO_BRANCO.png` (Horizontal para Dark Mode)
  - `PLM_SIMBOLO_PRETO.png` (Horizontal para Light Mode)
  - `PLM_SIMBOLO_REDUZIDO_BRANCO.png` (Monograma para Dark Mode)
  - `PLM_SIMBOLO_REDUZIDO_PRETO.png` (Monograma para Light Mode)
- **Regra de ouro:** Arquivos legados com nomes genéricos (`logo.png`, `logo_white.png`, `logo.svg`) não devem ser usados em novas páginas nem em componentes recentes.

### 1.2 Favicon do Ecossistema
- **Arquivo Oficial:** `LOGO.ico` (multi-resolução).
- **Inclusão Padrão em todos os arquivos HTML:**
  ```html
  <link rel="icon" type="image/x-icon" href="/LOGO.ico">
  <link rel="shortcut icon" type="image/x-icon" href="/logo.ico">
  ```
- **Fallback Vercel:** O arquivo `vercel.json` contém regra de rewrite para garantir que requisições sensíveis a maiúsculas/minúsculas resolvam corretamente.

### 1.3 Padrões Visuais (Brand Patterns)
- Localizados em `assets/patterns/`:
  - `pattern01_web.jpg`, `pattern02_web.jpg`, `pattern03_web.jpg`
  - Utilizados como textura sutil em marca d'água (`opacity: 0.03 a 0.05`, `mix-blend-mode: screen`).

---

## 2. Design System & Filosofia Black Neumorphic Minimalist (`/bora`)

1. **Monocromatismo Estrito:**
   - Evitar cores saturadas ou arco-íris de acentos coloridos no `/bora`.
   - Paleta de base: Obsidiana (`#08080a`, `#0e0e12`, `#131318`), Titânio e Prata lunar (`#EDEDF0`, `#9A9AA6`, `#52525E`).
2. **Superfícies Táteis Esculpidas:**
   - **Extrusão Neumórfica (Cards / Botões em repouso):**
     `background: var(--bg-surface); box-shadow: 8px 8px 24px rgba(0,0,0,0.75), -6px -6px 20px rgba(255,255,255,0.025);`
   - **Cavidade Debossed (Inputs / Seleções ativas):**
     `background: var(--bg-inset); box-shadow: inset 4px 4px 10px rgba(0,0,0,0.85), inset -3px -3px 8px rgba(255,255,255,0.035);`
   - **Bordas Hairline Sheen:** 1px com reflexo rasante superior `rgba(255, 255, 255, 0.12)`.
3. **Micro-interações & Audio Haptics:**
   - Micro-interações táteis integradas via Web Audio API nativo com osciladores senoidais suaves (380Hz a 520Hz) e controle de silenciamento.

---

## 3. Diretrizes de Intake & Protocolo (`/bora`)

1. **Sem Preços Públicos:** A página `/bora` captura briefing e parâmetros técnicos, mas **nunca exibe estimativas públicas de valor** para proteger a negociação do diretor artístico.
2. **Protocolo Oficial Único:** Toda sessão gera um código exclusivo formatado como `BORA-26-XXXX`.
3. **Estratégia de Saída Dupla:**
   - Envio de briefing dispara o protocolo no assunto do e-mail.
   - O usuário pode prosseguir instantaneamente no WhatsApp (com o protocolo inserido no texto) ou aguardar retorno por e-mail em até 2 horas.

---

## 4. Git & Commits

### Commits
Usar [Conventional Commits](https://www.conventionalcommits.org/):
```
feat:     nova funcionalidade
fix:      correção de bug
refactor: refatoração sem mudar comportamento
docs:     mudança em documentação
style:    mudanças visuais/CSS sem lógica
build:    mudanças no build ou dependências
chore:    tarefas de manutenção
```

### Branches
- `main` → produção (Vercel auto-deploy)
- `feat/[nome]` → nova funcionalidade
- `fix/[nome]` → hotfix

---

## 5. Nomes de Arquivo e Código
- Arquivos: `kebab-case` (ex: `build.js`, `theme.js`)
- Componentes React: `PascalCase` (ex: `GalleryScene3D.tsx`)
- Variáveis JS: `camelCase`
- Constantes: `UPPER_SNAKE_CASE`
- Classes CSS: `kebab-case` (ex: `tactile-channel-card`, `brand-symbol-img`)
- IDs HTML: `kebab-case` (ex: `view-intake`, `btn-submit-intake`)

---

## 6. Variáveis de Ambiente
**Nunca no código.** Sempre em:
1. `.env` local (gitignored)
2. Vercel dashboard → Settings → Environment Variables

### Variáveis Globais Necessárias no Vercel
| Variável | Descrição |
|----------|-----------|
| `SUPABASE_URL` | URL do projeto Supabase |
| `SUPABASE_ANON_KEY` | Chave pública (client-side seguro) |
| `SUPABASE_SERVICE_ROLE_KEY` | Chave admin (server-side only, nunca expor) |
| `BUNNY_API_KEY` | Chave da API Bunny.net |
| `BUNNY_STORAGE_ZONE` | Nome da zona de storage Bunny.net |

---

## 7. Mídia e Bunny.net CDN
- **Nunca comitar** vídeos (`.mp4`), áudios (`.mp3`, `.wav`) ou binários WebAssembly (`.wasm`) no Git.
- Todos os vídeos e áudios de portfólio são servidos diretamente pela CDN global da Bunny.net (`https://pelimotion-portfolio.b-cdn.net`).
- Arquivos e pastas de backup pesados são isolados em `_BACKUP_PARA_REMOVER/` e bloqueados no deploy via `.vercelignore` e `.gitignore`.

---

*Pelimotion — Documentação mantida com padrões sênior de engenharia de software e direção criativa.*
