# GIGANTERA — Galeria Digital Brutalista, Game 3D & Acervo Espacial
> **Pavilhão Tridimensional Contemporâneo de Exposição Curatorial** | Subprojeto de `www.pelimotion.art/gigantera`

---

## 🏛️ Visão Geral do Projeto

**Gigantera** é uma experiência imersiva de arte digital que reimagina a navegação de um portfólio como a exploração física em primeira pessoa de um **pavilhão arquitetural brutalista monumental**.

O visitante flutua ("nada") no espaço tridimensional entre vitrines flutuantes de vidro acrílico que guardam impressões em papel mate de algodão, experimentando iluminação realista com sombras suaves, vigas estruturais com claraboias de onde emanam feixes de luz volumétrica (*god rays*), uma estação de áudio tátil na entrada e controles em primeira pessoa inspirados na era clássica de jogos PS1/PS2.

```
       [ENTRADA Z: +20M] ── Estação do CD Jewel Case 3D (Álbum Autoral em POV)
       [SETOR 01 Z: +10M] ── STILL (Imagens & Esculturas em Papel Mate Suspenso)
       [SETOR 02 Z: -22M] ── VÍDEO (Cinética & Motion Textures em Loop Real)
       [SETOR 03 Z: -75M] ── MONUMENTO FINAL & ACERVO COMPLETO
```

---

## 🎮 Mecânicas de Game 3D & POV (Estética PS1 / PS2)

### 1. Mão 3D Low-Poly Facetada & CD Jewel Case em POV (Fiel à Referência)
- **Mão 3D Facetada em Primeira Pessoa:** Construída proceduralmente com sombreamento *flat* (`flatShading: true`), reproduzindo exatamente as facetas poligonais de gesso/cerâmica angular segurando a quina do estojo de acrílico.
- **Contracapa Dinâmica em Alta Resolução:** Tipografia pixel/mono em Canvas 1024x1024 contendo o título `BACK COVER`, lista das 17 faixas autorais numeradas com BPM, o selo Compact Disc e o **código de barras autêntico** no canto inferior direito.
- **Giro Físico de 180° (`[F]`):** Rotação suave do estojo no espaço 3D alternando entre a contracapa com as faixas e a capa frontal com arte impressa de Pelimotion.
- **Áudio Ultraleve:** Play instantâneo de previews leves de 10s ao trocar de faixa com upgrade transparente para a versão full de 48kHz após 4s de escuta contínua.
- **Balanço e Inércia Física:** *Idle breathing bob* e inércia do mouse acompanhando os movimentos do jogador.

### 2. Controles de Game FPS & Física Tátil
- **Teclas:** `W`, `A`, `S`, `D` e Setas direcionais para caminhar pelo salão, `Shift` para correr.
- **Mouse Look & Arraste:** Rotação horizontal e inclinação vertical suavemente amortecidas com limites de pitch para explorar as paredes de concreto e claraboias.
- **Head Bobbing & Passos:** Balanço de cabeça ao caminhar e som sutil de passos no concreto sintetizado proceduralmente via Web Audio API.
- **Interação Contextual (`[E]`):**
  - No pedestal de entrada: pega o CD na mão / guarda de volta.
  - Perto de uma vitrine: transpasse a barreira de vidro para o Modo Cinema.

### 3. Vitrines de Vidro Flutuantes & Transição para o Modo Cinema
- Vitrines translúcidas em `MeshPhysicalMaterial` com transmissão de 92%, suspensas sem cubos amarelos e sem pedestais pesados.
- Ao pressionar `[E]` ou avançar contra a vitrine, a câmera transpasse o vidro com efeito sonoro harmônico; a iluminação da galeria se apaga suavemente e um **holofote volumétrico focado** ilumina a obra de arte no Modo Cinema, com metadados essenciais e proteções *feathered* suaves.

### 4. Modo Loupe & Prancheta Multi-Folha
- **Modo Loupe (`[R]` ou Botão na Barra Superior):** Ampliação óptica de 2.8x com navegação por arrasto do cursor e telemetria de coordenadas de inspeção, sem necessidade da tecla ESC para sair (fechamento por clique fora ou botão `[VOLTAR AO SALÃO]`).
- **Prancheta de Estudos Multi-Folha:** Obras Still que contêm pranchetas de ateliê (como Zimbro e Espinhaço) possuem navegação em leque folheando entre pranchetas e estudos técnicos preparatórios com animação fluida.

### 5. Experiência Mobile Espacial Adaptativa
- **Navegação Táctil por Stepper Glide:** Botões inferiores flutuantes `[◀ ANTERIOR]` e `[PRÓXIMA ▶]` realizam interpolação suave da câmera (glide lerp) até o ponto ideal de contemplação de cada vitrine.
- **Modo Giroscópio:** Opção de controle imersivo orientando a visão 3D através da inclinação física do smartphone (`DeviceOrientationEvent`).
- **HUD Compacto:** Interface adaptada para telas verticais com tipografia proporcional e gavetas de controle retráteis.

