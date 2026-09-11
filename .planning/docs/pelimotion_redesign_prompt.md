# 🎬 PELIMOTION OS — PROMPT MESTRE DE REFINAMENTO UI/UX
**Para: Google Gemini Flash (ou Claude Sonnet como fallback)**
**Escopo: Revisão total de design, funcionalidade e sistema de identidade visual por projeto**
**Nível de operação: Arquiteto de produto sênior + Designer de sistemas**

---

## CONTEXTO DO SISTEMA (leia completamente antes de qualquer ação)

O **Pelimotion OS** é uma plataforma de gerenciamento de projetos de Motion Design construída com:
- **Stack**: React + Radix UI + Tailwind CSS + Supabase
- **Tema**: Dark-mode exclusivo, estética "Motion Studio" premium
- **Arquitetura de dados**: Hierarquia `Hub → Projeto → Cena`, dados em `pages` e `pages_properties` do Supabase
- **Usuários**: Times criativos de Motion Design, diretores de arte, produtores

### Telas principais (já existentes):
1. **Projects Hub** — Grid/Board/List de projetos com colunas de status (Briefing, Produção, Revisão, Entrega)
2. **Pipeline View** — Kanban de cenas por projeto com colunas de status granular (Backlog, AI Generation, Selects, Motion, Revisão, Concluído)
3. **Scene Detail** — Detalhe de cena com notas, log diário, assets, responsável
4. **Team Manager** — Modal de gerenciamento de membros do projeto
5. **Assets Panel** — Integração Google Drive para links de arquivos

### Problema central declarado pelo usuário:
> "achando tudo um pouco confuso falando de design e layout... revisão se todos os botões estão funcionais (se todos os cards têm três pontinhos e coisas do tipo)... o sistema de gerar um gradiente de cada cor pra cada página criada seja substituído por um sistema moderno que gera animações com patterns inspirados em obras de artes famosas animados com estilo minimalista"

---

## PARTE 1 — AUDITORIA DE COMPONENTES INTERATIVOS

Para **cada componente listado abaixo**, verifique e corrija a presença e funcionalidade dos elementos interativos padrão. Não remova funcionalidade existente — apenas adicione o que estiver faltando.

### 1.1 Project Card (Projects Hub)
**Deve ter obrigatoriamente:**
- [ ] **Three-dot menu (⋯)** — visível no hover OU sempre no canto superior direito
  - Ações: Renomear, Duplicar, Arquivar, Excluir, Copiar link
- [ ] **Status badge** — clicável para alterar status inline
- [ ] **Avatar stack** de membros — clicável para abrir Team Manager
- [ ] **Quick stats** — contador de cenas, progresso visual (barra ou anel)
- [ ] **Drag handle** — se a view for reordenável

**Padrão de referência**: Card do Notion com hover state revelando ações + Linear.app com densidade de informação controlada.

### 1.2 Scene Card (Pipeline Kanban)
**Deve ter obrigatoriamente:**
- [ ] **Three-dot menu (⋯)** — no hover, canto superior direito
  - Ações: Abrir detalhe, Mover para coluna, Atribuir responsável, Duplicar, Excluir
- [ ] **Priority indicator** — ícone no canto superior esquerdo (flames 🔥 = alta, dash — = normal, arrow ↑ = urgente)
- [ ] **Deadline chip** — data formatada, vermelho se vencida, laranja se próxima (< 3 dias)
- [ ] **Avatar do responsável** — clicável para reatribuir
- [ ] **Drag handle** implícito (toda a área do card é draggável via dnd-kit)
- [ ] **Status chip** no topo do card — clicável para abrir select inline

### 1.3 Column Header (Kanban)
**Deve ter obrigatoriamente:**
- [ ] **Contagem de itens** — badge numérico ao lado do título
- [ ] **Add button (+)** — para criar nova cena naquela coluna diretamente
- [ ] **Column menu (⋯)** — ocultar coluna, definir limite WIP, reordenar

### 1.4 Table Row (Table View)
**Deve ter obrigatoriamente:**
- [ ] **Checkbox** de seleção no início da linha
- [ ] **Row menu (⋯)** aparecendo no hover no final da linha
- [ ] **Inline editing** — clique na célula para editar o valor imediatamente

