# GIGANTERA — Portfólio de Arte Digital, Físicas Subaquáticas & Brutalismo Experimental
> **Plataforma Subaquática de Exposição Curatorial** | Subprojeto de `www.pelimotion.art/gigantera`

---

## 🌊 Visão Geral do Projeto

**Gigantera** é uma experiência imersiva de arte digital que reimagina a navegação de um portfólio como um mergulho contínuo através de uma **coluna estratigráfica oceânica (de 0m a 4000m de profundidade)**.

A plataforma funde computação gráfica tridimensional em tempo real, física de partículas granulares, síntese sonora cimática e uma identidade visual inspirada no **Brutalismo Artístico Moderno e Experimental**.

```
    0000m ── [01 // SUPERFÍCIE] ── Estrato Epipelágico (Fótica, Refração, Prata)
    0400m ── [02 // PENUMBRA]   ── Estrato Mesopelágico (Disfótica, Bioluminescência)
    3000m ── [03 // ABISMO]     ── Estrato Batipelágico (Afótica, Litificação, Sedimento)
```

---

## 🏛️ Os 4 Pilares Físicos

1. **Cáusticas WebGL (OGL)**: Shader procedural de refração solar cáustica na camada superior aquática (`caustics.frag`).
2. **Cimática Sonora (Tone.js + Chladni)**: Síntese acústica com frequências ressonantes autorais (432Hz a 864Hz) simulando dispersão sonora sob alta pressão hidrostática.
3. **Hidrodinâmica Fluida (Lenis + Three.js)**: Navegação espacial tridimensional suave com inércia fluida, desaceleração viscosa e amortecimento físico.
4. **Erosão Física & Fraunces Dinâmica (GSAP + Canvas 2D)**: Ao inspecionar uma obra, o sedimento dissolve a imagem em fatias procedurais de ruído enquanto os eixos variáveis da fonte **Fraunces** (`opsz`, `wght`, `SOFT`, `WONK`) sofrem modulação tipográfica em tempo real.

---

## 📐 Identidade Visual: Brutalismo Artístico & Grafismos

O design rejeita soluções genéricas (como botões arredondados ou cartões clichês) em favor de uma estética monumental, técnica e de arquivo de pesquisa:

| Elemento | Implementação | Arquivo Fonte |
| :--- | :--- | :--- |
| **Headlines Monumentais** | Fonte **`Syne` (800 Extra-Bold)** com tracking comprimido (`-0.03em`) e presença escultural contemporânea. | `src/index.css`, `tokens.ts` |
| **Telemetria Tabular** | Fonte **`Space Mono` (400 e 700)** em numerais tabulares com zeros à esquerda (`0421 M`) e notação bracketed (`[STRATUM // 01]`). | `src/tokens.ts`, `FloatingHUD.tsx` |
| **Grafismos de Viewport** | Quatro cantoneiras nos cantos da tela (`┌ ┐ └ ┘`) com latitude, longitude, FPS e índice deposicional. | `src/components/ui/ViewportReticles.tsx` |
| **Régua Batimétrica Vertical** | Eixo milimétrico na margem direita (`0000M` a `4000M`) com nós clicáveis e agulha dinâmica `[⌖ 0421M]`. | `src/components/ui/DepthRuler.tsx` |
| **Console Modular (HUD)** | Painel inferior com cantoneiras em cruz (`+`), seletor segmentado com hover invertido e botões táteis de sensores. | `src/components/ui/FloatingHUD.tsx` |
| **Dossier de Espécime** | Modal em formato de ficha técnica de laboratório com tabela de física, cronologia e suporte. | `src/components/canvas/ErosionModal.tsx` |
| **Monólitos 3D Wireframe** | Molduras monolíticas de vidro/titânio no Three.js contornadas por arestas arquiteturais de traço fino dourado. | `src/components/canvas/OceanicScene3D.tsx` |

---

## 🏜️ Física de Areia & Sedimento nos Cantos (`sandEngine.ts`)

- **2.000 partículas granulares** simuladas a 60 FPS com integração de Euler.
- **Sedimentação nos Cantos**: A areia se acumula organicamente no canto inferior esquerdo e direito da tela.
- **Avalanches Inerciais**: A rolagem da tela ou rotação da câmera injeta velocidade angular nas partículas, fazendo dunas escorrerem realisticamente.

---

## 📂 Estrutura de Arquivos do Subprojeto

