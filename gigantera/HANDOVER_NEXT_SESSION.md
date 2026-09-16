# BRIEFING ESTRATÉGICO DE TRANSIÇÃO — GIGANTERA (PRÓXIMA SESSÃO)
> **Documento mestre de handoff para continuidade autônoma imediata no próximo chat.**
> **Data:** 2026-09-16 | **Branch:** `main` | **Status do Build:** 100% Validado & Deploy Realizado no Vercel

---

## 🎯 RESUMO EXECUTIVO DA SESSÃO ATUAL (2026-09-16)

Nesta sessão, foram refinados profundamente a engenharia acústica (Web Audio API), a imersão espacial binaural/fone de ouvido, a experiência tátil com o CD Jewel Case 3D e a ergonomia de navegação no pavilhão de arte digital:

1. **Atalho 'M' Exclusivo para Mudo Global (Sem Abrir Gaveta)**:
   - A tecla `M` (`KeyM`) agora atua **estritamente como mute/unmute do som global** (música do CD e áudios de obras).
   - Não abre nem fecha mais gavetas de mídia ou outros painéis.
   - O botão do Now Playing no `GalleryHeader` reflete o estado mutado/pausado de forma tática.

2. **Identificação de Obras com Áudio Real (`hasAudio: boolean`)**:
   - Adicionado o campo booleano `hasAudio` na tipagem `Artwork` (`types/art.ts`).
   - Mapeadas todas as obras no catálogo (`data/artworks.ts`):
     - `p-tessitura`: `hasAudio: true` (com trilha/design sonoro).
     - `p-espinhaco` e `p-fagulha`: `hasAudio: false` (vídeos silenciosos).
     - Stills: `hasAudio: false`.
   - **Comportamento Inteligente**: Ao abrir uma obra em `CinemaView`, a música do CD de fundo só é pausada se a obra realmente contiver áudio próprio (`cinemaArtwork.hasAudio === true`). Se for silenciosa, a música da galeria continua tocando sem interrupção.

3. **Master Limiter / Compressor de Áudio Dinâmico (Web Audio API)**:
   - Implementado nó de compressão em `soundEngine.ts` com `DynamicsCompressorNode` (`threshold: -14dB`, `knee: 12dB`, `ratio: 8`, `attack: 0.003s`, `release: 0.25s`).
   - Garante que todas as 17 faixas do álbum e as obras de vídeo soem em nível homogêneo e controlado, eliminando distorções, clipping ou variações bruscas de volume.

4. **Áudio Imersivo & Balanço L/R para Fones de Ouvido**:
   - Ajustada a função de panning estereofônico para fones de ouvido: ganho da curva de azimute ampliado com `Math.sin(angle) * 0.9` e `StereoPannerNode`.
   - Rotação da cabeça do jogador provoca deslocamento acústico espacial nítido e natural entre os canais esquerdo e direito.

5. **Interação com o CD Jewel Case 3D**:
   - **Aviso Narrativo de Fones**: Adicionado toast sutil tático com ícone de fones de ouvido (`cd-headphones-warning`) ao interagir com o CD.
   - **Giro Automático de Capa**: Ao visualizar a capa frontal, qualquer interação por `wheel` (scroll do mouse), clique no case ou setas do teclado vira automaticamente o CD para a contracapa (`flipCD`), facilitando a seleção das faixas.
   - **HUD Limpo Durante Interação**: A barra inferior com atalhos `[1]`, `[2]`, `[3]` é ocultada suavemente quando o CD está na mão (`isHoldingCD = true`), mantendo apenas a interface essencial.

6. **Refinamentos no Modo Cinema (`CinemaView.tsx`)**:
   - **Compatibilidade macOS**: Mapeamento de teclas de atalho atualizado para `e.code` (`KeyI`, `KeyR`, `KeyM`, `KeyF`, `Escape`) evitando conflitos com dead keys/Option no Mac.
   - **Cartão Curatorial Sem Sobreposição**: O dossiê lateral (`.cinema-lateral-dossier`) agora tem posicionamento absoluto superior (`top: 1.5rem`), sem sobrepor botões ou o dock inferior.
   - **Eliminação de Botão Duplicado**: Removido o botão de fechar redundante (`cinema-mini-exit`).
   - **Padronização de Títulos**: Removidas tags de versão (`(v2)`) dos nomes das faixas de áudio no catálogo.

---

## 🚀 PONTOS DE PARTIDA & TAREFAS PARA A PRÓXIMA SESSÃO

Na próxima sessão, o time pode avançar nas seguintes frentes já mapeadas:

### 1. Cursor Customizado na Inspeção de Obra (`CinemaView.tsx`)
- Cursor de mão de arrasto estilo brutalista (`grab` / `grabbing`) sobre o canvas/imagem da obra, transitando para ponteiro tradicional (`pointer`) ao passar o mouse sobre botões, controles e dock inferior.

### 2. Single-Click Pointer Lock no Pavilhão 3D
- Assegurar que um único clique (`pointerdown`) no salão trave a mira sem requerer segurar o botão do mouse para olhar ao redor.

### 3. Transição Suave do Tutorial de Entrada
- Harmonizar o tempo de exibição do card introdutório com transição de fade-out de 2 segundos para o minitutorial docado no rodapé.

### 4. Keycaps Físicas Padronizadas em Todo o Sistema
- Expandir o estilo de keycaps mecânicas (`.keycap`) já aplicado em `MinimalBottomBar.tsx` para todas as interfaces (Modal de Ajuda, CinemaView e ArchiveIndex).

---

## 🛠️ VERIFICAÇÃO E COMANDOS

```bash
# Pasta do projeto
cd "/Volumes/PLM_SSD_01/Google Drive/Pelimotion/Pipeline SSD 01/Pelimotion/Site/gigantera"

# Checagem de tipos
npx tsc --noEmit

# Build de produção
npm run build

# Dev server local
npm run dev
```

---

## 🔒 REGRAS ABSOLUTAS
- **Zero-Bandwidth Git:** Mídias pesadas (áudios, vídeos e giclées) residem 100% na Bunny CDN (`https://pelimotion-portfolio.b-cdn.net/`).
- **Deploy:** Cada `git push origin main` dispara automaticamente o build e deploy na Vercel.
- **Escopo Isolado:** Modificações devem ficar restritas a `/gigantera/`, mantendo a estabilidade do site principal.