### 1.5 Sidebar (Navegação Global)
**Deve ter obrigatoriamente:**
- [ ] **Project item** com three-dot ao hover → Renomear / Duplicar / Arquivar
- [ ] **Collapse/expand** de seções (SISTEMA, PROJETOS)
- [ ] **Indicador de projeto ativo** — borda ou highlight de cor
- [ ] **Tooltip** em items colapsados

---

## PARTE 2 — SISTEMA DE LAYOUT E HIERARQUIA VISUAL

### 2.1 Princípios de Design a Aplicar

Baseado nas melhores práticas de Notion, Linear, Obsidian e tendências 2025/2026:

**A) Densidade Controlada (Notion + Linear)**
- Use `gap` e `padding` consistentes via tokens CSS: `--space-1: 4px` até `--space-8: 32px`
- Kanban cards: padding interno `12px 14px`, border-radius `8px`
- Sidebar: `240px` largura, itens com `32px` de altura, `8px` padding lateral
- Header de projeto: `56px` altura fixa, separado do conteúdo por `1px border`

**B) Hierarquia Tipográfica Clara**
- Título de projeto: `18px / font-weight: 600 / letter-spacing: -0.3px`
- Título de coluna Kanban: `11px / font-weight: 700 / letter-spacing: 0.8px / uppercase / opacity: 0.5`
- Nome da cena no card: `13px / font-weight: 500`
- Metadados (data, avatar): `11px / opacity: 0.6`

**C) Estados de Interação (Micro-interactions)**
- Hover em cards: `background` sobe `5%` de luminosidade + borda `1px solid rgba(255,255,255,0.08)`
- Three-dot menu: `opacity: 0` → `opacity: 1` com `transition: 0.15s ease`
- Drag: card em arraste tem `opacity: 0.7 + scale(1.02) + box-shadow elevado`
- Status change: animação de `scale` no badge ao confirmar mudança
- Card click: `scale(0.98)` por `100ms` antes de abrir o detalhe

**D) Bento Grid no Hub (tendência 2025)**
No Projects Hub, ao invés de grid uniforme, use um layout assimétrico estilo bento:
- Projeto featured/prioritário: card `2x1` (largura dupla)
- Projetos normais: card `1x1`
- Permita ao usuário "destacar" um projeto para o slot 2x1

**E) Espaço Negativo e Respiração**
- Margens de seção: `24px` entre grupos distintos
- Kanban: colunas com `min-width: 272px`, gap entre colunas `12px`
- Cards com `margin-bottom: 6px` dentro da coluna
- Header global: sempre fixo com `backdrop-filter: blur(12px)`

### 2.2 Correções de Consistência Visual

Implemente as seguintes correções de consistência:

```css
/* Tokens base do sistema — adicionar ao globals.css ou equivalente */
:root {
  /* Superfícies */
  --surface-0: #09090B;   /* background base */
  --surface-1: #111113;   /* sidebar, panels */
  --surface-2: #1A1A1E;   /* cards */
  --surface-3: #242428;   /* cards hover, modais */
  --surface-overlay: rgba(9,9,11,0.85);

  /* Bordas */
  --border-subtle: rgba(255,255,255,0.06);
  --border-default: rgba(255,255,255,0.10);
  --border-strong: rgba(255,255,255,0.18);

  /* Status colors — sistema coeso */
  --status-backlog: #52525B;
  --status-ai-gen: #6366F1;
  --status-selects: #3B82F6;
  --status-motion: #A855F7;
  --status-revisao: #F59E0B;
  --status-entregue: #22C55E;

  /* Spacing scale */
  --space-1: 4px;
  --space-2: 8px;
  --space-3: 12px;
  --space-4: 16px;
  --space-5: 20px;
  --space-6: 24px;
  --space-8: 32px;

  /* Radius */
  --radius-sm: 6px;
  --radius-md: 8px;
  --radius-lg: 12px;
  --radius-xl: 16px;
}
```

---

## PARTE 3 — SUBSTITUIÇÃO DO SISTEMA DE GRADIENTE

### 3.1 O Problema
Atualmente cada projeto/página recebe um gradiente de cor gerado proceduralmente. Isso é visualmente genérico e não diferencia o produto.

