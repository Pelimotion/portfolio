# Plano de Implementação: Pelimotion Automated Hub

Este documento detalha o plano de ação estratégico para transformar o blog da Pelimotion em um **Hub Automático de Autoridade B2B**, conforme a visão estabelecida.

---

## 🎯 Objetivo Geral
Criar um hub de autoridade, inspiração e utilidade para o nicho de *motion branding*, exigindo **intervenção manual próxima a zero** após o lançamento. Todas as atualizações diárias (Vagas, Eventos, Recursos, Série Semanal) serão guiadas por webhooks, RSS feeds e Inteligência Artificial.

## 🛠 Tech Stack de Automação
*   **Gerador Estático Central:** Node.js (SSG nativo já implementado em `/blog-generator`).
*   **Cérebro de Integração:** Make.com (Integromat) ou Zapier.
*   **Inteligência Artificial:** OpenAI API (para resumos curados e SEO tags) e Google Vertex AI (para hero images).
*   **Fontes de Dados (Vagas):** Jooble/Indeed Widget ou SerpApi (LinkedIn).
*   **Fontes de Dados (Eventos):** APIs Eventbrite e Meetup.com.
*   **Fontes de Dados (Cura de Vídeos):** Vimeo API / YouTube Data API + RSS Feeds (Stash, Motionographer).
*   **Newsletter:** Mailchimp (RSS-to-Email nativo).
*   **Geolocalização:** API IPAPI.co.

---

## 🚀 ROADMAP DE EXECUÇÃO (5 FASES)

### Fase 1: Fundação & CMS Setup (Semana 1)
O alicerce da arquitetura. O foco é preparar o gerador estático para suportar coleções dinâmicas complexas além de simples artigos markdown.
*   **Ação:** Criar as estruturas em `/blog-generator/content/` para suportar novas pastas: `jobs/`, `events/`, `resources/`.
*   **Ação:** Implementar um gerador dinâmico de páginas de "Coleções/Tags", que cria automaticamente as páginas a cada nova tag detectada no *frontmatter*.
*   **Ação:** Conectar e testar o RSS feed do blog (`/blog/rss.xml`) para alimentar a newsletter.
*   **Ação:** Preparar o template visual das páginas "Vagas" e "Eventos".

### Fase 2: Automação do "Motion da Semana" (Semana 2)
Implementação da série carro-chefe curada por IA.
*   **Ação:** Escrever e publicar três posts iniciais manualmente para povoar o grid.
*   **Ação (Make.com):** Configurar cenário agendado para segundas-feiras.
*   **Ação (Make.com):** Buscar o vídeo com maior engajamento via API do Vimeo em canais selecionados.
*   **Ação (OpenAI):** Rodar prompt para análise de motion branding com base nos metadados e transcrição do vídeo.
*   **Ação:** Salvar automaticamente o markdown gerado no repositório, engatilhando o Vercel Build.

### Fase 3: Vagas e Eventos Zero-Toque (Semana 3)
A utilidade diária para a comunidade criativa.
*   **Ação:** Integrar script `ipapi.co` no frontend para capturar país/cidade e passar via query params para widgets.
*   **Ação:** Implementar o agregador de Vagas de Motion Design usando widget dinâmico ou coleção atualizada a cada 6h via Make.com + SerpApi.
*   **Ação:** Configurar webhook diário conectando Eventbrite/Meetup para buscar eventos com a tag "Motion Design", salvando em um `.json` consumido pelo gerador estático.

### Fase 4: Diretório de Parceiros & Recursos (Semana 4)
Criação de pontes com o mercado sem exigir moderação constante.
*   **Ação:** Desenvolver o formulário de inscrição para Estúdios. Se usar Make.com, o form faz um Push para a branch do Github criando um novo card de diretório.
*   **Ação:** Configurar um Web Clipper (Raindrop.io ou Pocket). Cada vez que um link for salvo na tag "Pelimotion Hub", um webhook aciona a inserção na página de "Recursos".
*   **Ação:** Ajuste global de SEO automático (tags, Schema Markup) para todas as coleções.

### Fase 5: Modo Piloto Automático & Refinamentos (Semana 5)
Lançamento e testes de estresse da automação.
*   **Ação:** Simular conexões VPN para garantir que a geolocalização dos eventos e vagas funciona globalmente.
*   **Ação:** Monitorar consumo das cotas das APIs externas.
*   **Ação:** Garantir que o *Lighthouse Score* se mantém acima de 95 com as novas integrações.
