# AI AGENT BRIEFING — PELIMOTION
**Carregado automaticamente via @import no CLAUDE.md de cada subprojeto.**
**Versão:** 2.1 | **Última atualização:** 2026-05-17

---

## 🎯 REGRAS DE COMPORTAMENTO (leia antes de qualquer ação)

### Princípios de Economia de Tokens

**NUNCA faça isto:**
- ❌ Ler todo o projeto sem direção específica
- ❌ Abrir arquivos "só para entender o contexto"
- ❌ Gerar código completo sem plano aprovado
- ❌ Explicar o que você vai fazer em 3 parágrafos antes de fazer
- ❌ Usar linguagem verbose (ex: "Vou proceder com a implementação de...")

**SEMPRE faça isto:**
- ✅ Ler APENAS os arquivos listados no prompt
- ✅ Apresentar plano de 3-5 passos ANTES de executar
- ✅ Aguardar aprovação explícita ("prossiga" ou "aprovado")
- ✅ Comunicação direta: "Plano: 1. X 2. Y 3. Z. Prosseguir?"
- ✅ Listar arquivos modificados ao final de cada passo

### Formato de Resposta Obrigatório

```markdown
📋 STATUS ANTERIOR (copie do último prompt ou diga "Primeira sessão")
[O que foi feito na última sessão — 2-3 linhas max]

🎯 TAREFA ATUAL
[O que vou fazer nesta sessão — 1 linha]

📦 PLANO DE EXECUÇÃO
PASSO 1: [ação] — arquivos: [lista]
PASSO 2: [ação] — arquivos: [lista]
PASSO 3: [ação] — arquivos: [lista]

⏸️  AGUARDANDO APROVAÇÃO
[ ] Prosseguir com Passo 1
[ ] Modificar plano
[ ] Cancelar

---
[APÓS APROVAÇÃO]

✅ EXECUTADO
PASSO 1: ✓ [o que foi feito]
  Arquivos criados: [lista]
  Arquivos modificados: [lista]
  
PASSO 2: ⏳ [em andamento]

📌 PRÓXIMO PASSO (para a próxima sessão)
[O que deve ser feito depois — 1-2 linhas]
[Status: X% completo da Fase atual]
```

### Regras de Consistência e Handoff

Quando você começar uma sessão:
1. **Procure por "📌 PRÓXIMO PASSO" no último prompt** — este é seu ponto de partida
2. **Se não houver histórico**, leia o `STATUS.md` do projeto atual
3. **Copie o STATUS ANTERIOR** no topo da sua resposta (para continuidade visual)
4. **Sempre termine** definindo o PRÓXIMO PASSO (mesmo que a tarefa esteja completa, diga qual fase vem depois)

Quando você terminar uma sessão:
1. **Atualize o arquivo `STATUS.md`** do projeto atual com:
   - Data e hora
   - Fase atual
   - O que foi completado
   - O que é o próximo passo
2. **Não assuma que o mesmo agente continuará** — escreva como se estivesse passando o bastão para outro desenvolvedor

---

## 📂 CONTEXTO DO PROJETO (leia uma vez, não repita)

### Stack Tecnológico
- **Frontend:** Vanilla HTML/CSS/JS (sem frameworks — isso é intencional)
- **Backend:** Vercel Serverless Functions (Node.js)
- **Database:** Supabase (PostgreSQL + JSONB) — projeto `gfaqnkmmbozmhroicqyc`
- **IA:** Vertex AI (Gemini 2.5 Pro/Flash, Imagen 3.0)
- **CDN:** Bunny.net (`pelimotion-portfolio.b-cdn.net`)
- **Deploy:** Vercel
- **Auth:** Supabase Auth (email + senha) — UNIFICADO entre todos os sistemas

### Estrutura de Pastas (estado atual — 2026-05-16)
```
Portfolio/                        ← raiz do domínio
├── shared/                       ← módulos compartilhados entre sistemas ✅
│   ├── auth.js                   ← requireAuth(), requireRole(), signOut()
│   └── roles.js                  ← matriz de permissões (admin/editor/viewer)
├── login/                        ← página de login unificada ✅
│   └── index.html                ← /login → redireciona por role
├── blog-generator/               ← CMS de conteúdo ✅
│   ├── cms.html                  ← CMS v7.0 (Studio Hub)
│   ├── STATUS.md                 ← SEMPRE ATUALIZAR AO FINAL
│   └── [outros arquivos]
├── admin/                        ← painel admin da landing ✅ (auth migrado)
│   ├── index.html
│   └── admin.js                  ← PIN removido, usa Supabase Auth
├── api/blog/                     ← endpoints serverless
│   ├── posts.js                  ← GET/POST com mapeamento correto
│   ├── config.js                 ← retorna SUPABASE_URL + ANON_KEY
│   ├── generate-text.js
│   ├── generate-image.js
│   ├── guidelines.js
│   ├── fetch-trends.js
│   ├── gallery.js
│   └── upload-image.js
├── scripts/database/
│   ├── roles_migration.sql       ← roles + RLS policies (já rodado ✅)
│   └── migrate_images.js
├── projetos-app/                 ← gerenciador React (isolado, não tocar)
├── blog/                         ← site público (NUNCA EDITAR — gerado)
└── vercel.json                   ← rotas de /login, /blog-generator, /admin
```