### 3.2 A Solução: ArtPattern Engine™

Crie um sistema `ArtPatternEngine` que gera **padrões animados inspirados em obras de arte famosas**, renderizados em SVG animado com CSS, de forma minimalista e performática.

#### Implementação técnica:

```typescript
// artPatternEngine.ts
// Baseado no ID único da página/projeto, seleciona um "estilo" de padrão

export type ArtStyle = 
  | 'mondrian'      // Piet Mondrian — grades ortogonais, blocos de cor primária
  | 'kandinsky'     // Wassily Kandinsky — círculos concêntricos e arcos
  | 'escher'        // M.C. Escher — tessellations, padrões repetitivos
  | 'rothko'        // Mark Rothko — campos de cor com bordas suaves pulsantes
  | 'klee'          // Paul Klee — grids irregulares com variação de tonalidade
  | 'pollock'       // Jackson Pollock — linhas orgânicas em movimento contínuo
  | 'vasarely'      // Victor Vasarely — Op Art, ilusão de profundidade com quadrados
  | 'bridget_riley' // Bridget Riley — linhas ondulantes em movimento
  | 'malevich'      // Kazimir Malevich — suprematismo, formas geométricas flutuantes
  | 'albers'        // Josef Albers — quadrados dentro de quadrados, cor relacional

export function getArtStyleFromId(projectId: string): ArtStyle {
  const styles: ArtStyle[] = [
    'mondrian', 'kandinsky', 'escher', 'rothko', 'klee',
    'pollock', 'vasarely', 'bridget_riley', 'malevich', 'albers'
  ]
  // Hash determinístico do ID → sempre o mesmo estilo para o mesmo projeto
  const hash = projectId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)
  return styles[hash % styles.length]
}

export function getAccentColorFromId(projectId: string): string {
  // Gera uma cor accent baseada no ID, dentro de uma paleta curada de 12 cores
  const palette = [
    '#6366F1', '#8B5CF6', '#EC4899', '#F59E0B', 
    '#10B981', '#3B82F6', '#EF4444', '#14B8A6',
    '#F97316', '#84CC16', '#06B6D4', '#E879F9'
  ]
  const hash = projectId.split('').reduce((acc, char) => acc * 31 + char.charCodeAt(0), 7)
  return palette[Math.abs(hash) % palette.length]
}
```

#### Componente React: `<ProjectArtPattern />`

