# BRIEFING ESTRATÉGICO DE TRANSIÇÃO — GIGANTERA (PRÓXIMA SESSÃO)
> **Documento mestre de handoff para continuidade autônoma imediata no próximo chat.**
> **Data:** 2026-09-20 | **Branch:** `main` (2 commits à frente do `origin/main`) | **Status do Build:** 100% Validado (0 erros TypeScript, build ~470ms)

---

## 🎯 RESUMO EXECUTIVO DA SESSÃO (2026-09-20)

Nesta sessão foi realizada a **integração monumental da escultura interativa 3D "Espinhaço"** (`/Volumes/PLM_SSD_01/Dev/Gigantera - Espinhaco`) diretamente no pavilhão tridimensional Gigantera, preservando a autenticidade estética da geometria original e implementando engenharia interativa de vanguarda:

### 1. Escultura 3D Autêntica Integrada ao Pavilhão Tridimensional
- **Geometria Autêntica Importada**: Utilização do modelo PBR oficial (`public/models/espinhaco.glb`, 12MB) e nuvem de 50.000 coordenadas espaciais (`public/models/espinhaco_points.bin`, 586KB). Zero aproximação cartoon ou estilização 2D descaracterizante.
- **Ancoragem Arquitetural no Átrio**: Posicionada em `x: -2.2m, z: 14.0m, rotY: 0.12` em `modularGallery.ts` com identificador `espinhaco-interactive-root` e `medium: 'interactive'`.
- **Vitrine Museológica Especializada**:
  - Profundidade ampliada para `1.10m` em `GalleryScene3D.tsx` com `transmission: 0.99` e `opacity: 0.35` (vidro cristalino anti-reflexivo de exposição).
  - Cabos de suspensão verticais em grafite anodizado e clamps de montagem técnica travando a vértebra no interior.
  - Iluminação dedicada interna com holofote focado (`SpotLight`) e luz de preenchimento (`PointLight`).

### 2. Mecânica "Wake-on-Interaction" (Fóssil Vivente)
- **Máquina de Estados de Preservação & Despertar**:
  - **Estado Dormente:** Preservada inerte na vitrine como um fóssil histórico. Sem ciclos de render supérfluos (aura invisível).
  - **Sensibilidade de Proximidade & Retículo:** Dispara quando o visitante se aproxima a menos de `5.8m` ou focaliza o retículo na vitrine.
  - **Interpolação Orgânica (`wakeFactor` 0.0 → 1.0):**
    - Onda cinética vertebral de curvatura suave ao longo do eixo vertical Y.
    - Orientação magnética discreta acompanhando a câmera do jogador (rotação até ±18°).
    - Flare luminoso das luzes internas e transição de emissividade.
    - Ativação da nuvem periférica com 800 corpúsculos orbitais.
  - **HUD Tático:** Retículo acende com aviso: `[E] / [CLIQUE] VIVENCIAR ESPINHAÇO`.

### 3. Vivência Interativa 360° em Tela Cheia (`EspinhacoInteractive.tsx`)
- Ao pressionar `[E]` ou clicar no totem do Espinhaço, a câmera transpassa o vidro e abre a experiência interativa em tela cheia via `CinemaView.tsx`.
- **3 Modos de Visão de Vanguarda**:
  - `MATÉRIA`: Malha metálica PBR hiper-realista com reflexos metálicos e rugosidade precisa.
  - `CORPÚSCULOS`: Nuvem de 50.000 pontos espaciais renderizados com profundidade e atenuação de tamanho.
  - `RAIO-X`: Casca externa translúcida de policarbonato/vidro revelando a espinha interna de pontos.
- **4 Biomas Cromáticos**:
  - `TITÂNIO`: Grafite metálico frio e ciano atmosférico.
  - `ABISSAL`: Esmeralda e bioluminescência marinha profunda.
  - `MAGMA`: Âmbar incandescente e ouro vulcânico.
  - `ESPECTRAL`: Ultravioleta e magenta prismático.
- **Áudio-Reatividade FFT**: Web Audio API com analisador em tempo real modulando a deformação vertebral e pulso de luz.
- **Controles Híbridos**: Órbita 360° com arrasto de mouse/touch, zoom por scroll/pinch e tecla `[E]` ou `[ESC]` para retornar ao pavilhão em primeira pessoa.

### 4. Módulo WebAR Mobile (`/ar/`)
- Módulo independente de Realidade Aumentada para mobile (`ar/index.html` e `src/ar/*`).
- Tracking de rotação real via giroscópio com quatérnios espaciais (`gyroTracking.ts`).
- Detector óptico centro-periferia (`opticalDetector.ts`) e carregador binário de pontos (`pointsLoader.ts`).

### 5. Taxonomia, Filtros e Categorias
- Adicionada a categoria `medium: 'interactive'` nas tipagens (`types/art.ts`).
- `ArchiveIndex.tsx` e `MobileBottomDock.tsx` atualizados com o filtro `✦ INTERATIVO`.
- `data/artworks.ts` calibrado: apenas o totem do Espinhaço possui `interactiveExperience: 'espinhaco'`, preservando as obras de vídeo ("Tração" e "Encalhe") como vídeos de alta fidelidade.

