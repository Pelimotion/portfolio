// Web Worker — stitch de tiles usando Canvas 2D com gradient compositing.
// Não usa OpenCV.js — compatível com todos os browsers modernos, sem módulo extra.
//
// Mensagem de entrada:
//   { type: 'stitch', tileUrls: string[], preset: DisplayPreset }
//   (DisplayPreset tem positions[].overlap_left/overlap_right/x, tile_width, tile_height,
//    canvas_total_width, crop_x_start, width)
//
// Mensagens de saída:
//   { type: 'progress', value: 0-100 }
//   { type: 'done', blob: Blob }         ← PNG final
//   { type: 'error', message: string }

self.onmessage = async function (e) {
  if (e.data.type !== 'stitch') return;
  try {
    await stitch(e.data.tileUrls, e.data.preset);
  } catch (err) {
    self.postMessage({ type: 'error', message: err.message ?? String(err) });
  }
};

// ─── Pipeline principal ───────────────────────────────────────────────────────

async function stitch(tileUrls, preset) {
  const { tile_width, tile_height, canvas_total_width, crop_x_start, width, positions } = preset;

  progress(5);

  // Canvas principal que acumula o blend de todos os tiles
  const mainCanvas = new OffscreenCanvas(canvas_total_width, tile_height);
  const mainCtx = mainCanvas.getContext('2d');

  for (let i = 0; i < tileUrls.length; i++) {
    const pos = positions[i];

    // Baixa e redimensiona o tile para tile_width × tile_height
    const bitmap = await fetchAsBitmap(tileUrls[i], tile_width, tile_height);

    // Canvas temporário: aplica gradiente de opacidade nas zonas de overlap
    const tileCanvas = new OffscreenCanvas(tile_width, tile_height);
    const tileCtx = tileCanvas.getContext('2d');
    tileCtx.drawImage(bitmap, 0, 0, tile_width, tile_height);
    bitmap.close();

    // Gradiente horizontal: ramp de 0→1 na entrada, 1→0 na saída (overlap zones)
    const gradient = tileCtx.createLinearGradient(0, 0, tile_width, 0);
    gradient.addColorStop(0, pos.overlap_left > 0 ? 'rgba(0,0,0,0)' : 'rgba(0,0,0,1)');
    if (pos.overlap_left > 0) {
      gradient.addColorStop(pos.overlap_left / tile_width, 'rgba(0,0,0,1)');
    }
    if (pos.overlap_right > 0) {
      gradient.addColorStop((tile_width - pos.overlap_right) / tile_width, 'rgba(0,0,0,1)');
    }
    gradient.addColorStop(1, pos.overlap_right > 0 ? 'rgba(0,0,0,0)' : 'rgba(0,0,0,1)');

    // destination-in: mantém apenas os pixels do tile onde a máscara é opaca
    tileCtx.globalCompositeOperation = 'destination-in';
    tileCtx.fillStyle = gradient;
    tileCtx.fillRect(0, 0, tile_width, tile_height);

    // Compõe o tile mascarado no canvas principal (source-over = padrão)
    mainCtx.drawImage(tileCanvas, pos.x, 0);

    progress(10 + (i + 1) / tileUrls.length * 75);
  }

  progress(88);

  // Crop: remove margem esquerda (crop_x_start > 0) ou usa canvas inteiro (≤ 0)
  const cropX = Math.max(0, crop_x_start);
  const outputW = Math.min(width, canvas_total_width - cropX);

  const outputCanvas = new OffscreenCanvas(outputW, tile_height);
  const outputCtx = outputCanvas.getContext('2d');
  outputCtx.drawImage(mainCanvas, -cropX, 0);

  progress(95);

  const blob = await outputCanvas.convertToBlob({ type: 'image/png' });
  progress(100);
  self.postMessage({ type: 'done', blob });
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

async function fetchAsBitmap(url, width, height) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Falha ao baixar tile: ${url} (${res.status})`);
  const blob = await res.blob();
  return createImageBitmap(blob, { resizeWidth: width, resizeHeight: height, resizeQuality: 'high' });
}

function progress(value) {
  self.postMessage({ type: 'progress', value });
}
