# CLAUDE.md — Pelimotion | Hub de Motion Branding & Pós-Produção

## ⚠️ REGRA ABSOLUTA — LER ANTES DE QUALQUER AÇÃO

Este projeto já possui um site em produção com portfólio, landing page e
gerenciador de projetos. Essas partes são INTOCÁVEIS.

**Todo trabalho deste claude.md acontece exclusivamente em:**
- `/blog` (posts e páginas em português)
- `/en/blog` (posts e páginas em inglês)

Nunca modificar, referenciar com import, ou alterar qualquer arquivo fora
dessas pastas, exceto:
- `sitemap.xml` (adicionar novas URLs de /blog)
- `robots.txt` (garantir que /blog é rastreável)
- `.env.example` (adicionar novas variáveis de ambiente documentadas)

---

## 1. Contexto do projeto

**Tipo de negócio:** Hub de motion branding e pós-produção de alto padrão.
Trabalha com marcas que precisam de identidades em movimento, vinhetas,
animações de logo, direção de animação e pós-produção de campanhas.

**Objetivo do blog:** Atrair leads qualificados via SEO orgânico.
Gerar autoridade de nicho nos temas motion branding, motion design,
pós-produção e processos criativos. Converter leitores em contatos.

**Público-alvo:**
- PT: produtoras, agências, creators e marcas brasileiras
- EN: agências internacionais, startups, product teams, SaaS, marcas globais

---

## 2. Regras técnicas obrigatórias

- Geração de site: **Static Site Generation (SSG) sempre**. Nunca SSR ou CSR.
- Score Lighthouse alvo: SEO 100, Performance 95+, Acessibilidade 95+
- Criar e manter `sitemap.xml` com todas as URLs públicas de /blog
- `robots.txt` deve permitir rastreamento de /blog e /en/blog
- URL pattern: `/blog/[slug]` para PT, `/en/blog/[slug]` para EN
- hreflang obrigatório em todos os posts que tiverem versão nos dois idiomas
- Imagens: sempre WebP, lazy loading, alt text otimizado para SEO
- Schema markup JSON-LD em cada post: BlogPosting + FAQPage + BreadcrumbList

---

## 3. Geração de imagens — Nano Banana

**Provider atual:** Google Cloud Imagen (API gratuita)
Variável de ambiente: `GOOGLE_CLOUD_IMAGEN_API_KEY`

**Provider futuro:** Higgsfield API (migrar quando instruído)
Toda a lógica de provider fica em `services/imageProvider.ts` isolada.

Para cada post, gerar:
- `hero.webp` — imagem principal, 1200×630px, realista e profissional
- `thumb.webp` — miniatura para listagem, 600×400px

O prompt de imagem deve ser gerado automaticamente com base no tema do post,
sempre especificando: estilo realista, paleta sóbria, sem texto sobreposto,
composição cinematográfica, iluminação de estúdio ou ambiental controlada.

---

## 4. Uso do portfólio existente

O site possui um portfólio com: thumbnails, GIFs, previews de vídeo,
vídeos completos e textos de descrição de projetos.

Regras de uso:
- Antes de criar qualquer post, consultar os assets do portfólio disponíveis
- Sugerir 1–2 projetos cujas mídias podem ilustrar o tema do post
- Usar descrições de projetos como base de insight, mas sempre reescrever
  em linguagem genérica: "em projetos de X", "um estúdio típico que...",
  "imagine uma campanha de lançamento de produto..."
- Nunca citar nome real de cliente sem autorização explícita
- Nunca inventar projetos ou dados que não existam no portfólio real
- Gerar alt text e captions SEO para cada imagem do portfólio usada no post
  Exemplo: "sequence of motion branding frames exploring logo flexibility
  for a digital product brand"
- Para cada post, sugerir: 3–5 recortes de frames, GIFs ou previews
  que funcionariam como imagens de apoio dentro do artigo

---

## 5. Tom de voz

- Sofisticado e direto: falar com quem entende do assunto, mas sem pedantismo
- Técnico com clareza: explicar processo com precisão, em linguagem que
  clientes não-técnicos também entendam
- Olhar analítico: trazer leitura sobre dinâmicas criativas e comportamento
  de cliente sem usar jargão psicanalítico explícito
  (substituir "transferência", "sublimação" por linguagem cotidiana)
- Otimista e pragmático: sempre terminar com próximo passo ou aplicação prática
- Nunca: clichês de "agência criativa", frases motivacionais vazias,
  referências a prêmios ou cases que não sejam verificáveis
- Exemplos sempre no formato "imagine uma produtora que..." ou
  "um estúdio médio típico..." — nunca autobiográfico factual

---

## 6. Estrutura obrigatória de cada post de blog

