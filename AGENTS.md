# AGENTS.md — /projetos (Project Manager)
# Leia este arquivo antes de qualquer ação. Não questione decisões aqui documentadas.

## Contexto do projeto
Site 100% estático: HTML + CSS + JS vanilla. Sem package.json, sem npm, sem framework.
Deploy: Vercel via push no GitHub (serve arquivos estáticos diretamente).
Objetivo: adicionar a subpágina `/projetos` com gestão de projetos Kanban + auth Google.

## Stack definitiva (Pivoteada para Escala)
- **Frontend (Apenas `/projetos`):** React + Vite + TypeScript/JS.
- **Estilização:** Tailwind CSS + Componentes Shadcn/ui (Lucide-react, Radix UI).
- **Core Views:** dnd-kit (Kanban), TanStack Table (Tabelas), Recharts (Dashboards).
- **Auth + DB:** Supabase (Client NPM) — Fluxo de Email/Senha.
- **Deploy:** Vercel (O root continua estático, mas a pasta `/projetos` deve fazer build gerando `/projetos/dist` ou ser configurada como SPA no Vercel).

## Arquivos a criar (estrutura exata)
```
/projetos/
  index.html        ← lista de projetos em Kanban + tela de login
  projeto.html      ← detalhe do projeto + Kanban de cenas
  cena.html         ← detalhe da cena + daily log
  app.js            ← auth, supabase client, utils compartilhados
  kanban.js         ← drag & drop e atualização de status
  style.css         ← estilos da subpágina (não alterar CSS global do site)
```

## CDN imports (usar exatamente estas versões em todos os HTML)
```html
<script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/dist/umd/supabase.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/sortablejs@1.15.2/Sortable.min.js"></script>
```

## Configuração global (topo de app.js)
```js
const SUPABASE_URL = 'PREENCHER';
const SUPABASE_ANON_KEY = 'PREENCHER';
const { createClient } = supabase;
const db = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
```

## Auth: Google OAuth via Supabase
- Botão "Entrar com Google" visível apenas quando sem sessão
- Login: `db.auth.signInWithOAuth({ provider: 'google', options: { redirectTo: window.location.origin + '/projetos/index.html' } })`
- Verificar sessão no topo de cada página com `db.auth.getSession()`
- Se sem sessão em projeto.html ou cena.html → redirecionar para `/projetos/index.html`
- Logout: `db.auth.signOut()` + redirect para `/`

## Schema do banco (colar no SQL Editor do Supabase)
```sql
create table projects (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  drive_folder_url text,
  status text default 'briefing',
  created_at timestamptz default now()
);

create table scenes (
  id uuid primary key default gen_random_uuid(),
  project_id uuid references projects(id) on delete cascade,
  title text not null,
  description text,
  status text default 'a_fazer',
  drive_url text,
  position integer default 0,
  created_at timestamptz default now()
);

create table daily_log (
  id uuid primary key default gen_random_uuid(),
  scene_id uuid references scenes(id) on delete cascade,
  user_email text,
  note text not null,
  created_at timestamptz default now()
);

alter table projects enable row level security;
alter table scenes enable row level security;
alter table daily_log enable row level security;

create policy "auth_all" on projects for all using (auth.role() = 'authenticated');
create policy "auth_all" on scenes for all using (auth.role() = 'authenticated');
create policy "auth_all" on daily_log for all using (auth.role() = 'authenticated');
```

## Colunas do Kanban
Projetos (projects.status): briefing | producao | revisao | entregue
Cenas (scenes.status):      a_fazer  | em_progresso | revisao | concluido

## Navegação (query params, sem roteador)
- /projetos/index.html              → lista de projetos
- /projetos/projeto.html?id=UUID    → detalhe do projeto + cenas
- /projetos/cena.html?id=UUID       → detalhe da cena + daily log

## Regras de código (seguir sempre)
1. Cada HTML verifica sessão no script inicial — redireciona se não autenticado
2. Todos os fetches ao Supabase usam await + try/catch — erro sempre visível na UI
3. Atualização otimista: mover card no DOM antes do update no banco, reverter em erro
4. Nenhum arquivo JS ultrapassa 150 linhas — dividir em funções nomeadas
5. Usar textContent ou createElement — nunca innerHTML com dados vindos do banco
6. Zero dependências além das duas CDN listadas

## Deploy
Vercel detecta HTML estático automaticamente. Nenhum vercel.json necessário.
Push no GitHub = deploy automático.
