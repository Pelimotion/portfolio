# PELIMOTION — STANDARDS.md
**Convenções de código, nomes, git e workflow para todos os subprojetos.**

---

## 1. Git

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

**Exemplos:**
```bash
feat: add drag-and-drop to image slot manager
fix: save post payload now uses flat schema
docs: update blog-generator CLAUDE.md with session history
build: run local static generation for deployment
```

### Branches
- `main` → produção (Vercel auto-deploy)
- `feat/[nome]` → nova funcionalidade
- `fix/[nome]` → hotfix
- Nunca commitar diretamente em `main` em features longas — usar PR

---

## 2. Nomes de Arquivo
- Arquivos: `kebab-case` (ex: `migrate-images.js`, `cms-main.html`)
- Componentes React: `PascalCase` (ex: `KanbanBoard.tsx`)
- Variáveis JS: `camelCase`
- Constantes: `UPPER_SNAKE_CASE`
- Classes CSS: `kebab-case` (ex: `slot-item`, `image-preview`)
- IDs HTML: `kebab-case` (ex: `image-grid`, `loader-text`)

---

## 3. Variáveis de Ambiente
**Nunca no código.** Sempre em:
1. `.env` local (gitignored)
2. Vercel dashboard → Settings → Environment Variables

### Variáveis Globais Necessárias no Vercel
| Variável | Descrição |
|----------|-----------|
| `SUPABASE_URL` | URL do projeto Supabase |
| `SUPABASE_ANON_KEY` | Chave pública (client-side seguro) |
| `SUPABASE_SERVICE_ROLE_KEY` | Chave admin (server-side only, nunca expor) |
| `GOOGLE_APPLICATION_CREDENTIALS` | Path para JSON de credenciais Google (local only) |
| `GOOGLE_CLOUD_PROJECT_ID` | ID do projeto Google Cloud |
| `BUNNY_API_KEY` | Chave da API Bunny.net |
| `BUNNY_STORAGE_ZONE` | Nome da zona de storage Bunny.net |

---

## 4. Imagens e Assets
- **Nunca commitar** imagens no repositório Git
- Todas as imagens servidas via Bunny.net CDN: `https://pelimotion-portfolio.b-cdn.net`
- Estrutura de pastas no CDN:
  - `/blog/assets/[slug]/hero.jpg` — hero image do post
  - `/blog/assets/[slug]/thumb.jpg` — thumbnail
  - `/blog/assets/[slug]/img-N.jpg` — imagens do corpo
  - `/portfolio/[projeto]/` — assets de portfólio

---

## 5. CSS
- Zero frameworks CSS no Vanilla JS (sem Tailwind na landing e no blog-generator)
- Usar CSS Custom Properties (variáveis CSS) em vez de valores hardcoded
- Referências nos design-tokens.json para consistência
- Mobile-first em novos componentes

---

## 6. APIs Serverless
- Todos os endpoints ficam em `/api/**`
- Cada endpoint é um arquivo separado
- Sempre retornar JSON
- Sempre usar `try/catch` com mensagem de erro legível
- Exemplo de estrutura:
```js
export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();
  try {
    // lógica aqui
    return res.status(200).json({ success: true, data });
  } catch (error) {
    console.error('[endpoint-name]', error);
    return res.status(500).json({ error: error.message });
  }
}
```

---

## 7. Workflow de Sessão com IA
```
INÍCIO   → cd [subprojeto] → "Leia o CLAUDE.md e confirme o contexto"
DURANTE  → se >2h ou >30 msgs: /compact → confirme contexto essencial
FIM      → "Resuma o que foi feito em 5 linhas" → atualizar CLAUDE.md → /clear
```

---

*Documento vivo — atualizar quando uma nova convenção for adotada no time.*