```
gigantera/
├── index.html                   ← HTML de produção servido pelo Vercel
├── index.source.html            ← Template fonte para o Vite
├── package.json                 ← Dependências e scripts de build
├── tsconfig.json                ← Configuração do TypeScript
├── vite.config.ts               ← Configuração de build e plugins (GLSL, React)
├── works/                       ← Acervo de imagens reais das obras (Pipeline Gigantera)
│   ├── espinhaco-cinetica-prata.jpg
│   ├── espinhaco-vitrine-aquario.jpg
│   ├── espinhaco-descida-crepuscular.jpg
│   ├── zimbro-rastreamento-vetorial.jpg
│   ├── espinhaco-relevo-neotribal.jpg
│   ├── zimbro-estudo-espectral.jpg
│   ├── espinhaco-registro-abissal.jpg
│   ├── sedimento-litificacao-final.jpg
│   └── notalgia-monolito-costeiro.jpg
├── assets/                      ← Bundles compilados JS e CSS de produção
└── src/
    ├── App.tsx                  ← Orquestrador principal da cena e interfaces
    ├── main.tsx                 ← Ponto de entrada React
    ├── index.css                ← Sistema de estilos brutalista e tokens CSS
    ├── tokens.ts                ← Fonte única de verdade de design tokens
    ├── types/
    │   └── art.ts               ← Tipagens de obras e estratos
    ├── data/
    │   └── artworks.ts          ← Catálogo oficial das obras e séries
    ├── core/
    │   ├── store.ts             ← Estado global Zustand (câmera, áudio, estratos)
    │   ├── audioEngine.ts       ← Motor Tone.js de áudio subaquático
    │   ├── tideService.ts       ← Cálculo astronômico de fases lunares e marés
    │   └── physics/
    │       └── sandEngine.ts    ← Motor de partículas de areia e dunas
    ├── components/
    │   ├── canvas/
    │   │   ├── OceanicScene3D.tsx    ← Espaço 3D Three.js, luz, pedestais e monólitos
    │   │   ├── SandPhysicsOverlay.tsx← Canvas 2D de renderização das partículas
    │   │   ├── CausticCanvas.tsx     ← Shader WebGL de cáusticas
    │   │   └── ErosionModal.tsx      ← Dossier brutalista e erosão física GSAP
    │   ├── layout/
    │   │   ├── Header.tsx            ← Cabeçalho com dados de maré e botões de motor
    │   │   ├── SemanticMap.tsx       ← Mapa acessível para leitor de tela
    │   │   └── CurrentDrift.tsx      ← Correnteza horizontal táctil
    │   └── ui/
    │       ├── FloatingHUD.tsx       ← Console flutuante brutalista
    │       ├── DepthRuler.tsx        ← Régua batimétrica vertical
    │       └── ViewportReticles.tsx  ← Cantoneiras e retículos de enquadramento
    └── shaders/
        ├── caustics.frag
        └── caustics.vert
```

---

## 🛠️ Guia de Manutenção & Atualizações Futuras

### 1. Como rodar localmente para desenvolvimento
```bash
cd gigantera
npm install       # apenas se adicionou novas dependências
npm run dev       # inicia o servidor Vite em http://localhost:5173/gigantera/
```

### 2. Como compilar para produção
O script de build compila o TypeScript, gera o bundle Vite e copia automaticamente o `index.source.html` processado para `gigantera/index.html` e os assets para `gigantera/assets/`:
```bash
cd gigantera
npm run build
```
> **Nota de Higiene**: Ao gerar novos bundles, apague os arquivos `.js` e `.css` com hash antigo em `gigantera/assets/` para manter o git limpo.

### 3. Como adicionar ou substituir obras de arte
1. **Origem**: O pipeline do artista reside em `/Volumes/PLM_SSD_01/Google Drive/Pelimotion/Pipeline SSD 01/Gigantera/Pipeline Gigantera/`.
2. **Adicionar imagem**: Salve a imagem otimizada em `gigantera/works/nome-da-obra.jpg` (recomenda-se JPG ou WebP, resolução ~1400x1750, proporção 4:5).
3. **Registrar no catálogo**: Abra [`gigantera/src/data/artworks.ts`](src/data/artworks.ts) e adicione/edite a entrada no array `artworks` do estrato correspondente:
   ```ts
   {
     id: 'novo-especime',
     title: 'Título da Obra',
     series: 'Série Artística',
     stratum: 'mesopelagic', // 'epipelagic' | 'mesopelagic' | 'bathypelagic'
     year: 2026,
     materials: 'Técnica e Materiais',
     description: 'Descrição curatorial e física da peça...',
     depthMeters: 650,
     imageSrc: '/gigantera/works/nome-da-obra.jpg',
     imageAlt: 'Texto alternativo para acessibilidade',
     aspectRatio: '4 / 5'
   }
   ```
4. Execute `npm run build` para consolidar o build de produção.

### 4. Como adicionar novos estratos oceânicos
1. Em [`src/types/art.ts`](src/types/art.ts), adicione a nova zona ao union type `StratumId` (ex: `'hadalpelagic'`).
2. Em [`src/data/artworks.ts`](src/data/artworks.ts), adicione a configuração do estrato no `STRATA_CATALOG`.
3. Em [`src/components/ui/DepthRuler.tsx`](src/components/ui/DepthRuler.tsx), adicione a marca de profundidade no array `rulerTicks`.
4. Em [`src/components/canvas/OceanicScene3D.tsx`](src/components/canvas/OceanicScene3D.tsx), ajuste a altura `spatialCoordinates` dos pedestais 3D.

---

## 🚀 Deploy & Operação Online

- **URL de Produção:** `https://www.pelimotion.art/gigantera`
- **Mecanismo de Deploy:** O repositório está vinculado à Vercel. Qualquer `git push origin main` aciona o deploy instantâneo.
- **Roteamento Vercel (`vercel.json`):**
  ```json
  {
    "redirects": [
      { "source": "/gigantera", "destination": "/gigantera/", "permanent": true }
    ],
    "rewrites": [
      { "source": "/gigantera", "destination": "/gigantera/index.html" },
      { "source": "/gigantera/", "destination": "/gigantera/index.html" }
    ]
  }
  ```
- **Integridade da Raiz:** `/gigantera` é totalmente autocontido. A raiz de Pelimotion (`www.pelimotion.art/`) e suas rotas continuam operando de forma 100% estática e imutável.
