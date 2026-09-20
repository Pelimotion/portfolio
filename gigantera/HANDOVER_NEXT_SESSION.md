# BRIEFING ESTRATÉGICO DE TRANSIÇÃO — GIGANTERA (EXPOGRAFIA MINIMALISTA, FOYER & SANTUÁRIO DE PENUMBRA)
> **Documento mestre de handoff para continuidade autônoma imediata no próximo chat.**
> **Data:** 2026-09-20 | **Branch:** `main` | **Status do Build:** 100% Validado (0 erros TypeScript, build ultra-rápido ~470ms, 0 erros de console)

---

## 🎯 RESUMO EXECUTIVO DA SESSÃO: EXPOGRAFIA MINIMALISTA & DESCOBERTA PROGRESSIVA

Nesta sessão foi realizada uma profunda reestruturação na expografia, jornada de experiência de usuário (UX) e arquitetura espacial do **Pavilhão Digital Gigantera**, orientada por conceitos de expografia contemporânea e museologia de imersão:

### 1. Correção Crítica de Pointer Lock (Liberação de Mouse com `[ESC]`)
- **Problema Corrigido:** Ao pressionar `ESC` para liberar o mouse e reexibir o ponteiro, a câmera continuava acompanhando a movimentação do cursor na tela via fallback contínuo ("single-click look").
- **Solução Implementada:** Em `playerController.ts`, o evento `handlePointerLockChange` agora zera explicitamente a flag de intenção `hasClickedCanvas = false` e os deltas acumulados sempre que `!this.isLocked`. A rotação de câmera para imediatamente até que o usuário execute um novo clique deliberado no canvas 3D.

### 2. Expografia de Descoberta Progressiva (Foyer com Baffles & CD como Portal Inicial)
- **Desobstrução & Respiro Minimalista:** O arranjo tumultuado em ferradura concêntrica foi eliminado em prol de uma estética arquitetural classuda, arejada e misteriosa.
- **Foyer Arquitetural com Paredes Defletoras (Baffles):** Na entrada (`Z = 24m`), o usuário nasce voltado diretamente para a Estação de Áudio do CD Jewel Case (`Z = 18m`). Duas grandes paredes arquiteturais monolíticas aveludadas (`Z = 14m`, `X = ±9m`) enquadram o portal de entrada, bloqueando intencionalmente a visão geral antecipada do salão e garantindo que o CD seja o primeiro objeto de contato e contemplação.
- **Colisões Físicas dos Baffles:** Foram adicionados pontos de colisão cilíndrica em `playerController.obstacles` para as paredes defletoras, impedindo que o visitante atravesse a alvenaria.

### 3. Percurso da Galeria em Ziguezague Escultural (Progressive Disclosure)
- **Passada Fluida e Curadoria Espaçada:** As vitrines de vídeos cinéticos e gravuras em papel mate giclée distribuem-se alternadamente em ziguezague (`X = ±7.5m`, espaçamento `Z = 8.5m` longitudinal).
- **Sensação Contínua de Descoberta:** O visitante descobre uma obra de cada vez ao caminhar pelo corredor central, sem sobreposição visual ou excesso de estímulos simultâneos.

### 4. Santuário de Penumbra no Clímax da Galeria (Espinhaço Monumental)
- **Localização Sagrada no Fundo do Salão:** A escultura 3D viva do *Espinhaço* foi posicionada no ápice e término da galeria (`Z ≈ -76.5m`), criando um destino final enigmático e suspense crescente ao longo do trajeto.
- **Plinto de Ardósia Escura:** Um piso arquitetural negro aveludado (`24m × 28m`) cobre a área do santuário, proporcionando uma transição tátil nítida em relação ao piso de microcimento alabastro do salão principal.
- **Teto Oclusor & Holofote Dramático:** Um teto oclusor flutuante de 36m bloqueia a iluminação solar global sobre o Espinhaço, enquanto um `SpotLight` teatral focado ilumina a escultura de cima e um suave `PointLight` cianita projeta contraluz e rim light na sua silhueta.
- **Claraboias Isoladas:** O gerador de feixes de luz volumétricos (*god rays*) do teto foi reprogramado para ignorar a zona do santuário, preservando o clima de penumbra estrito.