### Arquivos Sagrados (NUNCA modificar sem autorização explícita)
- `blog/**` — gerado pelo build engine
- `.env` — credenciais (nunca commitar)
- `package.json` — só modificar se for instalar dependência nova
- `vercel.json` — configuração de deploy (modificar com cuidado, testar rotas)
- `shared/auth.js` — qualquer mudança aqui afeta TODOS os sistemas
- `shared/roles.js` — qualquer mudança aqui afeta permissões em tudo
- `scripts/database/roles_migration.sql` — já executado, não reexecutar

### Convenções de Código
**Git Commits:**
```bash
feat: add user authentication
fix: resolve image upload bug
refactor: extract auth logic to shared module
docs: update API documentation
```

**Nomenclatura:**
- Arquivos: `kebab-case.js`
- Funções: `camelCase()`
- Constantes: `UPPER_SNAKE_CASE`
- Classes: `PascalCase`

---

## 🔒 SCHEMA DO BANCO DE DADOS (referência crítica)

### Tabela `blog_posts` (Supabase)

**Colunas reais (PostgreSQL):**
```sql
id              UUID PRIMARY KEY
slug            TEXT UNIQUE
title           TEXT
status          TEXT ('draft' | 'published' | 'review')
category        TEXT
meta_description TEXT
meta_title      TEXT
content         TEXT (markdown)
lang            TEXT DEFAULT 'pt'
hero_prompt     TEXT
created_at      TIMESTAMPTZ
updated_at      TIMESTAMPTZ
data            JSONB  ← imagens, keywords, date, outline, research
```

**Estrutura do JSONB `data`:**
```json
{
  "keywords": ["keyword1", "keyword2"],
  "date": "2026-05-16",
  "lang": "pt",
  "angle": "tutorial",
  "outline": [{"id":"s1","title":"...","wordBudget":250}],
  "research": { "trends": [], "news": [], "angles": [] },
  "images": [
    { "id": "img-1", "prompt": "...", "url": "/blog/assets/slug/img-1.jpg", "role": "hero" }
  ]
}
```

### Tabela `profiles` (auth unificado)
```sql
id          UUID PRIMARY KEY  ← mesmo id do auth.users
email       TEXT
full_name   TEXT
role        TEXT  ← 'admin' | 'editor' | 'viewer' (DEFAULT 'editor')
avatar_url  TEXT
xp          INT
level       INT
```

### Tabela `content_presets`
```sql
id           INT PRIMARY KEY
preset_name  TEXT
section      TEXT  ← 'Strategy' | 'Outline' | 'Writing' | 'Visual'
content      TEXT  ← o prompt de guidelines
is_active    BOOLEAN
category     TEXT
```

**⚠️ MAPEAMENTO CRÍTICO (salvar):**
```js
// CMS → API (getPayload em cms.html)
{
  title: v('f-title'),
  slug: v('f-slug'),
  status: v('f-status'),
  meta_title: v('f-metaTitle'),
  meta_description: v('f-metaDescription'),
  content: v('f-content'),
  data: { date, lang, angle, keywords, images, outline, research }
}
```

**⚠️ MAPEAMENTO CRÍTICO (buscar):**
```js
// API → CMS (posts.js GET handler)
formatted = posts.map(p => ({
  id: p.id,                          // ← incluir sempre!
  data: {
    ...p.data,                       // spread do JSONB
    title: p.title,                  // promoção de coluna para .data
    slug: p.slug,
    status: p.status,
    category: p.category,
    metaDescription: p.meta_description,
    metaTitle: p.meta_title,
  },
  content: p.content
}))
// No CMS: sempre acesse p.data.title, NUNCA p.title
```

---

## 🔐 AUTH UNIFICADO (estado atual)

### Como funciona
```
/login                     ← entrada única para todos os sistemas
    ↓
Supabase Auth valida       ← projeto gfaqnkmmbozmhroicqyc
    ↓
getUserProfile()           ← lê profiles.role
    ↓
DEFAULT_REDIRECT por role:
  admin  → /admin
  editor → /blog-generator
  viewer → /projetos
```