### 6. Drone Procedural de Proximidade (Espinhaço Proximity Hum)
- Síntese de campo acústico sub-grave orgânico de museu (48Hz fundamental + 96.2Hz harmônico com leve batimento acústico e filtro passa-baixa ressonante em 140Hz) diretamente na Web Audio API (`soundEngine.setEspinhacoProximityHum`).
- Acoplado ao `wakeFactor` na render loop da galeria 3D: ganho e frequência de corte se abrem conforme o visitante se aproxima da vitrine, silenciando suavemente em repouso. Zero dependência de arquivo de áudio externo.

### 7. Otimização de Performance & Code-Splitting Dinâmico
- `EspinhacoInteractive.tsx` agora é carregado dinamicamente via `React.lazy()` e `<Suspense>` dentro de `CinemaView.tsx`, gerando um chunk isolado de 16KB (`EspinhacoInteractive-[hash].js`) e reduzindo o bundle principal `main.js` para 421KB.
- O visitante do pavilhão baixa a lógica 3D pesada da vivência interativa apenas quando clica para inspecioná-la.

### 8. Gestos Mobile & Feedback Háptico no Espinhaço
- Adicionado suporte a gestos de toque no visualizador interativo: rotação orbital com 1 dedo, pinch-to-zoom com 2 dedos e duplo toque para disparo de pulso de choque cinético.
- Feedback háptico via `navigator.vibrate` acionado ao alternar modos de visão (`MATÉRIA`, `CORPÚSCULOS`, `RAIO-X`), biomas cromáticos e pulsos.

### 9. Higienização do Pipeline de Build
- O script de `build` no `package.json` foi corrigido com `rm -rf ./assets && cp -r dist/assets ./`, eliminando bundles históricos órfãos que inflavam a pasta raiz.

---

## 🛠️ ESTADO TÉCNICO & INTEGRIDADE DO CÓDIGO

- **Branch Atual:** `main`
- **Commits Locais:**
  - `aff1e52`: `docs: atualizar README, HANDOVER_NEXT_SESSION e grafo de conhecimento...`
  - `1501557`: `feat: integrar escultura 3D autêntica do Espinhaço no totem com wake-on-interaction`
  - `31a1341`: `wip: Espinhaço 3D model integration and handoff setup`
- **Validação de Tipos:** `npx tsc --noEmit` aprovado com **0 erros**.
- **Build de Produção:** `npm run build` executado com sucesso em ~470ms.
- **Knowledge Graph:** Pipeline `graphify` executado e atualizado em `graphify-out/`.

---

## 🚀 PONTOS DE PARTIDA & TAREFAS PARA AS PRÓXIMAS SESSÕES

Nas próximas sessões, o time pode avançar nas seguintes frentes:

### 1. Sincronização Git (`origin/main`)
- Quando conveniente para o usuário, fazer `git push origin main` para publicar os 2 commits pendentes e acionar o build/deploy automático da Vercel.

### 2. Engenharia Acústica Espacial do Totem Espinhaço
- Adicionar um drone sonoro ou campo sonoro sub-grave textural contínuo quando o visitante estiver a menos de 5.8m do totem na galeria 3D, ampliando a sensação táctil de "despertar" do fóssil vivente.

### 3. Curadoria de Obras Adicionais ou Variações de Bioma
- Expandir novos biomas na interface do `EspinhacoInteractive.tsx` se desejado pelo curador.
- Possibilidade de adicionar presets de câmera na inspeção interativa (ex: vista transversal, macro nas vértebras lombares).

### 4. Refinamento de Pointers & UX Mobile
- Aprimorar o feedback háptico (vibração no mobile via `navigator.vibrate`) ao tocar nas vértebras do Espinhaço no modo interativo e no WebAR.

---

## ⚡ COMANDOS RÁPIDOS DE DESENVOLVIMENTO

```bash
# Entrar na pasta do projeto
cd "/Volumes/PLM_SSD_01/Google Drive/Pelimotion/Pipeline SSD 01/Pelimotion/Site/gigantera"

# Executar dev server
npm run dev

# Checagem de tipagem TypeScript
npx tsc --noEmit

# Compilar build de produção
npm run build

# Consultar o grafo de conhecimento do projeto
graphify query "<pergunta sobre arquitetura>"
```

---

## 🔒 DIRETRIZES E REGRAS PERMANENTES
1. **Modelos 3D e Binários Autênticos:** O modelo do Espinhaço (`espinhaco.glb` e `espinhaco_points.bin`) deve sempre manter suas proporções originais calibradas (rotação Z 90°, altura 2.40m).
2. **Desempenho & 60 FPS:** O cálculo da aura de partículas e ondas na escultura só roda quando `wakeFactor > 0.01` para não sobrecarregar a GPU quando o visitante estiver distante.
3. **Zero-Bandwidth Git para Mídias Pesadas:** Vídeos, giclées e áudios continuam hospedados na Bunny CDN. Apenas o GLB e binário calibrados de 12MB residem no bundle local.
4. **Deploy Blindado:** Toda alteração deve passar sem erros no `npx tsc --noEmit` e `npm run build`.
