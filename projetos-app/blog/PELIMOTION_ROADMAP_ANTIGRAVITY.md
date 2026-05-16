# 🚀 ROADMAP COMPLETO — Blog SEO pelimotion.art
## Para rodar no Antigravity (Claude Code)

---

## ⚠️ REGRA DE OURO ANTES DE TUDO

> **NUNCA tocar na estrutura existente do site.**
> O portfólio, a landing page e o gerenciador de projetos são intocáveis.
> TODO o trabalho acontece exclusivamente em `http://pelimotion.art/blog` como rota nova, independente, com seu próprio sistema de arquivos, layout e lógica.

---

## FASE 0 — Setup (fazer uma vez, nunca mais)

### 0.1 Criar o arquivo `claude.md`
Salvar na raiz do projeto como `CLAUDE.md`. Conteúdo completo está na **Parte 2** deste documento.

### 0.2 Inspecionar o site existente (leitura, zero escrita)
Pedir ao Antigravity:

```
Leia o código do site atual em modo somente-leitura.
Identifique: stack utilizada, como as rotas são definidas, onde ficam os assets
do portfólio (imagens, GIFs, vídeos, textos de projeto).
NÃO modifique nada. Apenas me devolva um mapa de estrutura e uma lista dos
assets de portfólio disponíveis com seus caminhos.
```

### 0.3 Criar a rota `/blog` isolada
```
Com base na stack identificada, crie o módulo de blog em /blog como rota
completamente independente do restante do site.
Requisitos técnicos:
- Static Site Generation (SSG) obrigatório — nunca SSR ou CSR
- Lighthouse score alvo: 100 SEO, 95+ Performance, 95+ Acessibilidade
- Gerar sitemap.xml e robots.txt que incluam as URLs de /blog
- URL pattern: /blog/[slug] para PT e /en/blog/[slug] para EN
- Sistema de tags/categorias para filtrar posts
- Não compartilhar estado, contexto ou componentes com o portfólio existente
  (pode reutilizar tokens de design como cores e fontes, mas nada de lógica)
```

### 0.4 Configurar pipeline de imagens com Nano Banana
**Fase atual: Google Cloud (API gratuita)**
```
Integre a Google Cloud Imagen API (Nano Banana) ao pipeline de geração de posts.
Para cada post gerado, o sistema deve:
1. Receber um prompt de imagem gerado automaticamente a partir do tema do post
2. Chamar a API do Google Cloud Imagen com as credenciais em .env
3. Salvar a imagem retornada em /blog/assets/[slug]/hero.webp e thumb.webp
4. Inserir o caminho correto no frontmatter do post

Variável de ambiente esperada: GOOGLE_CLOUD_IMAGEN_API_KEY
Não hardcode nenhuma chave no código.

[MIGRAÇÃO FUTURA: quando eu avisar, trocar o provider para Higgsfield API.
Deixar a integração em um módulo isolado (ex: services/imageProvider.ts)
para que a troca seja feita mudando apenas esse arquivo.]
```

---

## FASE 1 — Primeiros 10 posts (semana 1–2)

### Regra de publicação progressiva
**Nunca publicar mais de 3 posts por semana.** O Google penaliza dumps de conteúdo. Publicar de forma gradual e solicitar indexação manual no Google Search Console a cada novo post.

### Sequência de posts de estreia (PT primeiro)

| # | Tema | Categoria | Keyword alvo | Idioma |
|---|------|-----------|--------------|--------|
| 1 | Diferença prática entre motion design, motion branding e "só um videozinho" | Técnica | motion branding o que é | PT |
| 2 | Por que 30 segundos de animação não custam só 30 segundos de trabalho | Negócio | preço motion design | PT |
| 3 | Como é o fluxo realista de um job de motion do briefing à entrega | Processo | processo motion design | PT → EN |
| 4 | What is motion branding and why your brand needs it | Branding | motion branding agency | EN |
| 5 | O que é uma boa animação de logo (e por que a maioria é só efeito pronto) | Técnica | animação de logo | PT |
| 6 | How to brief a motion studio (without wasting budget) | Processo | motion design brief | EN |
| 7 | Por que algumas marcas "travam" na hora de aprovar um vídeo | Psicologia | aprovação criativa | PT |
| 8 | Como usar IA para ganhar tempo em motion/pós sem virar cópia genérica | IA & Processo | IA motion design | PT → EN |
| 9 | When does 3D make sense vs well-crafted 2D motion | Técnica | 3D vs 2D motion | EN |
| 10 | Quando faz sentido investir em motion branding em vez de mais um vídeo | Negócio | identidade de movimento | PT |

