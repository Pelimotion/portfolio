# Arquitetura e Engenharia do Sistema Pelimotion Kanban

Este documento serve como a **Bíblia Arquitetural** do módulo `/projetos`. Como o sistema evoluiu para uma aplicação de gestão nível *enterprise* (estilo Notion/Linear/ClickUp), toda nova feature deve respeitar as diretrizes registradas aqui.

---

## 1. Topologia da Infraestrutura

O módulo `/projetos` é uma **Single Page Application (SPA) Híbrida** servida pela Vercel. 
O servidor da Vercel intercepta a rota `/projetos` através de um *Rewrite* no `vercel.json` e entrega o bundle estático (HTML/JS/CSS) compilado pelo Vite.

### Stack Base
* **Frontend:** React 18 + Vite.
* **Navegação:** React Router DOM v6.
* **Estado Global:** React Context API (para Autenticação e Tema). Zustand (futuramente, se o estado complexo de Board exigir).
* **Comunicação de Banco:** Supabase JS SDK (Autenticação JWT e queries PostgreSQL).
* **Estilização:** Tailwind CSS (Variáveis de Tema Shadcn/ui injectadas via PostCSS).

---

## 2. Padrão de Diretórios (Folder Structure)

A arquitetura das pastas dentro de `/projetos/src` segue um padrão de encapsulamento por responsabilidade (Feature-sliced design simplificado):

```
/projetos/src/
 ├── assets/          # Ícones, SVGs e imagens estáticas locais.
 ├── components/      # Componentes de UI reaproveitáveis (Buttons, Modals, Inputs).
 │   ├── ui/          # Componentes puramente visuais (Shadcn-like).
 │   └── layout/      # Estruturas de página (Sidebar, Topbar, MainLayout).
 ├── contexts/        # React Contexts (ex: AuthContext.jsx, ThemeProvider.jsx).
 ├── hooks/           # Custom hooks (ex: useSupabase.js, useBoard.js).
 ├── lib/             # Instâncias e utilitários globais (ex: supabase.js, cn() config).
 ├── pages/           # Entradas das rotas principais.
 │   ├── auth/        # Tela de Login e recuperação.
 │   └── dashboard/   # As views complexas (BoardView, TableView, GanttView).
 ├── services/        # Abstração de chamadas ao banco (separação do frontend e banco).
 ├── App.jsx          # Configuração do Router e Providers.
 └── main.jsx         # Entrypoint do React.
```

---

## 3. Segurança e Gestão de Estado da Interface (Gatekeeper v2)

Em substituição à antiga "Gatekeeper UI" feita em Vanilla JS, a segurança agora é gerenciada no nível do Roteador do React.

### AuthContext
O estado da sessão JWT é envelopado no topo da árvore de renderização. 
O hook `useAuth()` fornece o estado `session` e a flag booleana `isLoading`.

### Protected Routes (Rotas Protegidas)
Um componente wrapper chamado `<ProtectedRoute>` intercepta todas as navegações.
- Se `isLoading === true`: Exibe um spinner de carregamento de tela cheia.
- Se `session === null`: Força um `Navigate` automático para `/login`.
- Se autenticado: Permite a renderização dos componentes internos (Dashboard).

---

## 4. O Roadmap de Fases (Evolução Contínua)

O ciclo de vida do desenvolvimento está dividido em módulos funcionais isolados. Cada fase só começa após a conclusão, commit e teste em produção da fase anterior.

* **Fase 1: Fundação Híbrida e Auth Context**
  * Criação do ambiente limpo React Router e inicialização robusta do cliente Supabase.
* **Fase 2: Layout Base (Shell)**
  * Implementação da topografia da tela (Sidebar retrátil, Topbar responsiva, Área principal mutável).
* **Fase 3: O Motor Kanban (Core View)**
  * Integração da `@dnd-kit/core` para criar as raias (colunas).
  * Renderização otimista: mover o card visualmente e então validar com o servidor em background.
* **Fase 4: Entidade Rica (O Modal Detalhado)**
  * A gaveta de contexto que abre com o clique da tarefa.
  * Integração do `Tiptap` para rich text.
* **Fases Futuras (Projeções):**
  * *TanStack Table:* Visão alternativa em lista massiva (Spreadsheet).
  * *Dashboards:* Recharts para gráficos de produtividade.

---
*Documento atualizado automaticamente pela engenharia do assistente de IA da Pelimotion. Para consultar a versão da stack Vanilla legada, navegue até a pasta `/projetos-backup`.*