### 5. Navegação & Cálculo de Setores Sincronizados
- **Limites de Setores Atualizados:** Em `store.ts`, a detecção contínua do `activeSectorId` e o sistema de teletransporte suave (`warpToSector`) foram alinhados com as novas coordenadas espaciais:
  - `01 · SOM`: Foyer de entrada (`Z: +24m → +14m`)
  - `02 · VÍDEOS`: Setor inicial do percurso da galeria (`Z: +14m → -25m`)
  - `03 · STILLS`: Setor intermediário da galeria (`Z: -25m → -60m`)
  - `04 · ESPINHAÇO`: Santuário de Penumbra (`Z < -60m`)
- **Pills e Teclas de Atalho `1`, `2`, `3`, `4`:** Refletem a progressão geográfica do pavilhão da entrada até o santuário.

---

## 🎮 MAPA COMPLETO DE CONTROLES & ATALHOS

| Tecla / Gesto | Contexto | Ação Realizada |
| :--- | :--- | :--- |
| `W`, `A`, `S`, `D` / Setas | Galeria 3D | Caminhar pelo pavilhão |
| `Shift` | Galeria 3D | Correr / Acelerar locomoção |
| `Mouse Click` | Galeria 3D | Capturar mouse com Pointer Lock FPS |
| `Esc` | Galeria 3D | Liberar ponteiro do mouse (câmera para imediatamente) |
| `E` ou `Enter` | Galeria 3D | Interagir / Inspecionar obra ou CD |
| `1`, `2`, `3`, `4` | Galeria 3D | Navegação rápida de Setores (Som → Vídeos → Stills → Espinhaço) |
| `W`, `A`, `S`, `D` | Espinhaço 3D | Flexão anteroposterior e torção axial da coluna |
| `Espaço` | Espinhaço 3D | Pulso cinético sísmico (onda de choque) |
| `1`, `2`, `3` | Espinhaço 3D | Modos de Visão: MATÉRIA (PBR), CORPÚSCULOS (50k pontos), RAIO-X (Glitch Shader) |
| `B` | Espinhaço 3D | Alternar Biomas: Titânio, Abissal, Magma, Espectral |
| `H` | Espinhaço 3D | Exibir / Recolher painel lateral (com auto pan de câmera) |
| `I` | Espinhaço 3D | Reabrir Splash Screen com ficha técnica |
| `[` e `]` ou `O` e `P` | Global | Modular Filtro DJ (Passa-Baixa / Passa-Alta) |
| `0` | Global | Resetar Filtro DJ para neutro |
| `G` | Global | Alternar fidelidade gráfica (Leve / Médio / Alto) |
| `C` | Global | Abrir painel Fullscreen de Sobre & Contato |
| `M` | Global | Mudo global (silenciar / desilenciar áudios) |
| `TAB` | Galeria 3D | Acervo frontal 4x2 |

---

## 🛠️ ESTADO TÉCNICO & INTEGRIDADE DO CÓDIGO

- **Branch Atual:** `main`
- **Validação TypeScript:** `npx tsc --noEmit` aprovado com **0 erros**.
- **Build de Produção:** `npm run build` executado com sucesso em ~470ms.
- **Bundle Distribuível:** Assets sincronizados em `/assets`, `./index.html` e `./ar`.

---

## ⚡ COMANDOS RÁPIDOS DE DESENVOLVIMENTO

```bash
# Entrar na pasta do projeto
cd "/Volumes/PLM_SSD_01/Google Drive/Pelimotion/Pipeline SSD 01/Pelimotion/Site/gigantera"

# Executar dev server local
npm run dev

# Checagem de tipagem TypeScript
npx tsc --noEmit

# Compilar build de produção local
npm run build
```