### requireRole() — como usar em qualquer painel
```js
import { requireRole, signOut } from '/shared/auth.js';

// Permite apenas admin e editor:
const { session, profile } = await requireRole(['admin', 'editor']);
// Se não autorizado, redireciona automaticamente para /login?error=unauthorized

// Para acesso admin-only:
const { session, profile } = await requireRole(['admin']);
```

### Roles e permissões
| Role | Admin Panel | Blog Generator | Projetos |
|------|------------|----------------|---------|
| admin | ✅ full | ✅ full (publicar) | ✅ full |
| editor | ❌ | ✅ (sem publicar direto) | ✅ editor |
| viewer | ❌ | ❌ | ✅ read-only |

---

## 🧪 CHECKLIST DE QUALIDADE (antes de marcar como concluído)

### Toda modificação de código deve:
- [ ] Ter nome de função/variável descritivo
- [ ] Validar inputs (nunca assumir que vem dados corretos)
- [ ] Ter early returns em vez de nested ifs
- [ ] Usar `async/await`
- [ ] Incluir tratamento de erro (`try/catch`)

### Todo endpoint de API deve:
- [ ] Verificar método HTTP
- [ ] Validar body/params antes de usar
- [ ] Retornar erro estruturado `{ error: message }`
- [ ] Logar erros no console mas **nunca** expor stack trace
- [ ] Retornar status HTTP correto

### Antes de dizer "concluído":
- [ ] Testei manualmente?
- [ ] Atualizei `blog-generator/STATUS.md`?
- [ ] Defini o PRÓXIMO PASSO?
- [ ] Listei todos os arquivos modificados?

---

## 🔄 HANDOFF PROTOCOL (troca de agente)

### Se você é o **agente ANTERIOR** (finalizando sessão):

```markdown
## 📤 HANDOFF — [SUA TAREFA] COMPLETA

### ✅ O que foi feito
- [x] Arquivo X criado com funcionalidade Y
- [x] Arquivo Z modificado (linhas X-Y)
- [x] Testado manualmente: [resultado]

### 📦 Arquivos Modificados
Criados: [lista com tamanho em linhas]
Modificados: [lista com o que mudou]
Não tocados mas relacionados: [lista]

### 🎯 PRÓXIMO PASSO
**Tarefa:** [descrição]
**Fase:** [número e nome]
**Arquivos a ler:** [lista mínima]
**Arquivos a criar/modificar:** [lista]
**Dependências:** [o que precisa estar funcionando]
**Referência:** [arquivo de plano relevante para o projeto]

### 💾 STATUS.md Atualizado
Data: [data]
Fase: [nome] ([%] completo)
Bloqueadores: [ou "Nenhum"]
```

### Se você é o **agente NOVO** (iniciando sessão):

```markdown
## 📥 HANDOFF RECEBIDO

### Entendi que:
- [x] [O que está completo]
- [x] Próxima tarefa: [descrição]
- [x] Arquivos que vou usar: [lista]

### Confirmo dependências:
- [x] [Dependência 1]: [status]
- [x] [Dependência 2]: [status]

Prosseguir com Fase [N]?
```

---

## 🚨 RED FLAGS (se você ver isto, PARE e pergunte)

### 🔴 Flags de Código
- Ver `eval()` ou `Function()` → perguntar se é necessário
- Ver credencial hardcoded → NUNCA commitar, mover para .env
- Ver PIN auth onde deveria ter Supabase → corrigir imediatamente
- Ver `alert()` em vez de toast → substituir

### 🔴 Flags de Arquitetura
- Criar pasta nova sem estar no plano → perguntar antes
- Modificar `shared/auth.js` ou `shared/roles.js` → sempre avisar impacto
- Mudar schema do Supabase → NUNCA sem aprovação explícita
- Adicionar dependência npm → perguntar se realmente precisa

### 🔴 Flags de Processo
- Prompt sem plano de passos → pedir ao usuário que estruture
- Tarefa com mais de 5 arquivos → sugerir quebrar em sub-tarefas
- Usuário pediu "fazer rápido" → lembrar que débito técnico custa mais depois

---

## ✅ CHECKLIST FINAL (antes de cada resposta)

- [ ] Li o STATUS ANTERIOR e entendi o contexto?
- [ ] Minha tarefa está clara em 1 frase?
- [ ] Listei APENAS os arquivos que vou ler/modificar?
- [ ] Apresentei um PLANO antes de executar?
- [ ] Estou aguardando APROVAÇÃO explícita?
- [ ] Se executei algo, listei os arquivos modificados?
- [ ] Defini o PRÓXIMO PASSO para continuidade?
- [ ] Atualizei ou pedi para atualizar o `STATUS.md` do projeto?

---

**Versão:** 2.1 | **Última atualização:** 2026-05-17
**Mantenedor:** Time Pelimotion

*Carregado automaticamente via @import no CLAUDE.md de cada subprojeto. Não é necessário colar manualmente.*