### Frontmatter (sempre incluir)
```yaml
---
title: [título com keyword principal]
slug: [url-amigavel-com-keyword]
lang: pt | en
date: [YYYY-MM-DD]
category: [Técnica | Processo | Negócio | IA & Processo | Psicologia | Branding]
keywords: [keyword principal, 3–5 variações long tail]
metaTitle: [máx 60 caracteres, com keyword]
metaDescription: [máx 155 caracteres, com keyword, orientado a clique]
heroImage: /blog/assets/[slug]/hero.webp
thumbImage: /blog/assets/[slug]/thumb.webp
heroPrompt: [prompt usado para gerar a imagem no Nano Banana]
---
```

### Estrutura do corpo
1. **H1** — keyword principal nas primeiras 100 palavras
2. **Parágrafo de abertura** — contexto, por que o tema importa
3. **H2 — O problema / A dúvida comum**
4. **H2 — O processo (como funciona na prática)**
   - Usar imagens/GIFs do portfólio aqui como ilustração
5. **H2 — O que diferencia quem faz bem do resto**
6. **H2 — Como aplicar isso no seu projeto**
7. **Bloco FAQ** (4 a 8 perguntas, usando variações long tail da keyword)
   - Schema FAQPage em JSON-LD gerado automaticamente
8. **CTA final** — link para portfólio ou formulário de contato

### Regras de formatação
- Parágrafos curtos (máx 4 linhas)
- Mínimo 1500 palavras por post (PT) / 1200 palavras (EN)
- H2 e H3 sempre com variações semânticas da keyword principal
- Mínimo 3 links internos por post (outros posts ou /blog/servicos/...)
- 1 link externo de autoridade por post (Wikipedia, Google, Awwwards, etc.)

---

## 7. Idiomas e estratégia PT/EN

### Português (Brasil) — /blog/
**Público:** Produtoras, agências, creators, marcas nacionais
**Objetivo:** Educar sobre valor do motion/pós, gerar autoridade e relacionamento
**Estilo:** Próximo, direto, referências culturais BR quando pertinente

**Temas que nascem em PT:**
- Dia a dia de estúdio/produtora no contexto brasileiro
- Dores de clientes locais (prazo, orçamento, "vídeozinho", revisão infinita)
- Textos com mais carga cultural BR, gírias de mercado, referências locais
- Psicologia de cliente e bastidores emocionais do processo criativo

### Inglês — /en/blog/
**Público:** Agências internacionais, startups, product teams, SaaS, marcas globais
**Objetivo:** Demonstrar maturidade de processo e capacidade de entrega global
**Estilo:** Direto e estruturado, ainda leve, menos coloquialismo local

**Temas que nascem direto em EN:**
- Processo, pipeline, handoff, ferramentas (buscado globalmente)
- Motion branding como componente de brand system e design system
- Como trabalhar com estúdio remoto (fuso, comunicação, entregáveis)
- Guias para quem busca estúdio de motion fora do seu país

### Regras de adaptação PT → EN
Ao adaptar um artigo:
- Não traduzir: adaptar. Ajustar exemplos e metáforas para quem não
  conhece o contexto brasileiro
- Manter keyword principal em inglês (mesma intenção de busca, H1 equivalente)
- Remover referências culturais que não viajam bem
- Reforçar sinais de confiabilidade: processo, etapas, comunicação,
  entregáveis, forma de trabalho remota
- Inserir hreflang apontando para a versão PT correspondente

---

## 8. Categorias e clusters de conteúdo

| Categoria | Objetivo SEO | Exemplos de tema |
|-----------|-------------|-----------------|
| Técnica | Keywords de especificação | diferença motion design branding |
| Processo | Públicos que buscam "como funciona" | fluxo job motion, briefing animação |
| Negócio | Decisores de compra | custo motion branding, quando investir |
| IA & Processo | Tendência com alto volume | IA motion design, imagem IA campanha |
| Psicologia | Diferenciação única, baixa concorrência | aprovação criativa, bloqueio criativo |
| Branding | Público estratégico | identidade de movimento, brand motion |

---

## 9. Ritmo de publicação

- **Máximo 3 posts por semana** — nunca publicar em bloco
- Após cada publicação: solicitar indexação manual no Google Search Console
- Não criar mais de 5 posts antes de revisar métricas no Search Console
- Após 20+ posts: revisar cluster de keywords para identificar oportunidades
  de posts de suporte (pillar pages e topic clusters)

---

## 10. O que NUNCA fazer

- Mexer em arquivos fora de /blog e /en/blog
- Alterar rotas, componentes ou lógica do portfólio, landing page
  ou gerenciador de projetos
- Publicar conteúdo em bloco (mais de 3 posts/semana)
- Inventar projetos ou dados do portfólio
- Citar clientes reais sem autorização explícita
- Usar jargão psicanalítico explícito sem tradução para linguagem comum
- Criar client-side rendering para páginas de blog
- Deixar imagens sem alt text
- Publicar post sem frontmatter completo
