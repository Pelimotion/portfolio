# Memória de Engenharia: Gigantera — Áudio Limiter, Panning Binaural, Mute Global e UX Cinema/CD

**Data**: 2026-09-16
**Autor**: Antigravity Assistant

## Contexto e Objetivos
Ajustes finos no módulo de áudio e na interface da galeria 3D brutalista Gigantera (`pelimotion.art/gigantera`):
1. **Atalho 'M'**: Exclusivo para Mute Global (som do CD e áudios de obras) sem abrir a gaveta de mídia.
2. **Flag `hasAudio` nas Obras**: Obras sem áudio nativo (`p-espinhaco`, `p-fagulha` e stills) não pausam a trilha sonora do CD ao serem abertas no `CinemaView`. Apenas obras com áudio (`p-tessitura`) pausam o som ambiente.
3. **Master Compressor/Limiter**: Inserido `DynamicsCompressorNode` na Web Audio API em `soundEngine.ts` para equalizar dinamicamente todas as 17 faixas e vídeos.
4. **Panning Estereofônico para Fones**: Balanço L/R com `StereoPannerNode` sensível à rotação da câmera.
5. **Experiência com CD 3D**: Aviso sutil para uso de fones de ouvido (`.cd-headphones-warning`), auto-flip para a contracapa com scroll/clique/teclas de seta e ocultação da barra inferior durante o manuseio.
6. **CinemaView & Teclado Mac**: Mapeamento via `e.code` (`KeyI`, `KeyR`, `KeyM`), eliminação de botão redundante de fechar e fixação do dossiê lateral no topo para evitar sobreposição.

## Arquivos Principais
- `gigantera/src/core/soundEngine.ts`
- `gigantera/src/core/store.ts`
- `gigantera/src/types/art.ts` & `gigantera/src/data/artworks.ts`
- `gigantera/src/components/audio/CDJewelCasePOV.tsx`
- `gigantera/src/components/modal/CinemaView.tsx`
- `gigantera/src/components/layout/GalleryHeader.tsx` & `MinimalBottomBar.tsx`
- `gigantera/src/index.css`
