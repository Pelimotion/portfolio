# Roadmap: Migração Online - Pelimotion AI Studio

O objetivo é transformar o servidor local de Node.js em uma aplicação web segura hospedada na Vercel, permitindo a gestão de conteúdo de qualquer lugar sem depender de um ambiente local ligado.

## Fase 1: Arquitetura Serverless (Backend)
- [ ] **API Routes (Vercel):** Converter `cms-server.js` em funções individuais na pasta `/api`.
- [ ] **Migração de Dados (Markdown -> DB):** Sincronizar os arquivos `.md` locais para uma tabela `blog_posts` no Supabase.
- [ ] **Configuração de Variáveis:** Mover todas as chaves do `.env` local para o dashboard da Vercel (Bunny, Google Vertex, Supabase).

## Fase 2: Segurança & Autenticação (Frontend)
- [ ] **Supabase Auth:** Adicionar tela de login obrigatória para acessar o `/blog/admin`.
- [ ] **RLS (Row Level Security):** Garantir que apenas o seu usuário possa ler e escrever as diretrizes e posts no Supabase.

## Fase 3: Image Pipeline Cloud
- [ ] **Auto-Sync Bunny.net:** Garantir que as imagens geradas via API sejam salvas diretamente no Storage da Bunny sem passar pelo disco local.
- [ ] **Fallback GitHub:** Implementar um webhook ou ação de commit automático para que, quando um post for publicado, ele seja "comitado" no repositório para o Vercel fazer o rebuild.

## Fase 4: Editor Moderno (UX)
- [ ] **TipTap Integration:** Substituir o `textarea` por um editor visual estilo Notion.
- [ ] **Live Preview:** Painel lateral mostrando como o post ficará exatamente no site.

---

### Ação Imediata: Iniciando a Migração
Vou começar criando a página de administração online e configurando as rotas de API na Vercel para que você já possa testar o gerador fora do `localhost:4000`.