---

## FASE 2 — Estrutura permanente do blog

### Páginas de serviço (Service Pages com SEO local/global)
Criar após os 10 primeiros posts estarem no ar:

```
/blog/servicos/motion-branding          (PT)
/blog/servicos/pos-producao             (PT)
/blog/servicos/animacao-de-logo         (PT)
/en/blog/services/motion-branding       (EN)
/en/blog/services/post-production       (EN)
```

### Página de índice do blog
```
/blog → lista de posts PT com filtro por categoria
/en/blog → lista de posts EN
```

---

## FASE 3 — Geração contínua de conteúdo

### Prompt de geração de post completo para o Antigravity

Quando quiser gerar um novo post, usar este prompt exato:

```
Usando as regras do CLAUDE.md, crie um post completo para o blog de pelimotion.art.

Tema: [INSERIR TEMA AQUI]
Idioma: [PT ou EN]
Categoria: [Técnica / Processo / Negócio / IA & Processo / Psicologia / Branding]
Keyword principal: [INSERIR KEYWORD]

Antes de escrever, consulte os assets do portfólio disponíveis e sugira:
- 1 a 2 projetos do portfólio que possam ilustrar o tema
- Trechos das descrições desses projetos que possam virar exemplos genéricos no texto
- 3 a 5 ideias de recortes (frames, GIFs, previews) que funcionariam como imagens no post

Depois gere:
1. Frontmatter completo (title, slug, meta description, keywords, category, lang, date)
2. Prompt de imagem para Nano Banana/Google Imagen (hero + thumb)
3. Corpo do post seguindo o template do CLAUDE.md
4. Bloco de FAQ (4 a 8 perguntas long tail)
5. CTA final com link para o portfólio ou contato

NÃO mexa em nenhuma outra parte do site.
NÃO altere arquivos fora de /blog.
```

---

## FASE 4 — Migração de imagens para Higgsfield

Quando estiver pronto para migrar:

```
Migre o provider de geração de imagens de Google Cloud Imagen para Higgsfield API.
Edite APENAS o arquivo services/imageProvider.ts.
Mantenha a mesma interface de função (mesmos inputs/outputs).
Adicione HIGGSFIELD_API_KEY ao .env.example.
Não altere nada no restante do código.
```

---

## FASE 5 — SEO técnico avançado (após 20+ posts)

```
Implemente as seguintes melhorias de SEO técnico no módulo /blog:
- Schema markup (BlogPosting, FAQ, BreadcrumbList) em JSON-LD em cada post
- Open Graph e Twitter Card tags dinâmicas por post
- Canonical tags para evitar duplicação PT/EN
- hreflang para indicar ao Google as versões PT e EN de cada artigo
- Lazy loading automático em todas as imagens de /blog
- Compressão e conversão automática para WebP de todas as imagens geradas
- Pré-renderização das páginas mais visitadas

NÃO tocar em nenhuma outra parte do site.
```

---

---

# PARTE 2 — CLAUDE.md completo para o Antigravity

> Salvar como `CLAUDE.md` na raiz do projeto

---

```markdown
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
```
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
```

---

## CHECKLIST DE CADA SESSÃO NO ANTIGRAVITY

Antes de cada nova sessão, verificar:

- [ ] CLAUDE.md está na raiz do projeto
- [ ] `.env` tem as variáveis de API configuradas
- [ ] Nunca pedir ao Antigravity para "atualizar o site" sem especificar `/blog`
- [ ] Confirmar que o post a gerar não duplica keyword já publicada
- [ ] Checar o Search Console após cada publicação para solicitar indexação
- [ ] Máximo 3 posts publicados por semana

---

*Roadmap gerado para pelimotion.art | Motion Branding & Pós-Produção*
*Blog: http://pelimotion.art/blog*
