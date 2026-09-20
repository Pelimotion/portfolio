# GIGANTERA — Galeria Digital Brutalista, Game 3D & Acervo Espacial
> **Pavilhão Tridimensional Contemporâneo de Exposição Curatorial** | Subprojeto de `www.pelimotion.art/gigantera`

---

## 🏛️ Visão Geral do Projeto

**Gigantera** é uma experiência imersiva de arte digital que reimagina a navegação de um portfólio como a exploração física em primeira pessoa de um **pavilhão arquitetural brutalista monumental**.

O visitante flutua ("nada") no espaço tridimensional entre vitrines flutuantes de vidro acrílico que guardam impressões em papel mate de algodão, experimentando iluminação realista com sombras suaves, vigas estruturais com claraboias de onde emanam feixes de luz volumétrica (*god rays*), uma estação de áudio tátil na entrada e controles em primeira pessoa inspirados na era clássica de jogos PS1/PS2.

```
       [ENTRADA Z: +20M] ── Estação do CD Jewel Case 3D (Álbum Autoral em POV)
       [ÁTRIO CENTRAL   ] ── TOTEM INTERATIVO: ESPINHAÇO (Âncora Central em Penumbra Cênica)
       [EXPOGRAFIA EM U ] ── Meia-lua concêntrica em torno do Espinhaço:
                             ├── ASA ESQUERDA: VÍDEOS (Cinética & Motion Textures em Loop Real)
                             └── ASA DIREITA:  STILL (Imagens & Esculturas em Papel Mate Suspenso)
       [SETOR POSTERIOR ] ── MONUMENTO FINAL & ACERVO COMPLETO
```

---

## 🏛️ Expografia Orgânica & Expansão Cenográfica

- **Disposição Polar em "U" (Meia-Lua):** Abandonando corredores retos lineares, o acervo de vitrines agora se distribui em um semicírculo concêntrico em torno da obra interativa central *Espinhaço*. O visitante pode contemplar tanto as obras periféricas quanto a silhueta da escultura central de múltiplos ângulos.
- **Iluminação em Penumbra & Contraste:** A zona do Espinhaço é mantida sob iluminação baixa e sombra cenográfica controlada (`penumbraBlocker`), permitindo que a luminescência orgânica e a nuvem de pontos da escultura se destaquem de forma intimista e imersiva.

---

## 🎮 Mecânicas de Game 3D & POV (Estética PS1 / PS2)

### 1. Totem Interativo 3D & Sistema Wake-on-Interaction (Espinhaço)
- **Escultura 3D Autêntica Integrada ao Pavilhão:** A obra interativa "Espinhaço" está ancorada no centro do átrio da galeria (`Z: 14.0m`) protegida por uma vitrine tridimensional de vidro museológico com transmissão física, cabos verticais de suspensão em grafite anodizado e iluminação ascendente suave.
- **Mecânica Wake-on-Interaction (Fóssil Vivente):**
  - **Estado Dormente:** Preservada inerte como um espécime fóssil de museu quando o visitante está distante.
  - **Despertar Sensorial:** Ao se aproximar a menos de 5.8m ou mirar o retículo diretamente na vitrine, a escultura acorda suavemente com onda cinética vertebral, orientação magnética em direção à câmera e aura de partículas voláteis.
  - **HUD Tático de Interação:** Retículo exibe `[E] / [CLIQUE] VIVENCIAR ESPINHAÇO`.
- **Experiência Interativa 360° Dedicada (`EspinhacoInteractive.tsx`):**
  - Ao inspecionar via `[E]` ou clique, a câmera transiciona para a experiência 360° de tela cheia.
  - **3 Modos de Visão com Keycaps Físicas:** `[1] MATÉRIA` (malha metálica PBR hiper-realista), `[2] CORPÚSCULOS` (nuvem de 50.000 pontos capturados) e `[3] RAIO-X` (ShaderMaterial customizado com scanlines verticais e glitch de vértices).
  - **4 Biomas Cromáticos (`[B]`):** `TITÂNIO` (grafite e ciano), `ABISSAL` (esmeralda oceânico), `MAGMA` (âmbar vulcânico) e `ESPECTRAL` (ultravioleta e magenta).
  - **Deformação Acentuada via Teclado (`W`, `A`, `S`, `D`):** Injeção direta no pipeline de shaders PBR via `onBeforeCompile`, permitindo torção axial e flexão elástica extrema da coluna em tempo real.
  - **HUD Unificada & Auto-Pan:** Miniplayer e fidelidade gráfica integrados no menu lateral recolhível (`[H]`); ao abrir ou fechar, a câmera compensa no eixo X mantendo a escultura perfeitamente centralizada.
  - **Áudio-Reatividade FFT & Choque Sísmico:** Deformação vertebral e pulsação luminosa em tempo real com a música; a tecla `Espaço` desencadeia uma onda de choque de partículas.

