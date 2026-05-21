# Plano de Implementação — Fase 3: Setup Next.js 15
**Status:** ⏳ Aguardando execução
**Pré-requisito:** Migrations do Supabase executadas (001, 002, 003) ✅
**Pré-requisito pendente:** Expor schemas `pelimotion` e `personal` na API do Supabase (ver Passo 0)

---

## ⚠️ PASSO 0 (manual, 2 minutos) — Expor schemas no Supabase

> **O que é:** O Supabase tem uma API REST que permite o frontend acessar o banco diretamente.
> Por padrão, ela só conhece o schema `public`. Precisamos dizer a ela que os schemas
> `pelimotion` e `personal` também existem.
> **Onde fica:** Supabase Dashboard → Settings (engrenagem no menu) → API → seção "Data API"

1. Acesse: https://supabase.com/dashboard/project/gfaqnkmmbozmhroicqyc/settings/api
2. Role até **"Extra schemas"** (ou "Exposed schemas")
3. Adicione: `pelimotion` e `personal` (separados por vírgula)
4. Clique **Save**
5. Confirme que apareceu "Saved" — a API passa a enxergar as novas tabelas

---

## PASSO 1 — Criar o app Next.js 15

**O que vamos criar:** O esqueleto da aplicação. Ainda sem dados, sem design final — só a estrutura de pastas e as dependências instaladas.

**Executar no terminal** (o agente faz automaticamente):
```bash
cd felipe-workspace
npx create-next-app@latest app \
  --typescript \
  --tailwind \
  --app \
  --no-src-dir \
  --import-alias "@/*" \
  --use-npm
```

**Resultado esperado:** pasta `app/` criada com Next.js 15 funcionando.

---

## PASSO 2 — Instalar dependências

```bash
cd felipe-workspace/app

# Supabase (banco de dados + auth)
npm install @supabase/supabase-js @supabase/ssr

# shadcn/ui (componentes visuais)
npx shadcn@latest init --defaults

# Componentes shadcn necessários para o shell
npx shadcn@latest add button sidebar avatar dropdown-menu badge tooltip
npx shadcn@latest add card table dialog sheet input label select

# Calendário (barras contínuas por etapa de projeto)
npm install @fullcalendar/react @fullcalendar/core @fullcalendar/daygrid @fullcalendar/timegrid @fullcalendar/interaction

# Tabelas (pipeline, CRM, financeiro)
npm install @tanstack/react-table

# Gráficos (dashboard financeiro)
npm install recharts

# Estado global
npm install zustand

# Formulários + validação
npm install react-hook-form zod @hookform/resolvers

# Ícones
npm install lucide-react
```

---

## PASSO 3 — Configurar variáveis de ambiente

Criar `app/.env.local`:
```env
NEXT_PUBLIC_SUPABASE_URL=https://gfaqnkmmbozmhroicqyc.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=[pegar do .env do workspace]
NEXT_PUBLIC_BUNNY_CDN=https://pelimotion-portfolio.b-cdn.net
BUNNY_API_KEY=[pegar do .env do workspace]
BUNNY_STORAGE_ZONE=pelimotion-portfolio
```

> **NEXT_PUBLIC_** significa que a variável fica visível no browser (necessário para URL e chave anon do Supabase).
> Variáveis sem esse prefixo ficam só no servidor (necessário para a chave secreta do Bunny).

---

## PASSO 4 — Criar clientes Supabase

Next.js 15 tem dois contextos: **servidor** (SSR, server components) e **browser** (client components).
O Supabase precisa de um cliente diferente para cada um.

### `app/lib/supabase/server.ts`
```typescript
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function createSupabaseServer() {
  const cookieStore = await cookies()
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => cookieStore.getAll(),
        setAll: (cs) => cs.forEach(({ name, value, options }) => cookieStore.set(name, value, options)),
      },
    }
  )
}
```

### `app/lib/supabase/browser.ts`
```typescript
import { createBrowserClient } from '@supabase/ssr'

export function createSupabaseBrowser() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
```

