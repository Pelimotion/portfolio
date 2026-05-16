# 🧠 Prompt para Antigravity – Implementação do Sistema Generativo de Ícones & Padrões

## Seu papel
Você é um engenheiro de software sênior especializado em sistemas generativos, SVG, arquiteturas serverless e patrimônio cultural digital. Você tem acesso ao meu repositório GitHub (já configurado com Vercel + Supabase). Seu objetivo é implementar o plano descrito em `plano_generativo_antigravity.html`, gerando código limpo, determinístico, performático e culturalmente respeitoso.

## Contexto do meu projeto atual
- Hospedagem: Vercel (frontend + serverless functions).
- Banco de dados: Supabase (Postgres).
- Repositório: GitHub (branch principal `main`).
- Stack: **JavaScript/Node.js** (pode ser Next.js App Router ou Pages Router, ou apenas HTML/CSS/JS estático + API routes). Você deve detectar a estrutura atual e adaptar.
- Já existe um projeto rodando – você **NÃO** deve sobrescrever funcionalidades essenciais, apenas **adicionar** as novas features do sistema generativo.

## Objetivo geral
Implementar o **Sistema Generativo de Ícones & Padrões** com:
- Geração determinística de SVG via semente SHA‑256 (baseada no `slug` do projeto).
- Ícones (identicons) com grade 6–12, simetria 4x, formas culturais (Adinkra, Karahanamon, Seigaiha, Arte Islâmica).
- Padrões complexos com L‑System (Curva de Gosper), Tapete Persa fractal e ruído Perlin.
- Efeito de parallax no frontend (camadas SVG com velocidades distintas).
- API REST serverless (Vercel Functions) com cache em Supabase + ETag.
- Persistência de SVGs gerados, metadados e hashes.

## Roadmap de implementação (6 fases obrigatórias)

### FASE 0 – ANÁLISE E PREPARAÇÃO
- Explore a estrutura atual do projeto:
  - Identifique se existe `package.json`, qual o framework (Next.js, Express, etc.).
  - Verifique se as variáveis de ambiente `SUPABASE_URL` e `SUPABASE_KEY` estão configuradas na Vercel.
  - Crie as tabelas no Supabase (scripts SQL abaixo) se não existirem.
  - Instale dependências necessárias: `npm install @supabase/supabase-js zod` (e, opcionalmente, `simplex-noise`, `resvg-js` para preview PNG).

### FASE 1 – FUNDAÇÃO: MOTOR DE SEMENTES E TOKENS
**Skills:** Algoritmos, Web Crypto, ESM modules.  
**Arquivos a criar:**  
- `lib/seed-engine.js` – função `getSeed(slug)` → `Float32Array[8]` usando SHA‑256.
- `lib/palette.js` – exportar `ICON_PALETTE` (4 tons) e `PATTERN_PALETTE` (6 tons), função `pickColor(float, palette)`.
- `lib/utils.js` – helpers de normalização, hash de conteúdo.

**Teste esperado:** `getSeed('meu-projeto')` sempre retorna os mesmos 8 floats.

### FASE 2 – GERADOR DE ÍCONES (IDENTICON CULTURAL)
**Skills:** SVG, manipulação de DOM virtual, simetria.  
**Arquivos a criar:**  
- `lib/shapes/index.js` – objetos para 12 formas: círculo, anéis concêntricos (Adinkrahene), losango, cruz, pétala 4/6 (Karahanamon), triângulo, chevron, braço espiral, estrela 6, roseta (islâmica), unidade Seigaiha.  
  Cada forma: `render(x, y, size, color, quadrant, totalSize) → string SVG`.
- `lib/icon-generator.js` – função `generateIcon(slug)`.  
  Lógica:  
  1. Obter seed.  
  2. `N = 6 + floor(seed[0] * 7)`.  
  3. Preencher quadrante superior esquerdo (ceil(N/2) × ceil(N/2)): ativa célula se `seed[idx] > 0.42`.  
  4. Aplicar simetria 4x (reflexão horizontal e vertical).  
  5. Cada célula ativa recebe uma forma aleatória (via seed) e cor via `pickColor`.  
  6. Construir SVG com viewBox="0 0 512 512", title, desc, atributo `data-seed`.  
  7. Retornar `{ svgString, hash: sha256(svgString), metadata: { N, shapesUsed } }`.
- Teste: mesmo slug → mesmo SVG.

### FASE 3 – GERADOR DE PADRÕES (L‑SYSTEM, TAPETE PERSA, PERLIN)
**Skills:** Fractais, recursão, ruído, turtle graphics.  
**Arquivos a criar:**  
- `lib/lsystem/gosper.js` – implementação da Curva de Gosper: axioma "A", regras de produção, iterar 3–6 vezes, converter para `points` array, retornar polyline.  
- `lib/persian-rug.js` – função recursiva `persianFractal(x, y, w, h, depth, seed, palette)` que desenha `<rect>` com cor baseada na profundidade e cria bordas. Profundidade máxima 5.  
- `lib/perlin.js` – wrapper do `simplex-noise` para deslocar vértices da polyline (amplitude e frequência definidas por seed).  
- `lib/pattern-generator.js` – função `generatePattern(slug, options = { layers: 3 })`.  
  Combina: camada de fundo (Persian rug), camada média (Gosper com Perlin), camada de overlay (opcional).  
  Retorna SVG multicamada e também `layers_json` para parallax.  
- Teste: padrão com mesmo slug é idêntico; tempo de geração < 200ms.

### FASE 4 – PARALLAX E COMPOSIÇÃO VISUAL (FRONTEND)
**Skills:** CSS 3D, requestAnimationFrame, acessibilidade.  
**Arquivos a criar:**  
- `public/parallax.js` ou integração no componente principal.  
  Função `initParallax(container, layersSelector = '.pattern-layer', speeds = [0.01,0.025,0.045])`.  
  - Escuta `mousemove`, transforma `translate3d` com `will-change`.  
  - Usa `requestAnimationFrame` e `IntersectionObserver` para pausar quando fora da tela.  
  - Respeita `prefers-reduced-motion`.  
- Na página de visualização do projeto: carregar o SVG do padrão, decompô‑lo em camadas (se já existir `layers_json`, usar; senão, gerar na hora).  
- **Ajuste responsivo:** mobile detecta `deviceorientation`.

### FASE 5 – API SERVERLESS + SUPABASE (PERSISTÊNCIA)
**Skills:** Vercel Functions, SQL, caching.  
**Scripts SQL para Supabase (executar uma vez):**
```sql
CREATE TABLE projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  display_name TEXT,
  seed_hex CHAR(64),
  symbol_set TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  metadata JSONB
);

CREATE TABLE icons_cache (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  svg_string TEXT NOT NULL,
  content_hash CHAR(64) UNIQUE NOT NULL,
  grid_size SMALLINT,
  shape_set JSONB,
  generated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE patterns_cache (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  svg_string TEXT NOT NULL,
  layers_json JSONB,
  algorithm TEXT,
  content_hash CHAR(64) UNIQUE NOT NULL,
  generated_at TIMESTAMPTZ DEFAULT now()
);