### 2. Mão 3D Low-Poly Facetada & CD Jewel Case em POV (Fiel à Referência)
- **Mão 3D Facetada em Primeira Pessoa:** Construída proceduralmente com sombreamento *flat* (`flatShading: true`), reproduzindo exatamente as facetas poligonais de gesso/cerâmica angular segurando a quina do estojo de acrílico.
- **Contracapa Dinâmica em Alta Resolução:** Tipografia pixel/mono em Canvas 1024x1024 contendo o título `BACK COVER`, lista das 17 faixas autorais numeradas com BPM, o selo Compact Disc e o **código de barras autêntico** no canto inferior direito.
- **Giro Físico de 180° (`[F]`):** Rotação suave do estojo no espaço 3D alternando entre a contracapa com as faixas e a capa frontal com arte impressa de Pelimotion.
- **Áudio Ultraleve:** Play instantâneo de previews leves de 10s ao trocar de faixa com upgrade transparente para a versão full de 48kHz após 4s de escuta contínua.
- **Balanço e Inércia Física:** *Idle breathing bob* e inércia do mouse acompanhando os movimentos do jogador.

### 3. Controles de Game FPS & Física Tátil
- **Teclas:** `W`, `A`, `S`, `D` e Setas direcionais para caminhar pelo salão, `Shift` para correr.
- **Mouse Look & Arraste:** Rotação horizontal e inclinação vertical suavemente amortecidas com limites de pitch para explorar as paredes de concreto e claraboias.
- **Head Bobbing & Passos:** Balanço de cabeça ao caminhar e som sutil de passos no concreto sintetizado proceduralmente via Web Audio API.
- **Interação Contextual (`[E]`):**
  - No pedestal de entrada: pega o CD na mão / guarda de volta.
  - No totem do Espinhaço: ingressa na vivência interativa 360°.
  - Perto de uma vitrine padrão: transpasse a barreira de vidro para o Modo Cinema.

### 4. Vitrines de Vidro Flutuantes & Transição para o Modo Cinema
- Vitrines translúcidas em `MeshPhysicalMaterial` com transmissão de 92%, suspensas sem cubos amarelos e sem pedestais pesados.
- Ao pressionar `[E]` ou avançar contra a vitrine, a câmera transpasse o vidro com efeito sonoro harmônico; a iluminação da galeria se apaga suavemente e um **holofote volumétrico focado** ilumina a obra de arte no Modo Cinema, com metadados essenciais e proteções *feathered* suaves.

### 5. Modo Loupe & Prancheta Multi-Folha
- **Modo Loupe (`[R]` ou Botão na Barra Superior):** Ampliação óptica de 2.8x com navegação por arrasto do cursor e telemetria de coordenadas de inspeção, sem necessidade da tecla ESC para sair (fechamento por clique fora ou botão `[VOLTAR AO SALÃO]`).
- **Prancheta de Estudos Multi-Folha:** Obras Still que contêm pranchetas de ateliê possuem navegação em leque folheando entre pranchetas e estudos técnicos preparatórios com animação fluida.