```tsx
// ProjectArtPattern.tsx
// Renderiza o padrão animado como background do card/header do projeto

interface ProjectArtPatternProps {
  projectId: string
  style?: ArtStyle        // override opcional
  accentColor?: string    // override opcional  
  size?: 'card' | 'header' | 'thumbnail'
  animated?: boolean      // padrão: true
  opacity?: number        // padrão: 0.15 para uso como background
}

// CADA PADRÃO É UM SVG INLINE COM ANIMAÇÕES CSS PURAS
// Performance: sem Canvas, sem WebGL, sem JS no animation loop
// Acessibilidade: aria-hidden="true" em todos os SVGs de padrão

const patterns = {

  mondrian: (accent: string) => `
    <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
      <style>
        .m-block { animation: mondrian-pulse 4s ease-in-out infinite alternate; }
        .m-block:nth-child(2) { animation-delay: -1.3s; }
        .m-block:nth-child(3) { animation-delay: -2.7s; }
        @keyframes mondrian-pulse { 
          0% { opacity: 0.7; } 
          100% { opacity: 1; } 
        }
      </style>
      <rect class="m-block" x="0" y="0" width="80" height="80" fill="${accent}" opacity="0.9"/>
      <rect class="m-block" x="85" y="0" width="115" height="30" fill="none" stroke="currentColor" stroke-width="2" opacity="0.3"/>
      <rect class="m-block" x="85" y="35" width="50" height="45" fill="white" opacity="0.08"/>
      <rect class="m-block" x="0" y="85" width="200" height="2" fill="currentColor" opacity="0.2"/>
      <rect class="m-block" x="80" y="0" width="2" height="200" fill="currentColor" opacity="0.2"/>
      <rect class="m-block" x="0" y="85" width="45" height="115" fill="${accent}" opacity="0.15"/>
    </svg>`,

  rothko: (accent: string) => `
    <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <filter id="rothko-blur">
          <feGaussianBlur stdDeviation="8"/>
        </filter>
      </defs>
      <style>
        .r-field { animation: rothko-breathe 6s ease-in-out infinite alternate; }
        .r-field-2 { animation: rothko-breathe 8s ease-in-out infinite alternate-reverse; }
        @keyframes rothko-breathe {
          0% { transform: scaleY(1); opacity: 0.6; }
          100% { transform: scaleY(1.05); opacity: 0.9; }
        }
      </style>
      <rect x="0" y="0" width="200" height="200" fill="${accent}" opacity="0.05"/>
      <rect class="r-field" x="10" y="20" width="180" height="70" fill="${accent}" 
            filter="url(#rothko-blur)" opacity="0.4" rx="4"/>
      <rect class="r-field-2" x="10" y="110" width="180" height="70" fill="${accent}" 
            filter="url(#rothko-blur)" opacity="0.25" rx="4"/>
    </svg>`,

  kandinsky: (accent: string) => `
    <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
      <style>
        .k-circle { animation: kandinsky-rotate 12s linear infinite; transform-origin: 100px 100px; }
        .k-arc { animation: kandinsky-rotate 20s linear infinite reverse; transform-origin: 100px 100px; }
        @keyframes kandinsky-rotate { to { transform: rotate(360deg); } }
      </style>
      <circle class="k-circle" cx="100" cy="100" r="80" fill="none" stroke="${accent}" stroke-width="1.5" opacity="0.3"/>
      <circle cx="100" cy="100" r="55" fill="none" stroke="currentColor" stroke-width="1" opacity="0.15"/>
      <circle cx="100" cy="100" r="30" fill="${accent}" opacity="0.12"/>
      <path class="k-arc" d="M 100 20 A 80 80 0 0 1 180 100" fill="none" stroke="${accent}" stroke-width="3" opacity="0.5"/>
      <circle cx="100" cy="100" r="8" fill="${accent}" opacity="0.7"/>
    </svg>`,

  vasarely: (accent: string) => `
    <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
      <style>
        .v-sq { animation: vasarely-pulse 3s ease-in-out infinite; }
        .v-sq:nth-child(odd) { animation-direction: alternate; }
        .v-sq:nth-child(even) { animation-direction: alternate-reverse; }
        @keyframes vasarely-pulse { 
          0% { transform: scale(0.95); } 
          100% { transform: scale(1.05); } 
        }
      </style>
      ${Array.from({length: 16}, (_, i) => {
        const x = (i % 4) * 50 + 10
        const y = Math.floor(i / 4) * 50 + 10
        const size = 15 + (i % 3) * 8
        const opacity = 0.05 + (i % 4) * 0.05
        return `<rect class="v-sq" x="${x}" y="${y}" width="${size}" height="${size}" 
                      fill="${accent}" opacity="${opacity}" rx="2"
                      style="transform-origin: ${x + size/2}px ${y + size/2}px; animation-delay: ${i * 0.2}s"/>`
      }).join('')}
    </svg>`,

  bridget_riley: (accent: string) => `
    <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
      <style>
        .br-wave { animation: riley-wave 4s ease-in-out infinite; }
        @keyframes riley-wave {
          0%, 100% { d: path("M 0 100 Q 50 80 100 100 Q 150 120 200 100"); }
          50% { d: path("M 0 100 Q 50 120 100 100 Q 150 80 200 100"); }
        }
      </style>
      ${Array.from({length: 10}, (_, i) => {
        const y = i * 22
        const opacity = 0.06 + (i % 3) * 0.03
        return `<path class="br-wave" 
                     d="M 0 ${y} Q 50 ${y - 12} 100 ${y} Q 150 ${y + 12} 200 ${y}"
                     fill="none" stroke="${accent}" stroke-width="1.5" opacity="${opacity}"
                     style="animation-delay: ${i * 0.15}s"/>`
      }).join('')}
    </svg>`,

  malevich: (accent: string) => `
    <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
      <style>
        .mal-shape { animation: malevich-float 8s ease-in-out infinite; }
        .mal-shape:nth-child(2) { animation-delay: -3s; animation-duration: 11s; }
        .mal-shape:nth-child(3) { animation-delay: -5s; animation-duration: 9s; }
        @keyframes malevich-float {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          33% { transform: translateY(-8px) rotate(2deg); }
          66% { transform: translateY(4px) rotate(-1deg); }
        }
      </style>
      <rect class="mal-shape" x="30" y="40" width="60" height="60" fill="${accent}" opacity="0.5" 
            style="transform-origin: 60px 70px"/>
      <rect class="mal-shape" x="110" y="60" width="40" height="40" fill="none" 
            stroke="${accent}" stroke-width="2" opacity="0.6"
            style="transform-origin: 130px 80px"/>
      <circle class="mal-shape" cx="80" cy="150" r="25" fill="${accent}" opacity="0.15"
              style="transform-origin: 80px 150px"/>
    </svg>`,

  escher: (accent: string) => `
    <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <pattern id="escher-tile" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
          <polygon points="20,5 35,35 5,35" fill="${accent}" opacity="0.12"/>
          <polygon points="20,35 35,5 5,5" fill="${accent}" opacity="0.06"/>
        </pattern>
        <animateTransform attributeName="patternTransform" type="translate" 
                          from="0 0" to="40 0" dur="8s" repeatCount="indefinite"/>
      </defs>
      <rect width="200" height="200" fill="url(#escher-tile)"/>
    </svg>`,

  pollock: (accent: string) => `
    <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
      <style>
        .pol-line { stroke-dasharray: 1000; stroke-dashoffset: 1000; 
                    animation: pollock-draw 6s ease-in-out infinite; }
        .pol-line:nth-child(2) { animation-delay: -2s; stroke-dashoffset: 800; }
        .pol-line:nth-child(3) { animation-delay: -4s; stroke-dashoffset: 600; }
        @keyframes pollock-draw {
          0% { stroke-dashoffset: 1000; opacity: 0; }
          30% { opacity: 1; }
          70% { stroke-dashoffset: 0; opacity: 0.8; }
          100% { stroke-dashoffset: -200; opacity: 0; }
        }
      </style>
      <path class="pol-line" d="M 10 80 C 40 40 80 120 120 60 C 160 0 190 90 180 140" 
            fill="none" stroke="${accent}" stroke-width="1.5" opacity="0.5"/>
      <path class="pol-line" d="M 0 150 C 50 100 90 180 150 120 C 180 90 200 160 190 180"
            fill="none" stroke="${accent}" stroke-width="1" opacity="0.3"/>
      <path class="pol-line" d="M 30 10 C 70 50 100 20 140 70 C 170 110 180 40 200 80"
            fill="none" stroke="${accent}" stroke-width="2" opacity="0.2"/>
    </svg>`,

  klee: (accent: string) => `
    <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
      <style>
        .klee-cell { animation: klee-shift 5s ease-in-out infinite alternate; }
        @keyframes klee-shift { 0% { opacity: 0.5; } 100% { opacity: 1; } }
      </style>
      ${Array.from({length: 25}, (_, i) => {
        const col = i % 5, row = Math.floor(i / 5)
        const w = 30 + (i % 3) * 10, h = 30 + (i % 4) * 5
        const opacity = 0.04 + (i % 5) * 0.025
        return `<rect class="klee-cell" x="${col * 40 + 5}" y="${row * 40 + 5}" 
                      width="${w}" height="${h}" fill="${accent}" opacity="${opacity}" rx="1"
                      style="animation-delay: ${i * 0.1}s"/>`
      }).join('')}
    </svg>`,

  albers: (accent: string) => `
    <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
      <style>
        .alb-sq { animation: albers-pulse 5s ease-in-out infinite alternate; }
        .alb-sq:nth-child(2) { animation-delay: -1s; }
        .alb-sq:nth-child(3) { animation-delay: -2s; }
        .alb-sq:nth-child(4) { animation-delay: -3s; }
        @keyframes albers-pulse { 0% { opacity: 0.6; } 100% { opacity: 1; } }
      </style>
      <rect class="alb-sq" x="20" y="20" width="160" height="160" fill="${accent}" opacity="0.08" rx="2"/>
      <rect class="alb-sq" x="40" y="40" width="120" height="120" fill="${accent}" opacity="0.10" rx="2"/>
      <rect class="alb-sq" x="60" y="60" width="80" height="80" fill="${accent}" opacity="0.14" rx="2"/>
      <rect class="alb-sq" x="80" y="80" width="40" height="40" fill="${accent}" opacity="0.20" rx="2"/>
    </svg>`
}
```

