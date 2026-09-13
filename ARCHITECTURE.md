# ARQUITETURA TÉCNICA DO SISTEMA — PELIMOTION & GIGANTERA
> **Documento de Engenharia e Especificação Técnica Formal**  
> Destinado a Arquitetos de Software, Engenheiros Frontend Sênior e Especialistas em Computação Gráfica WebGL.

---

## 1. Visão Arquitetural Sistêmica

O ecossistema **Pelimotion** opera como uma arquitetura de múltiplos subprojetos orquestrada sob um único domínio (`pelimotion.art`), combinando entrega estática ultraleve na borda (Vercel) com entrega massiva de mídia em CDN dedicada (Bunny.net) e banco relacional em tempo real (Supabase).

```
                              [ INTERNET / CLIENTES ]
                                         │
                 ┌───────────────────────┴───────────────────────┐
                 │                                               │
     [ HTTP / SSL : pelimotion.art ]                 [ CDN : pelimotion-portfolio.b-cdn.net ]
                 │                                               │
        ┌────────┴────────┐                             ┌────────┴────────┐
        ▼                 ▼                             ▼                 ▼
 [ Vercel Edge ]   [ Serverless API ]            [ Bunny Edge BR/DE/NY ] [ Storage Zone ]
  - index.html      - /api/config                 - .mp4 streaming        - High-res Stills
  - gigantera/      - /api/bunny/scan             - .mp3 range 206        - 17 Full Audio Tracks
  - admin/          - /api/send-briefing          - ffmpeg-core.wasm      - 17 Audio Previews
  - blog/           - /api/upload-frame           - 3D textures           - Video Loops
        │
        ▼
 [ Supabase PostgreSQL ]
  - Auth (OAuth / JWT)
  - RLS (Projects / Scenes / Logs)
```

---

## 2. Gigantera: Arquitetura do Pavilhão 3D & Motor WebGL

O subprojeto `/gigantera` é uma Single Page Application construída com **React 19 + TypeScript + Vite + Three.js**.

### 2.1 Pipeline de Renderização 3D (`GalleryScene3D.tsx`)
1. **WebGLRenderer:**
   - Modo `antialias: true` e `alpha: false` para performance ideal.
   - Gerenciamento dinâmico de DPI com base no perfil de qualidade gráfica:
     - `high` (RTX Full): Pixel ratio até 1.6x, sombras suaves tipo `PCFSoftShadowMap` (tipo 2), névoa volumétrica e feixes de luz ativos.
     - `med`: Pixel ratio até 1.25x, sombras básicas (`PCFShadowMap`), névoa atenuada.
     - `light`: Pixel ratio 1.0x, sombras desabilitadas para dispositivos de baixo consumo.
2. **Sistema de Câmera & Projeção:**
   - Câmera em perspectiva (`PerspectiveCamera`) com FOV de 60 graus, *near plane* de 0.1 e *far plane* de 150m.
   - Matriz de frustum calculada a cada quadro para realizar *frustum culling* preciso nos vídeos e vitrines, pausando elementos fora do campo de visão.
3. **Vitrines de Vidro Acrílico Suspensa:**
   - Materiais físicos (`MeshPhysicalMaterial`) com transmissão óptica de 92%, aspereza superficial (`roughness: 0.08`) e índice de refração realista (`ior: 1.48`).
   - Pôsteres internos texturizados mapeando impressões de arte giclée em proporções dinâmicas (9:16 vertical e 16:9 widescreen).

### 2.2 Viewmodel 3D em Primeira Pessoa (`CDViewmodel3D.ts`)
Para garantir que a mão do jogador e o estojo de CD em acrílico nunca entrem em conflito geométrico (*clipping*) com as paredes e pilares de concreto da galeria:
- O estojo é renderizado em um grupo filho acoplado diretamente à matriz da câmera (`camera.add(this.rootGroup)`).
- **Mão Poligonal Procedural:** Geometria de mão estilizada low-poly facetada (`flatShading: true`), conferindo identidade autoral que remete à era clássica dos consoles de 32/128-bits (PS1/PS2).
- **Contracapa Renderizada em Canvas 2D Dinâmico:** Um canvas 1024x1024 gera proceduralmente o layout gráfico do verso do encarte com tipografia monoespelhada, tempos de faixa, BPMs e código de barras, atualizado como textura `THREE.CanvasTexture`.
- **Física de Balanço (Bobbing & Inertia):** Interpolação esférica (SLERP) suaviza as guinadas do mouse com amortecimento inercial.

### 2.3 Motor de Física e Movimento (`playerController.ts`)
- **Cinemática FPS:** Vetores de velocidade com aceleração (`lerp`), velocidade máxima para caminhada (4.2 m/s) e corrida com Shift (7.0 m/s), desaceleração por atrito e colisores no perímetro do salão (`playerBounds`).
- **Suporte Mobile e Giroscópio:** Detecção automática de dispositivos touch. Integração com `DeviceOrientationEvent` (iOS e Android) para controle por movimento de inclinação do aparelho, além de navegação táctil via *Stepper Glide* que calcula vetores suaves até os pontos de observação (*viewing spots*).

---

## 3. Web Audio API & Sound Engine (`soundEngine.ts`)

A experiência sonora de Gigantera é um componente curatorial de primeira classe que opera em paralelo ao canvas WebGL.

### 3.1 Grafo de Áudio (Audio Graph Topology)
```
[ HTMLAudioElement (Bunny CDN .mp3) ]
                 │
                 ▼
    [ MediaElementSourceNode ]
                 │
                 ▼
       [ AnalyserNode (128 FFT) ]
                 │
                 ▼
       [ StereoPannerNode ] ──── Balanceamento dinâmico baseado na posição X do jogador
                 │
                 ▼
          [ GainNode ] ──────── Curva de atenuação de distância e fade suave
                 │
                 ▼
       [ AudioContext Destination ]
```