### 6. Experiência Mobile Espacial & Módulo WebAR (`/ar/`)
- **Navegação Táctil por Stepper Glide:** Botões inferiores flutuantes `[◀ ANTERIOR]` e `[PRÓXIMA ▶]` realizam interpolação suave da câmera (glide lerp) até o ponto ideal de contemplação de cada vitrine.
- **Modo Giroscópio:** Controle imersivo orientando a visão 3D através da inclinação física do smartphone (`DeviceOrientationEvent`).
- **WebAR Espacial (`/ar/`):** Módulo dedicado para dispositivos móveis projetando os 50.000 pontos do Espinhaço no espaço físico real através de tracking giroscópico com quatérnios, detector óptico centro-periferia e áudio-reatividade nativa.
- **Mobile Bottom Dock:** Docking responsivo com badges de categoria, incluindo o filtro `✦ INTERATIVO`.

### 7. Sistema Acústico, Panning Espacial & Master Limiter
- **Acoustic Heat Haze:** Anéis de distorção de calor e vibração que emanam fisicamente das caixas de som no salão, sincronizados com os picos de energia de sub-graves da Web Audio API.
- **Master Limiter / Compressor Dinâmico:** Integrado `DynamicsCompressorNode` na cadeia de áudio do `soundEngine.ts`, equalizando o volume entre as 17 faixas e os áudios das obras sem picos ou distorções.
- **Panning Binaural para Fones:** Resposta tátil ao balanço L/R via `StereoPannerNode` de acordo com a rotação da cabeça e orientação da visão do visitante no salão.
- **Gestão Inteligente de Trilha:** Obras com flag `hasAudio: false` mantêm a trilha sonora do CD tocando de fundo no Modo Cinema, pausando apenas quando a obra possui áudio próprio (ex: `p-tessitura`).
- **Atalho Mudo Global (`[M]`):** Silencia ou desmuta instantaneamente todas as fontes sonoras ativas sem abrir gavetas ou interfaces intrusivas.

### 8. Acervo 3D In-Scene & Matriz Frontal 4x2 (`[TAB]`)
- **Pavilhão 3D Contínuo:** Ao abrir o Acervo via `[TAB]` ou menu, a experiência não sai da cena 3D nem aplica filtros escuros/desfocados. O pavilhão mantém sua iluminação e reflexos em tempo real.
- **Coreografia Espacial:** As vitrines do pavilhão interpolam suavemente do corredor para uma matriz frontal de 4 colunas × 2 linhas em `z = 0` com reflexos espelhados no chão de vidro (`floorReflector`).
- **Desativação de Mira & Cursor Livre:** O pointer lock e o retículo são desativados temporariamente; o visitante navega livremente com o cursor do mouse sem precisar andar nem mirar.
- **Raycasting Tátil & Abertura Direta:** Passar o cursor sobre as vitrines provoca elevação tridimensional tátil (`z += 0.35m`), escala (`1.03x`) e SFX de tick. Um clique direto abre o modo `CinemaView`.
- **Filtros Brutalistas de Acervo:** Filtros dedicados `TODAS AS OBRAS`, `STILL`, `VÍDEO`, `✦ INTERATIVO` e `SOM [17]`.

### 9. Dualidade de Temas
- **Obsidiana (Dark Noir):** Salão escuro brutalista com concreto grafite, basalto polido e iluminação dourada de claraboias.
- **Alabastro (White Cube):** Galeria branca brutalista contemporânea em giz e concreto claro, mantendo a profundidade e sombras realistas.

---

## ☁️ Arquitetura de Mídia & Bunny.net CDN (Zero-Bandwidth)

Para garantir máxima velocidade de carregamento e conformidade absoluta com as cotas da Vercel:
- **100% dos arquivos de áudio, vídeo e texturas de arte são servidos pela Bunny.net CDN:**
  - `https://pelimotion-portfolio.b-cdn.net/gigantera/audio/full/` (17 faixas completas)
  - `https://pelimotion-portfolio.b-cdn.net/gigantera/audio/previews/` (17 previews)
  - `https://pelimotion-portfolio.b-cdn.net/gigantera/stills/` (Imagens de museu giclée)
  - `https://pelimotion-portfolio.b-cdn.net/gigantera/videos/` (Vitrines cinéticas)
- **Modelos 3D Locais de Alta Fidelidade:**
  - `public/models/espinhaco.glb` (12MB PBR Mesh binário de alta definição)
  - `public/models/espinhaco_points.bin` (586KB nuvem com 50.000 pontos espaciais calibrados)
