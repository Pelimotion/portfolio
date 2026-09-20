# BRIEFING ESTRATÉGICO DE TRANSIÇÃO — GIGANTERA (SISTEMA INTERATIVO & ACÚSTICO COMPLETO)
> **Documento mestre de handoff para continuidade autônoma imediata no próximo chat.**
> **Data:** 2026-09-20 | **Branch:** `main` | **Status do Build:** 100% Validado (0 erros TypeScript, build ~890ms, 0 erros de console)

---

## 🎯 RESUMO EXECUTIVO DA SESSÃO: VIVÊNCIA INTERATIVA TOTAL & ENGENHARIA ACÚSTICA (2026-09-20)

Nesta sessão foi realizada uma transformação monumental na experiência do usuário, UX e engenharia do **Pavilhão Digital Gigantera**, elevando a imersão artística com controle universal por teclado, modulação sonora tátil de DJ, visualizador generativo no CD Lounge, escultura viva do Espinhaço com dualidade teclado/câmera, 4 setores espaciais e iluminação acousto-fotônica:

### 1. Controle Universal por Teclado & Mini-Tutoriais Brutalistas (HUD)
- **Navegação Global sem Fricção**: Todo o pavilhão e as experiências modais respondem a atalhos de teclado padronizados:
  - Setores espaciais: `1` (SOM), `2` (ESPINHAÇO), `3` (VÍDEOS), `4` (STILLS).
  - Inspeção & Ações: `E` ou `Enter` para interagir, `Espaço` para play/pause/ejetar, `Esc` para retornar.
  - Filtro DJ: `[` e `]` ou `O` e `P` para modular, `0` para reset centralizado.
  - Fidelidade gráfica: `G` para alternar entre `LEVE`, `MÉDIO` e `ALTO`.
  - Ajuda/Tutorial: `H` para exibir/ocultar guia tático.
- **HUDs Contextuais & Tutoriais Flutuantes**: Telas do CD Lounge e do Espinhaço contam com cartões informativos semi-translúcidos brutalistas com badges de teclado claros e diretos.

### 2. Espinhaço Interativo: Dualidade Câmera 360° vs. Teclado Orgânico
- **Alternância Instantânea**: Tecla `C` ativa o modo **Órbita 360°** (câmera cinematográfica orbitando a escultura) e tecla `K` ativa o modo **Teclado Orgânico**.
- **Cinética Vertebral em Tempo Real**: No modo Teclado (`K`), o visitante deforma, flexiona e torce as 50.000 partículas e os nós ósseos da escultura usando `WASD` / Setas direcionais.
  - `W` / `S`: Flexão vertical e ondulação crânio-caudal.
  - `A` / `D`: Torção e encurvamento lateral.
  - `Espaço`: Pulso cinético sísmico irradiando pela coluna.
- **HUD de Telemetria Dinâmica**: Monitoramento em tempo real da curvatura de torção, rotação 3D e proximidade da escultura.

### 3. Knob de Filtro DJ Bipolar Ressonante (Low/High Cut)
- **Mecanismo de Áudio Musical Web Audio API** (`soundEngine.ts`):
  - Cadeia de filtros em cascata com Passa-Baixa (Sweep para a esquerda: -1.0 a 0.0, 20kHz → 180Hz) simulando submersão/abafamento atmosférico e Passa-Alta (Sweep para a direita: 0.0 a +1.0, 20Hz → 4.5kHz) simulando rarefação/transparência radiante.
  - Fator Q de ressonância dinâmica calibrado para zero-clipping via nó compressor integrado.
- **Componente de Controle Tátil (`DJFilterKnob.tsx`)**:
  - Dial circular de 270° com arco SVG brutalista, ponteiro graduado, arrasto vertical/angular, duplo clique para reset no centro `0` e suporte a teclas `[` e `]`.

### 4. CD Listening Lounge com Visualizador Generativo de Partículas
- **Visualizador Espectral (`CDVisualizerField.tsx`)**:
  - Renderizado no espaço de fundo atrás do estojo de CD em perspectiva isométrica/POV.
  - 7 famílias topológicas procedurais distribuídas deterministicamente pelo hash de cada uma das 17 faixas (`rings`, `matrix`, `nebula`, `vortex`, `strata`, `fractal`, `torus`).
  - Paletas cromáticas exclusivas e coerentes com a identidade Pelimotion (Oceanic, Magma, Spectral, Bronze, Monocromo, etc.).
  - Totalmente acoplado ao analisador de frequências (graves, médios, agudos) e modulado em tempo real pelo filtro DJ.

### 5. Miniplayer Co-Reativo Flutuante Contínuo (`FloatingMiniPlayer.tsx`)
- Presente na vivência do Espinhaço e expansível para as demais salas:
  - Botão Play/Pause tátil, indicador da faixa em reprodução e BPM pulsante.
  - Equalizador de barras espectrais animado em tempo real conforme o áudio.
  - Mini-knob do filtro DJ integrado com leitura instantânea do corte de frequência.

### 6. Tiers de Fidelidade Gráfica (Leve / Médio / Alto)
- Alternável em tempo real pelo atalho `G` ou pelo menu HUD:
  - **LEVE (60 FPS garantidos em laptops/GPUs integradas)**: Redução de partículas ativas no Espinhaço (20.000) e no CD Lounge (320 partículas), desativação de reflexos pesados.
  - **MÉDIO**: Equilíbrio estético (35.000 partículas no Espinhaço, 750 no CD).
  - **ALTO**: Fidelidade máxima (50.000 partículas com dispersão física completa e 1.500 partículas no CD).

### 7. Reorganização Espacial em 4 Setores Arquiteturais
- Reformulação do pavilhão e do dock inferior em 4 alas modulares com atalhos numéricos diretos:
  - `1 · SOM`: Altar e estojo do CD com o acervo musical completo.
  - `2 · ESPINHAÇO`: Vitrine museológica do fóssil vivente interativo.
  - `3 · VÍDEOS`: Galeria audiovisual para obras cinematográficas.
  - `4 · STILLS`: Galeria de giclées e gravuras estáticas.

### 8. Iluminação Acousto-Fotônica da Galeria
- A iluminação do pavilhão tridimensional (sol, claraboias e spot do visitante) respira sutilmente sincronizada com as ondas sub-graves da música ativa e desloca sua temperatura de cor (kelvins/matiz) em sintonia com a modulação do filtro DJ.

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
