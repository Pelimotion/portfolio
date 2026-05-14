# Pelimotion Projects — Modern Tech Stack (2026 Vision)

Este documento define a arquitetura definitiva e as dependências para a subpágina `/projetos` (Gestão Kanban estilo Trello/Notion/ClickUp), operando como um SPA independente (Ilha React) dentro do portfólio Pelimotion.

## 1. Core Framework & Build
*   **Vite**: Bundler ultra-rápido para compilação do React.
*   **React 18**: Biblioteca principal para interfaces baseadas em componentes reativos.
*   *(O restante do site continua estático. Apenas esta pasta possui build).*

## 2. UI & Estilização
*   **Tailwind CSS**: Framework utility-first para estilização responsiva e ágil.
*   **Shadcn/ui**: Componentes acessíveis (Radix UI) e totalmente customizáveis injetados diretamente no código (não empacotados como dependência fechada).
*   **Lucide React**: Ícones consistentes e modernos.
*   **Themes**: Implementação nativa de Light/Dark mode via variáveis CSS do Tailwind.

## 3. Core Views & Interações Avançadas
Para suportar as complexas visualizações propostas (Kanban, Tabela, Gantt, Calendário):
*   **@dnd-kit/core**: Para o Kanban avançado com suporte a Drag & Drop (colunas customizáveis, swimlanes, reordenação suave).
*   **TanStack Table (React Table)**: Para a visualização estilo "Spreadsheet" (ordenação, paginação, filtros por assignee, due date, status).
*   **Frappe Gantt / react-gantt**: Para timeline visual de produção com dependências (Milestones).
*   **Recharts**: Para os Dashboards gerenciais (Burndown charts, velocity, distribuição de tarefas).

## 4. Rich Text & Colaboração
*   **Tiptap**: Editor Rich Text headless para descrições das tarefas e comentários (suporta markdown, menções `@`, blocos de código).

## 5. Backend, Real-time & Auth
*   **Supabase (NPM Client)**: Autenticação via Email/Senha e comunicação com o banco PostgreSQL.
*   **Supabase Realtime**: Assinatura de WebSockets para atualizações ao vivo (múltiplos usuários editando o board simultaneamente).

## 6. Fluxo de Deploy (Vercel)
Como o projeto passou a ter uma etapa de build em uma subpasta:
1.  A Vercel hospedará o frontend estático na raiz.
2.  A pasta `projetos/` pode ser configurada usando o **Vercel Rewrites** para servir o `dist/index.html` compilado pelo Vite a partir do prefixo `/projetos`.