- **Streaming Instantâneo (HTTP 206):** Suporte nativo a *Byte-Range Requests* que inicia o áudio em milissegundos sem download prévio.
- **Deploy Blindado:** Zero overhead de transferências excessivas no build da Vercel.

---

## 📂 Estrutura de Arquivos do Subprojeto

```
gigantera/
├── index.html                   ← HTML de produção servido pelo Vercel
├── index.source.html            ← Template fonte para o Vite
├── package.json                 ← Dependências e scripts de build
├── tsconfig.json                ← Configuração do TypeScript
├── vite.config.ts               ← Configuração do Vite com HMR e dev-rewrite
├── assets/                      ← Bundles compilados JS e CSS de produção
├── public/                      ← Assets estáticos e modelos 3D
│   └── models/
│       ├── espinhaco.glb        ← Modelo 3D autêntico PBR da escultura
│       └── espinhaco_points.bin ← Nuvem de 50.000 pontos espaciais
├── ar/                          ← Experiência WebAR mobile autônoma
│   └── index.html               ← Entry point do WebAR
└── src/
    ├── App.tsx                  ← Orquestrador principal da cena e interfaces
    ├── main.tsx                 ← Ponto de entrada React
    ├── index.css                ← Design brutalista, proteções feathered e HUD
    ├── tokens.ts                ← Design tokens Dark & Light
    ├── types/
    │   └── art.ts               ← Tipagens de obras ('still' | 'video' | 'interactive') e faixas
    ├── data/
    │   └── artworks.ts          ← Catálogo oficial das obras, totem interativo e 17 faixas
    ├── core/
    │   ├── store.ts             ← Estado global Zustand (física, câmera, CD, cinema, loupe)
    │   ├── playerController.ts  ← Motor de física FPS, giroscópio e stepper glide mobile
    │   ├── modularGallery.ts    ← Posições espaciais das vitrines e ancoragem do totem Espinhaço
    │   └── soundEngine.ts       ← Web Audio API (previews, streaming CDN, FFT e haze)
    ├── ar/                      ← Lógica do módulo WebAR
    │   ├── gyroTracking.ts      ← Rastreamento giroscópico com quatérnios
    │   ├── opticalDetector.ts   ← Detector óptico centro-periferia
    │   └── pointsLoader.ts      ← Loader da nuvem de pontos binária
    ├── components/
    │   ├── canvas/
    │   │   ├── GalleryScene3D.tsx    ← Salão 3D, vitrine totem Espinhaço, wake-on-interaction
    │   │   ├── CDViewmodel3D.ts      ← Viewmodel 3D em câmera com mão low-poly e CD
    │   │   └── AudioVisualizer.tsx   ← Espectrograma em tempo real
    │   ├── works/
    │   │   └── EspinhacoInteractive.tsx ← Experiência 360° interativa (3 modos, 4 biomas, FFT)
    │   ├── audio/
    │   │   └── CDJewelCasePOV.tsx    ← HUD tátil minimalista do álbum em POV
    │   ├── modal/
    │   │   ├── CinemaView.tsx        ← Modo cinema, loupe mode, prancheta e integração interativa
    │   │   ├── ArtistBioModal.tsx    ← Interface Fullscreen cinematográfica de Sobre & Contato [C]
    │   │   └── ControlsGuideModal.tsx← Guia interativo gráfico de controles
    │   ├── layout/
    │   │   ├── GalleryHeader.tsx     ← Top bar com atalho Sobre [C], tema e qualidade gráfica
    │   │   ├── MinimalBottomBar.tsx  ← Bottom dock feathered com Z, setores e stepper mobile
    │   │   ├── MobileBottomDock.tsx  ← Dock mobile responsivo com filtro ✦ INTERATIVO
    │   │   └── ArchiveIndex.tsx      ← Catálogo tradicional com filtro interativo
    │   └── ui/
    │       ├── IntroSequence.tsx     ← Intro com materialização em 4s
    │       └── MissionHUD.tsx        ← Bússola e telemetria de navegação
```

---

## ⚡ Comandos Úteis

```bash
# Iniciar ambiente de desenvolvimento
npm run dev

# Checagem de tipagem TypeScript
npx tsc --noEmit

# Compilar para produção (Vercel)
npm run build
```