#### Como usar nos cards:
```tsx
// Dentro do ProjectCard component
<div className="project-card-art" aria-hidden="true">
  <div 
    className="art-pattern-container"
    dangerouslySetInnerHTML={{ 
      __html: patterns[artStyle](accentColor) 
    }}
  />
</div>

// CSS correspondente
.project-card-art {
  position: absolute;
  top: 0; right: 0;
  width: 100px; height: 100px;
  overflow: hidden;
  border-radius: 0 8px 0 0;
  opacity: 0.18;
  pointer-events: none;
  mask-image: radial-gradient(ellipse at top right, black 40%, transparent 80%);
  transition: opacity 0.3s ease;
}

.project-card:hover .project-card-art {
  opacity: 0.28;
}
```

#### Uso no Project Header (tela do projeto aberto):
```tsx
// Header do projeto — banner completo com padrão
<div className="project-header-art" aria-hidden="true" style={{ accentColor }}>
  {/* Padrão vai na direita/fundo do header com opacity ~0.12 */}
  {/* Accent color aparece na borda esquerda: 3px solid var(--project-accent) */}
</div>
```

---

## PARTE 4 — NAVIGATION E INFORMATION ARCHITECTURE

Baseado na análise de Notion + Linear + Obsidian, implemente:

### 4.1 Sidebar Refinada
```
┌─────────────────────────────┐
│ P  Pelimotion      ⌄        │  ← workspace switcher
├─────────────────────────────┤
│ 🔍 Buscar...       ⌘K       │
├─────────────────────────────┤
│ SISTEMA                     │
│ ▦  Projects Hub             │  ← ativo: bg highlight + borda esquerda accent
│ 📅 Timeline    EM BREVE     │
│ 🗂️ Asset Library EM BREVE   │
├─────────────────────────────┤
│ PROJETOS          +         │  ← + abre CreateProjectModal
│                             │
│ 🎬 MAZ - Amazonia     ...   │  ← ... aparece no hover
│ 📄 teste social media  ...  │
│                             │
│                             │
├─────────────────────────────┤
│ [c] conceicao.felipe  ⚙️    │  ← settings
└─────────────────────────────┘
```

