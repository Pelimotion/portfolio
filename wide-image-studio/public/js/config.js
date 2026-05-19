// Constantes públicas do cliente — seguras para expor no frontend.
// SUPABASE_ANON_KEY é a chave pública (anon), projetada para uso client-side com RLS.
// NUNCA colocar SUPABASE_SERVICE_ROLE_KEY ou HF credentials aqui.

const CONFIG = {
  SUPABASE_URL: 'https://gfaqnkmmbozmhroicqyc.supabase.co',
  SUPABASE_ANON_KEY: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdmYXFua21tYm96bWhyb2ljcXljIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg2OTcxNDQsImV4cCI6MjA5NDI3MzE0NH0.vYhdQjfr1d92t_uhU504XyP2UxkANUO96X1hKOu3e-g',
  EDGE_URL: 'https://wide-api-ilgmz.bunny.run',
  LOGIN_URL: 'https://pelimotion.art/login',

  DISPLAY_PRESETS: {
    pelimotion_wide_10137: {
      label: 'Padrão 10137×1320 (21:9)',
      width: 10137, height: 1320, tile_count: 5,
      tile_width: 3072, tile_height: 1320,
      overlap_px: 1075, canvas_total_width: 11060, crop_x_start: 461,
      tile_generation_resolution: '4096x1755',
      master_resolution: '3072x1320',
      master_model: 'seedream-5-lite', tile_model: 'nano-banana-pro',
      estimated_cost_usd: 3.0, estimated_duration_seconds: 150,
      positions: [
        { tile: 1, x: -461,  overlap_left: 0,    overlap_right: 1075 },
        { tile: 2, x: 1536,  overlap_left: 1075, overlap_right: 1075 },
        { tile: 3, x: 3533,  overlap_left: 1075, overlap_right: 1075 },
        { tile: 4, x: 5530,  overlap_left: 1075, overlap_right: 1075 },
        { tile: 5, x: 7527,  overlap_left: 1075, overlap_right: 0    },
      ],
    },
    pelimotion_wide_10137_high_detail: {
      label: 'Alta densidade 10137×1320 (16:9)',
      width: 10137, height: 1320, tile_count: 7,
      tile_width: 2016, tile_height: 1344,
      overlap_px: 806, canvas_total_width: 10276, crop_x_start: 69,
      tile_generation_resolution: '4032x2268',
      master_resolution: '2016x1344',
      master_model: 'seedream-5-lite', tile_model: 'nano-banana-pro',
      estimated_cost_usd: 4.2, estimated_duration_seconds: 200,
      positions: [
        { tile: 1, x: -69,   overlap_left: 0,   overlap_right: 806 },
        { tile: 2, x: 1210,  overlap_left: 806, overlap_right: 806 },
        { tile: 3, x: 2419,  overlap_left: 806, overlap_right: 806 },
        { tile: 4, x: 3629,  overlap_left: 806, overlap_right: 806 },
        { tile: 5, x: 4838,  overlap_left: 806, overlap_right: 806 },
        { tile: 6, x: 6048,  overlap_left: 806, overlap_right: 806 },
        { tile: 7, x: 7257,  overlap_left: 806, overlap_right: 0   },
      ],
    },
    pelimotion_wide_10137_fast_draft: {
      label: 'Rascunho rápido 10137×1320 (~$0.40)',
      width: 10137, height: 1320, tile_count: 4,
      tile_width: 3072, tile_height: 1320,
      overlap_px: 922, canvas_total_width: 9522, crop_x_start: -307,
      tile_generation_resolution: '3072x1320',
      master_resolution: '2048x880',
      master_model: 'seedream-5-lite', tile_model: 'nano-banana-2',
      estimated_cost_usd: 0.4, estimated_duration_seconds: 60,
      positions: [
        { tile: 1, x: -307,  overlap_left: 0,   overlap_right: 922 },
        { tile: 2, x: 1843,  overlap_left: 922, overlap_right: 922 },
        { tile: 3, x: 3993,  overlap_left: 922, overlap_right: 922 },
        { tile: 4, x: 6143,  overlap_left: 922, overlap_right: 0   },
      ],
    },
  },

  STYLE_PRESETS: {
    cinematic_realistic_2k: {
      label: 'Cinematográfico realista 2K',
      prompt_suffix: 'cinematic lighting, professional editorial photography, ultra-detailed, soft volumetric haze, depth of field, 35mm film grain, color graded',
      negative_suffix: 'cartoon, illustration, low quality, oversaturated, lens flare, text, logo, watermark',
    },
    editorial_branding: {
      label: 'Editorial / branding Pelimotion',
      prompt_suffix: 'editorial composition, brand-friendly negative space, refined typography-ready, sophisticated color palette, minimalist accents',
      negative_suffix: 'busy, cluttered, amateur, low contrast, distracting elements',
    },
    motion_design_dramatic: {
      label: 'Motion design dramático',
      prompt_suffix: 'dramatic lighting with strong directional light source, high contrast, dynamic composition, motion-friendly negative space for animation, bold geometric forms',
      negative_suffix: 'flat, static, washed out, low energy',
    },
    documentary_natural: {
      label: 'Documental natural',
      prompt_suffix: 'documentary photography style, natural unmanipulated lighting, candid composition, authentic textures, journalistic framing',
      negative_suffix: 'staged, posed, artificial, overprocessed, HDR-look',
    },
  },
};