### `app/middleware.ts`
```typescript
import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({ request })
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => request.cookies.getAll(),
        setAll: (cs) => cs.forEach(({ name, value, options }) =>
          response.cookies.set(name, value, options)
        ),
      },
    }
  )
  const { data: { user } } = await supabase.auth.getUser()
  if (!user && !request.nextUrl.pathname.startsWith('/login')) {
    return NextResponse.redirect(new URL('/login', request.url))
  }
  return response
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|login).*)'],
}
```

---

## PASSO 5 — Gerar tipos TypeScript do Supabase

> **O que é:** O Supabase pode gerar automaticamente os tipos TypeScript das suas tabelas.
> Isso significa que quando você escrever `supabase.from('projects')`, o editor já sabe
> quais colunas existem e avisa se você errar o nome.

```bash
# Instalar a CLI do Supabase (se não tiver)
npm install -g supabase

# Dentro da pasta app/
supabase gen types typescript \
  --project-id gfaqnkmmbozmhroicqyc \
  --schema public,pelimotion,personal \
  > lib/supabase/types.ts
```

---

## PASSO 6 — Estrutura de rotas (App Router)

Criar a seguinte estrutura de pastas em `app/app/`:

```
app/app/
├── layout.tsx                    ← layout raiz (fonte, providers globais)
├── page.tsx                      ← redirect para /pelimotion ou /personal conforme role
├── login/
│   └── page.tsx                  ← página de login
├── (pelimotion)/                 ← route group — compartilha layout com sidebar PLM
│   ├── layout.tsx                ← sidebar + header do domínio Pelimotion
│   ├── projetos/
│   │   ├── page.tsx              ← lista/kanban de projetos
│   │   ├── [id]/page.tsx         ← projeto individual
│   │   └── calendario/page.tsx   ← calendário de etapas
│   ├── financeiro/
│   │   └── page.tsx
│   └── crm/
│       └── page.tsx
└── (personal)/                   ← route group — compartilha layout com sidebar Pessoal
    ├── layout.tsx
    ├── tasks/page.tsx
    ├── gastos/page.tsx
    ├── saude/page.tsx
    └── projetos/page.tsx
```

> **Route groups** (pastas com parênteses) são uma feature do Next.js 15:
> permitem compartilhar layout (como a sidebar) sem aparecer na URL.
> `/pelimotion/projetos` não tem o "(pelimotion)" na URL, mas usa o layout dele.

---

## PASSO 7 — Verificação

Ao final da Fase 3, o seguinte deve funcionar:
- [ ] `npm run dev` dentro de `app/` → abre no browser sem erros
- [ ] `/login` → renderiza página de login
- [ ] Usuário não logado em qualquer rota → redireciona para `/login`
- [ ] Usuário logado → vê o shell com sidebar
- [ ] Query de teste: `supabase.from('projects').select('*').limit(1)` → retorna `[]` sem erro

---

## ARQUIVOS A CRIAR NESTA FASE

| Arquivo | O que é |
|---------|---------|
| `app/` | Pasta do Next.js 15 (criada pelo create-next-app) |
| `app/.env.local` | Variáveis de ambiente do Next.js |
| `app/lib/supabase/server.ts` | Cliente Supabase para Server Components |
| `app/lib/supabase/browser.ts` | Cliente Supabase para Client Components |
| `app/lib/supabase/types.ts` | Tipos TypeScript gerados do banco |
| `app/middleware.ts` | Proteção de rotas (redireciona não-logados) |
| `app/app/layout.tsx` | Layout raiz |
| `app/app/page.tsx` | Redirect inteligente por role |
| `app/app/login/page.tsx` | Página de login |
| `app/app/(pelimotion)/layout.tsx` | Sidebar do domínio Pelimotion |
| `app/app/(personal)/layout.tsx` | Sidebar do domínio Pessoal |

---

## PRÓXIMA FASE APÓS CONCLUIR

**Fase 4 — Shell + Auth** → ver `plans/phase-04-shell-auth.md` (criado quando esta fase concluir)

Entregável da Fase 4: sidebar completa, dark mode, avatar, dropdown de usuário, navegação funcional entre módulos.