### 4.2 Tab Bar do Projeto (Linear-style)
A tab bar do projeto deve ter tabs bem definidas com estados ativos claros:
```
Dashboard  | Pipeline ← (underline accent color) | Calendar | Notes | Assets | Activity
```
- Tab ativa: `border-bottom: 2px solid var(--project-accent)`, cor do texto sobe para branco
- Tab hover: texto 80% opacidade
- Badge numérico nas tabs com conteúdo (ex: "Notes (3)")

### 4.3 Breadcrumb Contextual
Quando dentro de uma cena, mostrar:
```
Projects Hub  ›  MAZ - Amazonia Imersiva  ›  CENA 08
```
Todos os níveis clicáveis para navegação.

---

## PARTE 5 — COMPONENTES DE ESTADO VAZIO E LOADING

Implemente estados elegantes para:

### 5.1 Empty State (coluna Kanban sem cards)
```tsx
// Minimalista, não distrativo
<div className="kanban-empty">
  <div className="empty-icon">···</div>
  <p>Nenhuma cena aqui</p>
  <button>+ Nova cena</button>
</div>
```

### 5.2 Skeleton Loading
Cards esqueleto com shimmer animation enquanto dados carregam:
```css
@keyframes shimmer {
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
}
.skeleton {
  background: linear-gradient(90deg, 
    var(--surface-2) 25%, 
    var(--surface-3) 50%, 
    var(--surface-2) 75%
  );
  background-size: 200% 100%;
  animation: shimmer 1.5s ease-in-out infinite;
}
```

