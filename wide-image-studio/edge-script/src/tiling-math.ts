// Pure tiling geometry — no side effects, no I/O.
// Presets are embedded here so the edge bundle stays self-contained (no filesystem reads on Bunny).
// Source of truth: presets/displays.json (keep in sync manually when presets change).

export interface DisplayPreset {
  label: string;
  width: number;
  height: number;
  aspect_ratio: number;
  tile_count: number;
  tile_aspect: string;
  tile_width: number;
  tile_height: number;
  overlap_pct: number;
  overlap_px: number;
  canvas_total_width: number;
  crop_x_start: number;
  tile_model: string;
  tile_generation_resolution: string;
  master_model: string;
  master_resolution: string;
  estimated_cost_usd: number;
  estimated_duration_seconds: number;
  notes?: string;
  positions: Array<{
    tile: number;
    x: number;
    overlap_left: number;
    overlap_right: number;
  }>;
}

export interface TilePosition {
  index: number;
  x: number;          // position on the canvas (pixels, may be negative for tile 1)
  width: number;      // tile_width from preset
  height: number;     // tile_height from preset
  overlap_left: number;
  overlap_right: number;
  master_crop: {      // crop of the master plate that maps to this tile's region
    x: number;
    y: number;
    width: number;
    height: number;
  };
}

export interface OverlapMask {
  tile_index: number;
  // left: gradient region at the left edge — ramp from 0 (transparent) at x_start to 255 (opaque) at x_end
  left: { x_start: number; x_end: number } | null;
  // right: gradient region at the right edge — ramp from 255 (opaque) at x_start to 0 (transparent) at x_end
  right: { x_start: number; x_end: number } | null;
}

const PRESETS: Record<string, DisplayPreset> = {
  pelimotion_wide_10137: {
    label: "Display Pelimotion 10137×1320 (padrão)",
    width: 10137,
    height: 1320,
    aspect_ratio: 7.6795,
    tile_count: 5,
    tile_aspect: "21:9",
    tile_width: 3072,
    tile_height: 1320,
    overlap_pct: 0.35,
    overlap_px: 1075,
    canvas_total_width: 11060,
    crop_x_start: 461,
    tile_model: "nano-banana-pro",
    tile_generation_resolution: "4096x1755",
    master_model: "seedream-5-lite",
    master_resolution: "3072x1320",
    estimated_cost_usd: 3.0,
    estimated_duration_seconds: 150,
    positions: [
      { tile: 1, x: -461, overlap_left: 0,    overlap_right: 1075 },
      { tile: 2, x: 1536, overlap_left: 1075, overlap_right: 1075 },
      { tile: 3, x: 3533, overlap_left: 1075, overlap_right: 1075 },
      { tile: 4, x: 5530, overlap_left: 1075, overlap_right: 1075 },
      { tile: 5, x: 7527, overlap_left: 1075, overlap_right: 0    },
    ],
  },

  pelimotion_wide_10137_high_detail: {
    label: "Display Pelimotion 10137×1320 (alta densidade)",
    width: 10137,
    height: 1320,
    aspect_ratio: 7.6795,
    tile_count: 7,
    tile_aspect: "16:9",
    tile_width: 2016,
    tile_height: 1344,
    overlap_pct: 0.40,
    overlap_px: 806,
    canvas_total_width: 10276,
    crop_x_start: 69,
    tile_model: "nano-banana-pro",
    tile_generation_resolution: "4032x2268",
    master_model: "seedream-5-lite",
    master_resolution: "2016x1344",
    estimated_cost_usd: 4.2,
    estimated_duration_seconds: 200,
    notes: "Mais detalhe local; 40% mais caro que o padrão. Use quando o conteúdo tiver muitos elementos pequenos.",
    positions: [
      { tile: 1, x: -69,  overlap_left: 0,   overlap_right: 806 },
      { tile: 2, x: 1210, overlap_left: 806, overlap_right: 806 },
      { tile: 3, x: 2419, overlap_left: 806, overlap_right: 806 },
      { tile: 4, x: 3629, overlap_left: 806, overlap_right: 806 },
      { tile: 5, x: 4838, overlap_left: 806, overlap_right: 806 },
      { tile: 6, x: 6048, overlap_left: 806, overlap_right: 806 },
      { tile: 7, x: 7257, overlap_left: 806, overlap_right: 0   },
    ],
  },

  pelimotion_wide_10137_fast_draft: {
    label: "Display Pelimotion 10137×1320 (rascunho rápido)",
    width: 10137,
    height: 1320,
    aspect_ratio: 7.6795,
    tile_count: 4,
    tile_aspect: "21:9",
    tile_width: 3072,
    tile_height: 1320,
    overlap_pct: 0.30,
    overlap_px: 922,
    canvas_total_width: 9522,
    crop_x_start: -307,
    tile_model: "nano-banana-2",
    tile_generation_resolution: "3072x1320",
    master_model: "seedream-5-lite",
    master_resolution: "2048x880",
    estimated_cost_usd: 0.4,
    estimated_duration_seconds: 60,
    notes: "Draft para validar composição antes do render final. ~7× mais barato que o padrão.",
    positions: [
      { tile: 1, x: -307, overlap_left: 0,   overlap_right: 922 },
      { tile: 2, x: 1843, overlap_left: 922, overlap_right: 922 },
      { tile: 3, x: 3993, overlap_left: 922, overlap_right: 922 },
      { tile: 4, x: 6143, overlap_left: 922, overlap_right: 0   },
    ],
  },
};

export function loadPreset(presetKey: string): DisplayPreset {
  const preset = PRESETS[presetKey];
  if (!preset) {
    const available = Object.keys(PRESETS).join(", ");
    throw Object.assign(
      new Error(`Unknown preset "${presetKey}". Available: ${available}`),
      { status: 400 },
    );
  }
  return preset;
}

// Returns tile positions enriched with the corresponding crop of the master plate.
// The master plate represents the full canvas at master_resolution dimensions,
// so each tile's region is scaled proportionally to find its crop coordinates.
export function computeTilePositions(preset: DisplayPreset): TilePosition[] {
  const [masterW, masterH] = preset.master_resolution.split("x").map(Number);
  const scaleX = masterW / preset.canvas_total_width;

  return preset.positions.map((pos, i) => {
    const rawX = pos.x * scaleX;
    const rawEnd = (pos.x + preset.tile_width) * scaleX;

    const cropX = Math.max(0, Math.round(rawX));
    const cropEnd = Math.min(masterW, Math.round(rawEnd));

    return {
      index: i,
      x: pos.x,
      width: preset.tile_width,
      height: preset.tile_height,
      overlap_left: pos.overlap_left,
      overlap_right: pos.overlap_right,
      master_crop: {
        x: cropX,
        y: 0,
        width: cropEnd - cropX,
        height: masterH,
      },
    };
  });
}

// Returns the gradient mask regions for each tile.
// Used by the client-side stitcher (OpenCV.js multi-band blender) to blend overlap zones.
// left region:  ramp 0 → 255 (tile is entering from the right of the previous tile)
// right region: ramp 255 → 0 (this tile yields to the next tile)
export function buildOverlapMasks(preset: DisplayPreset): OverlapMask[] {
  return preset.positions.map((pos, i) => ({
    tile_index: i,
    left: pos.overlap_left > 0
      ? { x_start: 0, x_end: pos.overlap_left }
      : null,
    right: pos.overlap_right > 0
      ? { x_start: preset.tile_width - pos.overlap_right, x_end: preset.tile_width }
      : null,
  }));
}

export function estimateCost(preset: DisplayPreset): number {
  return preset.estimated_cost_usd;
}
