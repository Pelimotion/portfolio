// Web Worker — stitch de tiles usando OpenCV.js MultiBandBlender.
//
// Mensagem de entrada:
//   { type: 'stitch', tileUrls: string[], preset: DisplayPreset }
//   (DisplayPreset tem positions[].overlap_left/overlap_right, tile_width, tile_height,
//    canvas_total_width, crop_x_start, width)
//
// Mensagens de saída:
//   { type: 'progress', value: 0-100 }
//   { type: 'done', blob: Blob }         ← PNG final
//   { type: 'error', message: string }

importScripts('https://docs.opencv.org/4.8.0/opencv.js');

let _cvReady = false;
cv['onRuntimeInitialized'] = () => { _cvReady = true; };

self.onmessage = async function (e) {
  if (e.data.type !== 'stitch') return;
  try {
    while (!_cvReady) await delay(100);
    await stitch(e.data.tileUrls, e.data.preset);
  } catch (err) {
    self.postMessage({ type: 'error', message: err.message ?? String(err) });
  }
};

// ─── Pipeline principal ───────────────────────────────────────────────────────

async function stitch(tileUrls, preset) {
  const { tile_width, tile_height, canvas_total_width, crop_x_start, width, positions } = preset;

  progress(5);

  // 1. Download + decodificar todos os tiles como CV_16SC3 (formato esperado pelo blender)
  const tileMats = [];
  for (let i = 0; i < tileUrls.length; i++) {
    tileMats.push(await fetchAsMat16SC3(tileUrls[i], tile_width, tile_height));
    progress(5 + (i + 1) / tileUrls.length * 45);
  }

  progress(50);

  // 2. Inicializar MultiBandBlender
  //    Parâmetros: try_gpu=false, num_bands=5 (sweet spot para ramps de 35%)
  const blender = new cv.detail_MultiBandBlender(false, 5);
  blender.prepare(new cv.Rect(0, 0, canvas_total_width, tile_height));

  // 3. Construir máscara de gradiente e alimentar cada tile
  for (let i = 0; i < tileMats.length; i++) {
    const pos = positions[i];
    const mask = buildGradientMask(tile_width, tile_height, pos.overlap_left, pos.overlap_right);
    blender.feed(tileMats[i], mask, new cv.Point(pos.x, 0));
    mask.delete();
    tileMats[i].delete();
    progress(50 + (i + 1) / tileMats.length * 30);
  }

  progress(83);

  // 4. Blend final
  const dst16 = new cv.Mat();
  const dstMask = new cv.Mat();
  blender.blend(dst16, dstMask);
  blender.delete();
  dstMask.delete();

  // 5. CV_16SC3 → CV_8UC3
  const dst8 = new cv.Mat();
  dst16.convertTo(dst8, cv.CV_8UC3);
  dst16.delete();

  progress(88);

  // 6. Crop pelo crop_x_start do preset
  //    Positivo = cortar crop_x_start px da esquerda para alinhar a janela de exibição.
  //    Negativo = canvas já é menor que a largura alvo; usar como está a partir de x=0.
  const cropX = Math.max(0, crop_x_start);
  const outputW = Math.min(width, dst8.cols - cropX);
  const cropped = dst8.roi(new cv.Rect(cropX, 0, outputW, tile_height));

  // 7. Converter para RGBA e exportar via OffscreenCanvas → Blob
  const rgba = new cv.Mat();
  cv.cvtColor(cropped, rgba, cv.COLOR_BGR2RGBA);

  const canvas = new OffscreenCanvas(outputW, tile_height);
  const ctx = canvas.getContext('2d');
  const imgData = new ImageData(new Uint8ClampedArray(rgba.data), outputW, tile_height);
  ctx.putImageData(imgData, 0, 0);

  rgba.delete();
  dst8.delete(); // cropped é roi de dst8, não deletar separado

  progress(95);

  const blob = await canvas.convertToBlob({ type: 'image/png' });
  progress(100);
  self.postMessage({ type: 'done', blob });
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

// Baixa uma imagem e converte para cv.Mat CV_16SC3 (formato necessário para MultiBandBlender).
async function fetchAsMat16SC3(url, width, height) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Falha ao baixar tile: ${url} (${res.status})`);
  const blob = await res.blob();

  // Resize para tile_width × tile_height (HF gera em tile_generation_resolution maior)
  const bitmap = await createImageBitmap(blob, { resizeWidth: width, resizeHeight: height, resizeQuality: 'high' });

  const canvas = new OffscreenCanvas(width, height);
  const ctx = canvas.getContext('2d');
  ctx.drawImage(bitmap, 0, 0, width, height);
  bitmap.close();

  const imageData = ctx.getImageData(0, 0, width, height);

  // RGBA 8bit → BGR 8bit → BGR 16bit signed
  const mat8UC4 = cv.matFromImageData(imageData);
  const mat8UC3 = new cv.Mat();
  cv.cvtColor(mat8UC4, mat8UC3, cv.COLOR_RGBA2BGR);
  mat8UC4.delete();

  const mat16SC3 = new cv.Mat();
  mat8UC3.convertTo(mat16SC3, cv.CV_16SC3);
  mat8UC3.delete();

  return mat16SC3;
}

// Constrói máscara CV_8UC1 com ramp linear nas zonas de overlap.
//   overlap_left  > 0 → ramp 0→255 de x=0 até x=overlap_left  (tile entra pelo lado esquerdo)
//   overlap_right > 0 → ramp 255→0 de x=(w-overlap_right) até x=w (tile sai pelo lado direito)
//   Resto da máscara = 255 (totalmente opaco)
function buildGradientMask(width, height, overlap_left, overlap_right) {
  const data = new Uint8Array(width * height).fill(255);

  if (overlap_left > 0) {
    for (let x = 0; x < overlap_left; x++) {
      const alpha = Math.round(255 * x / overlap_left);
      for (let y = 0; y < height; y++) data[y * width + x] = alpha;
    }
  }

  if (overlap_right > 0) {
    const start = width - overlap_right;
    for (let x = start; x < width; x++) {
      const alpha = Math.round(255 * (width - 1 - x) / overlap_right);
      for (let y = 0; y < height; y++) data[y * width + x] = alpha;
    }
  }

  const mat = new cv.Mat(height, width, cv.CV_8UC1);
  mat.data.set(data);
  return mat;
}

function progress(value) {
  self.postMessage({ type: 'progress', value });
}

function delay(ms) {
  return new Promise(r => setTimeout(r, ms));
}