### 3.2 Características Cruciais da Implementação:
1. **Streaming com Byte-Range (HTTP 206):**
   - O elemento de áudio utiliza `crossOrigin = 'anonymous'`, permitindo conexão direta com o analisador de frequência da Web Audio API sem restrições de CORS.
   - Requisições com cabeçalho `Range: bytes=0-` baixam apenas blocos necessários, eliminando atrasos de buffering.
2. **Upgrade Inteligente (Preview 10s → Faixa Completa 48kHz):**
   - Ao folhear o CD Jewel Case, dispara-se imediatamente o preview de 160 KB.
   - Se o usuário permanecer na faixa por mais de 4 segundos, o motor executa upgrade transparente para a versão master completa sem interrupção perceptível.
3. **Acoustic Heat Haze (Partículas de Distorção de Ar):**
   - O `analyserNode` extrai energia em tempo real nas faixas de graves e sub-graves.
   - O valor de energia modula a escala e pulsação dos cones das caixas acústicas e a opacidade dos anéis de névoa de calor, criando a ilusão física de pressão sonora no ambiente 3D.
4. **Curva de Atenuação Exponencial:**
   - Conforme o jogador se afasta da estação de áudio (Z = +20m) em direção aos setores de vídeo (Z = -22m), o volume diminui suavemente até silenciar, permitindo que os áudios das obras cinéticas assumam o primeiro plano sem cacofonia.

---

## 4. Arquitetura de Mídia & Bunny.net CDN

Para contornar o limite de **10 GB de Fast Origin Transfer** da Vercel Hobby, 100% dos arquivos de mídia pesada e binários WebAssembly foram desacoplados da hospedagem estática.

### 4.1 Mapeamento de Zonas e Endpoints
- **Storage Zone:** `pelimotion-portfolio` (Região: Nova York / Frankfurt com replicação global)
- **Pull Zone CDN:** `https://pelimotion-portfolio.b-cdn.net/`
- **Tabela de Ativos Hospedados:**

| Tipo de Ativo | Caminho no CDN | Políticas de Cache |
| :--- | :--- | :--- |
| **Áudio Completo (17 tracks)** | `/gigantera/audio/full/full-XX.mp3` | `public, max-age=2592000` (30 dias) + Byte-Range |
| **Previews de Áudio (17 tracks)**| `/gigantera/audio/previews/preview-XX.mp3` | `public, max-age=2592000` (30 dias) + Byte-Range |
| **Stills / Impressões de Arte** | `/gigantera/stills/*.jpg` | `public, max-age=2592000` + Edge Storage |
| **Vídeos Cinéticos em Loop** | `/gigantera/videos/*.mp4` | `public, max-age=2592000` + HTTP 206 |
| **Motor FFmpeg WebAssembly** | `/ffmpeg/ffmpeg-core.wasm` (32 MB) | `public, max-age=2592000` + CORS liberado |

### 4.2 Blindagem do Build & Deploy Vercel
O arquivo `.vercelignore` impede rigorosamente que diretórios e arquivos pesados sejam transferidos no momento do deploy:
```gitignore
assets/ffmpeg/
ffmpeg_assets/
gigantera/works/audio/
gigantera/public/works/audio/
gigantera/dist/works/audio/
*.wasm
*.mp3
*.mp4
*.wav
```
Resultado: **Redução do payload de deploy de 149 MB para ~17 MB**, com build estático executado em menos de 1 segundo e **zero consumo de transferência de origem** para conteúdo multimídia.

---

## 5. Gestão de Estado Global (`store.ts`)

A aplicação utiliza **Zustand** para gerenciamento de estado previsível e desacoplado do ciclo de vida dos componentes React.

### 5.1 Principais Slices de Estado:
- **Navegação Espacial:** `cameraTargetZ`, `cameraCurrentZ`, `activeSectorId` (`entrance-audio`, `still`, `video`), `currentArtworkIndex`.
- **Inspeção & Cinema:** `cinemaArtwork`, `inspectionZoom` (0.5x a 3.5x), `isLoupeMode` (zoom de ampliação a 2.8x com coordenadas de cursor), `stillArtworksList`, `currentStillSheetIndex`.
- **Acoustic POV:** `isHoldingCD`, `isCDPOVOpen`, `cdFlipped`, `currentAudioTrack`, `isAudioPlaying`, `soundVolume`.
- **Ajustes de Renderização:** `graphicsQuality` (`light`, `med`, `high`), `theme` (`dark`, `light`).
- **Mobile & Telemetria:** `isMobile`, `isGyroscopeActive`, `targetGlideSpot`.

---

## 6. Procedimento para Novos Desenvolvedores Assumirem o Projeto

### Passo 1: Clonar e Instalar
```bash
git clone https://github.com/Pelimotion/portfolio.git
cd portfolio
cd gigantera && npm install && cd ..
```

### Passo 2: Executar em Modo Dev
```bash
cd gigantera
npm run dev
# Abra http://localhost:5173/gigantera/
```

### Passo 3: Adicionar Nova Obra ao Catálogo
1. Suba a imagem/vídeo em alta resolução para o Storage da Bunny.net (`gigantera/stills/` ou `gigantera/videos/`).
2. Adicione o objeto correspondente no array `ARTWORKS_CATALOG` em `gigantera/src/data/artworks.ts`.
3. Defina as coordenadas espaciais `spatialCoords: { x, y, z, rotY }` onde a vitrine deve flutuar no salão 3D.
4. Rode `npm run build` dentro de `gigantera/` e faça o commit. O deploy entrará no ar em menos de 1 minuto.