### 5.3 Toast Notifications
Ao salvar, mover cena, adicionar membro — feedback via toast no canto inferior direito:
- Sucesso: borda verde + ícone ✓
- Erro: borda vermelha + ícone ⚠
- Duração: 3 segundos, dismissível com X
- Stack: máximo 3 toasts simultâneos

---

## PARTE 6 — ACESSIBILIDADE (WCAG AA mínimo)

Implemente sem exceção:
- **Contraste**: texto principal ≥ 4.5:1, texto secundário ≥ 3:1
- **Focus rings**: `outline: 2px solid var(--project-accent); outline-offset: 2px` em todos elementos interativos
- **ARIA labels**: três-pontos = `aria-label="Opções de [nome do item]"`, status badges = `aria-label="Status: [nome do status]"`
- **Keyboard navigation**: Tab navega por cards, Enter abre, Escape fecha modais
- **Reduced motion**: `@media (prefers-reduced-motion: reduce)` desativa animações de patterns e mantém apenas transitions de opacidade ≤ 200ms

---

## PARTE 7 — REGRAS DE NÃO-REGRESSÃO

**NUNCA altere:**
- A estrutura de dados Supabase (`pages`, `pages_properties`, `project_members`)
- A lógica de `usePageStore` e navegação Hub → Projeto → Cena
- A integração Google Drive no Assets Panel
- O sistema de permissões RLS do PostgreSQL
- A lógica de `databaseFactory` para criação de projetos
- O sistema `dnd-kit` já implementado

**SEMPRE preserve:**
- Toda funcionalidade de CRUD existente
- Todos os filtros e propriedades customizadas
- O sistema de convite e gerenciamento de membros
- Os links dinâmicos de assets

---

## PARTE 8 — ORDEM DE IMPLEMENTAÇÃO (prioridade)

Execute nesta sequência para impacto máximo com menor risco:

1. **[CRÍTICO]** Adicionar three-dot menus em TODOS os cards (Project Card + Scene Card)
2. **[CRÍTICO]** Corrigir tokens CSS / design system (superfícies, bordas, tipografia)
3. **[ALTO]** Implementar `ArtPatternEngine` e `ProjectArtPattern` component
4. **[ALTO]** Refinar sidebar com estados de hover, ativo e three-dot por projeto
5. **[MÉDIO]** Implementar skeleton loading e estados vazios
6. **[MÉDIO]** Adicionar breadcrumb contextual
7. **[MÉDIO]** Refinamento da tab bar do projeto
8. **[BAIXO]** Sistema de toast notifications
9. **[BAIXO]** Bento grid opcional no Projects Hub

---

## PARTE 9 — ENTREGÁVEIS ESPERADOS

Para cada componente modificado, forneça:
1. **Código completo do componente** (TypeScript + React + Tailwind)
2. **CSS/Tokens** adicionais necessários
3. **Notas de integração** — como conectar ao store/Supabase existente sem quebrar
4. **Antes/Depois** — descrição textual da mudança visual

Ao implementar o `ArtPatternEngine`:
- Arquivo `artPatternEngine.ts` completo com todos os 10 estilos
- Componente `ProjectArtPattern.tsx` com todas as props e variantes
- CSS do `.project-card-art` e `.project-header-art`
- Função de hash determinístico testada

---

## CHECKLIST FINAL DE VERIFICAÇÃO

Antes de entregar qualquer implementação, confirme:

- [ ] Todo card tem three-dot menu funcional com ações relevantes
- [ ] Nenhum gradiente procedural antigo permanece no código
- [ ] Todos os 10 estilos de `ArtPatternEngine` estão implementados
- [ ] CSS tokens estão definidos e sendo usados consistentemente
- [ ] `@media (prefers-reduced-motion)` implementado
- [ ] Todos elementos interativos têm `aria-label`
- [ ] Nenhuma funcionalidade existente foi quebrada
- [ ] Skeleton loading em todos os estados de carregamento
- [ ] Focus rings visíveis em todos elementos focáveis
- [ ] Toast system funcionando para operações CRUD principais

---

*Este prompt foi gerado com base na análise do sistema Pelimotion OS, pesquisa de tendências UI/UX 2025/2026 (Notion, Linear, Obsidian, ClickUp) e melhores práticas de design para ferramentas SaaS de criação em Dark Mode.*

*Versão: 1.0 — Maio 2026*