### 6. Sistema Acústico & Partículas de Distorção de Ar
- **Acoustic Heat Haze:** Anéis de distorção de calor e vibração que emanam fisicamente das caixas de som no salão, sincronizados com os picos de energia de sub-graves da Web Audio API.
- **Crossfade Suave:** Ao entrar no Modo Cinema para assistir a uma obra cinética em vídeo, a música ambiente da galeria realiza um fade exponencial imperceptível em vez de um corte abrupto.

### 7. Acervo 3D In-Scene & Matriz Frontal 4x2 (`[TAB]`)
- **Pavilhão 3D Contínuo:** Ao abrir o Acervo via `[TAB]` ou menu, a experiência não sai da cena 3D nem aplica filtros escuras/desfocadas. O pavilhão mantém sua iluminação e reflexos em tempo real.
- **Coreografia Espacial:** As 8 vitrines do pavilhão interpolam suavemente do corredor para uma matriz frontal de 4 colunas × 2 linhas em `z = 0` com reflexos espelhados no chão de vidro (`floorReflector`).
- **Desativação de Mira & Cursor Livre:** O pointer lock e o retículo são desativados temporariamente; o visitante navega livremente com o cursor do mouse sem precisar andar nem mirar.
- **Raycasting Tátil & Abertura Direta:** Passar o cursor sobre as vitrines provoca elevação tridimensional tátil (`z += 0.35m`), escala (`1.03x`) e SFX de tick. Um clique direto abre o modo `CinemaView`.
- **Portfólio Artístico Completo:** Barra de filtros brutalistas (`TODAS AS OBRAS [26]`, `STILL [6]`, `VÍDEO [3]`, `SOM [17]`), gaveta musical para as 17 faixas autorais e botões de portfólio (`[BIO / ARTISTA]`, `[MEDIA KIT]`, `[SALA 3D (TAB)]`).

### 8. Dualidade de Temas
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
- **Streaming Instantâneo (HTTP 206):** Suporte nativo a *Byte-Range Requests* que inicia o áudio em milissegundos sem download prévio.
- **Deploy Blindado:** Nenhum arquivo pesado é comitado ou transferido no build da Vercel.

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
└── src/
    ├── App.tsx                  ← Orquestrador principal da cena e interfaces
    ├── main.tsx                 ← Ponto de entrada React
    ├── index.css                ← Design brutalista, proteções feathered e HUD
    ├── tokens.ts                ← Design tokens Dark & Light
    ├── types/
    │   └── art.ts               ← Tipagens de obras e faixas de áudio
    ├── data/
    │   └── artworks.ts          ← Catálogo oficial das obras e 17 faixas autorais na CDN
    ├── core/
    │   ├── store.ts             ← Estado global Zustand (física, câmera, CD, cinema, loupe)
    │   ├── playerController.ts  ← Motor de física FPS, giroscópio e stepper glide mobile
    │   └── soundEngine.ts       ← Web Audio API (previews, streaming CDN, FFT e haze)
    ├── components/
    │   ├── canvas/
    │   │   ├── GalleryScene3D.tsx    ← Salão 3D, luzes, vitrines, névoa e caixas com haze
    │   │   ├── CDViewmodel3D.ts      ← Viewmodel 3D em câmera com mão low-poly e CD
    │   │   └── AudioVisualizer.tsx   ← Espectrograma em tempo real
    │   ├── audio/
    │   │   └── CDJewelCasePOV.tsx    ← HUD tátil minimalista do álbum em POV
    │   ├── modal/
    │   │   ├── CinemaView.tsx        ← Modo cinema, loupe mode e prancheta multi-folha
    │   │   ├── ArtistBioModal.tsx    ← Declaração conceitual e contato direto
    │   │   └── ControlsGuideModal.tsx← Guia interativo gráfico de controles
    │   ├── layout/
    │   │   ├── GalleryHeader.tsx     ← Top bar minimalista com tema e qualidade gráfica
    │   │   ├── MinimalBottomBar.tsx  ← Bottom dock feathered com Z, setores e stepper mobile
    │   │   └── ArchiveIndex.tsx      ← Catálogo tradicional em grade
    │   └── ui/
    │       ├── IntroSequence.tsx     ← Intro com materialização em 4s
    │       └── MissionHUD.tsx        ← Bússola e telemetria de navegação
```

---

## ⚡ Comandos Úteis

```bash
# Iniciar ambiente de desenvolvimento
npm run dev

# Compilar para produção (Vercel)
npm run build
```

