// ============================================================
// ACCESSORY ENGINE — Low-poly 3D accessories for the avatar
// Categories: headwear, eyewear, hair, face, neck
// ============================================================

function seededRandom(seed) {
  let s = Math.abs(seed) || 1;
  return () => {
    s = (s * 1664525 + 1013904223) & 0xffffffff;
    return (s >>> 0) / 0xffffffff;
  };
}

function rotX(p, a) {
  const c = Math.cos(a), s = Math.sin(a);
  return { x: p.x, y: p.y * c - p.z * s, z: p.y * s + p.z * c };
}
function rotY(p, a) {
  const c = Math.cos(a), s = Math.sin(a);
  return { x: p.x * c + p.z * s, y: p.y, z: -p.x * s + p.z * c };
}
function proj(p, scale, cx, cy) {
  return { sx: p.x * scale + cx, sy: -p.y * scale + cy, z: p.z };
}

function applyTransform(verts, rx, ry, scale, cx, cy) {
  return verts.map(v => {
    let p = rotX(v, rx);
    p = rotY(p, ry);
    return proj(p, scale, cx, cy);
  });
}

function drawTris(ctx, pverts, tris, color) {
  ctx.fillStyle = color;
  ctx.strokeStyle = color;
  ctx.lineWidth = 0.8;
  for (const tri of tris) {
    const a = pverts[tri[0]], b = pverts[tri[1]], c = pverts[tri[2]];
    if (!a || !b || !c) continue;
    const nz = (b.sx - a.sx) * (c.sy - a.sy) - (b.sy - a.sy) * (c.sx - a.sx);
    if (nz >= 0) continue; // backface
    ctx.beginPath();
    ctx.moveTo(a.sx, a.sy);
    ctx.lineTo(b.sx, b.sy);
    ctx.lineTo(c.sx, c.sy);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
  }
}

// ── ACCESSORY DEFINITIONS ────────────────────────────────────────────────────────

const HEADWEAR = {
  none: null,
  beanie: (ac) => ({
    verts: [
      { x: 0,    y: 1.30, z: 0.05 },   // 0 top center
      { x:-0.85, y: 0.90, z: 0.15 },   // 1 left front
      { x: 0.85, y: 0.90, z: 0.15 },   // 2 right front
      { x: 0,    y: 0.90, z:-0.95 },   // 3 back center
      { x:-0.80, y: 0.70, z: 0.40 },   // 4 brim left
      { x: 0.80, y: 0.70, z: 0.40 },   // 5 brim right
      { x: 0,    y: 1.00, z: 0.50 },   // 6 front peak
    ],
    tris: [[0,2,1],[0,1,4],[0,2,3],[0,3,1],[0,4,6],[0,6,5],[0,5,2]],
    color: ac, colorDark: shiftL(ac, -25),
  }),
  trucker_hat: (ac) => ({
    verts: [
      { x: 0,    y: 1.10, z: 0.00 },   // 0 crown top
      { x:-0.85, y: 0.85, z:-0.10 },   // 1 crown L
      { x: 0.85, y: 0.85, z:-0.10 },   // 2 crown R
      { x: 0,    y: 0.85, z:-0.90 },   // 3 crown Back
      { x:-0.45, y: 0.80, z: 0.45 },   // 4 brim base L
      { x: 0.45, y: 0.80, z: 0.45 },   // 5 brim base R
      { x: 0,    y: 0.75, z: 1.10 },   // 6 brim tip
      { x:-0.65, y: 0.75, z: 0.85 },   // 7 brim side L
      { x: 0.65, y: 0.75, z: 0.85 },   // 8 brim side R
    ],
    tris: [
      [0,2,1],[0,1,3],[0,3,2],
      [4,5,6],[4,6,7],[5,8,6]
    ],
    color: '#FFF', colorDark: ac,
  }),
  shush_cap: (ac) => ({ // Snapback
    verts: [
      { x: 0,    y: 1.15, z: 0.05 },
      { x:-0.80, y: 0.80, z: 0.00 },
      { x: 0.80, y: 0.80, z: 0.00 },
      { x: 0,    y: 0.80, z:-0.85 },
      { x:-0.75, y: 0.85, z: 0.65 },
      { x: 0.75, y: 0.85, z: 0.65 },
      { x: 0,    y: 0.85, z: 0.65 },
    ],
    tris: [[0,2,1],[0,1,3],[0,3,2],[4,6,5]],
    color: '#111', colorDark: ac,
  }),
  cowboy: (ac) => ({
    verts: [
      { x: 0,    y: 1.05, z: 0.05 },
      { x:-0.72, y: 0.82, z: 0.05 },
      { x: 0.72, y: 0.82, z: 0.05 },
      { x: 0,    y: 0.82, z:-0.72 },
      { x:-1.10, y: 0.72, z: 0.20 },
      { x: 1.10, y: 0.72, z: 0.20 },
      { x: 0,    y: 0.72, z: 1.05 },
      { x:-1.05, y: 0.72, z:-0.30 },
      { x: 1.05, y: 0.72, z:-0.30 },
    ],
    tris: [
      [0,2,1],[0,1,3],[0,3,2],
      [1,4,3],[2,3,5],
      [1,6,4],[2,5,6],
      [1,2,6],
      [3,7,1],[3,2,8],
    ],
    color: '#8B4513', colorDark: '#5C2E00',
  }),
};

const EYEWEAR = {
  none: null,
  shutter_shades: (ac) => ({
    type: 'canvas2d',
    draw: (ctx, eyeR, eyeL, scale) => {
      const w = 0.18 * scale, h = 0.08 * scale;
      ctx.fillStyle = ac;
      // Draw slats
      for (let i = 0; i < 5; i++) {
        const offset = i * h * 0.4;
        ctx.fillRect(eyeR.sx - w, eyeR.sy - h + offset, w * 2, h * 0.15);
        ctx.fillRect(eyeL.sx - w, eyeL.sy - h + offset, w * 2, h * 0.15);
      }
      ctx.strokeStyle = ac;
      ctx.lineWidth = 2;
      ctx.strokeRect(eyeR.sx - w, eyeR.sy - h, w * 2, h * 2);
      ctx.strokeRect(eyeL.sx - w, eyeL.sy - h, w * 2, h * 2);
      ctx.beginPath();
      ctx.moveTo(eyeR.sx + w, eyeR.sy);
      ctx.lineTo(eyeL.sx - w, eyeL.sy);
      ctx.stroke();
    }
  }),
  pixel_sunglasses: (ac) => ({
    type: 'canvas2d',
    draw: (ctx, eyeR, eyeL, scale) => {
      ctx.fillStyle = '#000';
      const sz = 0.12 * scale;
      ctx.fillRect(eyeR.sx - sz * 1.5, eyeR.sy - sz, sz * 3, sz * 1.8);
      ctx.fillRect(eyeL.sx - sz * 1.5, eyeL.sy - sz, sz * 3, sz * 1.8);
      ctx.fillRect(eyeR.sx + sz * 1.5, eyeR.sy - sz * 0.2, sz * 2, sz * 0.4);
      ctx.fillStyle = '#FFF';
      ctx.fillRect(eyeR.sx - sz, eyeR.sy - sz * 0.6, sz * 0.4, sz * 0.4);
      ctx.fillRect(eyeL.sx - sz, eyeL.sy - sz * 0.6, sz * 0.4, sz * 0.4);
    }
  }),
  glasses: (ac) => ({
    type: 'canvas2d',
    draw: (ctx, eyeR, eyeL, scale) => {
      const sz = 0.10 * scale;
      ctx.strokeStyle = '#333';
      ctx.lineWidth = Math.max(2, scale * 0.015);
      ctx.strokeRect(eyeR.sx - sz * 1.4, eyeR.sy - sz * 0.8, sz * 2.8, sz * 1.6);
      ctx.strokeRect(eyeL.sx - sz * 1.4, eyeL.sy - sz * 0.8, sz * 2.8, sz * 1.6);
      ctx.beginPath();
      ctx.moveTo(eyeR.sx + sz * 1.4, eyeR.sy);
      ctx.lineTo(eyeL.sx - sz * 1.4, eyeL.sy);
      ctx.stroke();
    }
  }),
};

const HAIR = {
  none: null,
  mohawk: (ac) => ({
    verts: [
      { x: 0,    y: 1.55, z: 0.10 },
      { x: 0,    y: 1.35, z: 0.40 },
      { x: 0,    y: 1.10, z: 0.40 },
      { x: 0.08, y: 1.40, z: 0.05 },
      { x:-0.08, y: 1.40, z: 0.05 },
      { x: 0.08, y: 0.90, z: 0.00 },
      { x:-0.08, y: 0.90, z: 0.00 },
    ],
    tris: [[0,3,4],[0,1,3],[0,4,1],[1,2,3],[1,4,2],[3,5,4],[4,6,3],[5,6,4]],
    color: ac, colorDark: shiftL(ac, -20),
  }),
  afro: (ac) => ({
    verts: [
      { x: 0,    y: 1.50, z: 0.00 },
      { x: 0.80, y: 1.10, z: 0.30 },
      { x:-0.80, y: 1.10, z: 0.30 },
      { x: 0.70, y: 1.10, z:-0.50 },
      { x:-0.70, y: 1.10, z:-0.50 },
      { x: 0,    y: 0.90, z:-0.80 },
      { x: 0.95, y: 0.88, z:-0.05 },
      { x:-0.95, y: 0.88, z:-0.05 },
    ],
    tris: [
      [0,1,2],[0,3,1],[0,2,4],[0,4,5],[0,5,3],
      [1,6,2],[2,7,4],[3,6,1],[4,7,2],
      [1,3,6],[2,4,7],[3,5,6],[4,5,7],[5,7,6],
    ],
    color: '#2D2006', colorDark: '#1A1200',
  }),
};

const FACE_ACC = {
  none: null,
  mustache: (ac) => ({
    type: 'canvas2d',
    draw: (ctx, noseP, scale) => {
      ctx.fillStyle = '#2D2006';
      const w = scale * 0.15, h = scale * 0.04;
      const y = noseP.sy + scale * 0.08;
      ctx.beginPath();
      ctx.ellipse(noseP.sx - w * 0.55, y, w * 0.55, h, -0.15, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.ellipse(noseP.sx + w * 0.55, y, w * 0.55, h, 0.15, 0, Math.PI * 2);
      ctx.fill();
    }
  }),
  cigarette: () => ({
    type: 'canvas2d',
    draw: (ctx, noseP, scale) => {
      const y = noseP.sy + scale * 0.16;
      ctx.fillStyle = '#FFF8F0';
      ctx.fillRect(noseP.sx + scale * 0.05, y - scale * 0.025, scale * 0.22, scale * 0.05);
      ctx.fillStyle = '#FF8C40';
      ctx.beginPath();
      ctx.arc(noseP.sx + scale * 0.27, y, scale * 0.025, 0, Math.PI * 2);
      ctx.fill();
    }
  }),
};

const NECK_ACC = {
  none: null,
  headphones: (ac) => ({
    verts: [
      // Headband arc
      { x: 0,    y: 1.12, z:-0.20 },
      { x: 0.78, y: 0.98, z:-0.18 },
      { x:-0.78, y: 0.98, z:-0.18 },
      // Ear cups
      { x: 0.92, y: 0.85, z:-0.15 },
      { x: 0.82, y: 0.70, z:-0.12 },
      { x:-0.92, y: 0.85, z:-0.15 },
      { x:-0.82, y: 0.70, z:-0.12 },
    ],
    tris: [
      [0,1,2],
      [1,3,0],[3,4,1],
      [2,0,5],[0,6,5],
    ],
    color: ac, colorDark: shiftL(ac, -30),
  }),
  chain: () => ({
    type: 'canvas2d',
    draw: (ctx, bottomP, scale) => {
      ctx.strokeStyle = '#D4AF37';
      ctx.lineWidth = Math.max(2, scale * 0.02);
      ctx.beginPath();
      ctx.arc(bottomP.sx, bottomP.sy + scale * 0.1, scale * 0.22, 0.1 * Math.PI, 0.9 * Math.PI);
      ctx.stroke();
    }
  }),
};

// ── Helper: Better HSL-based color shift ────────────────────────────────────────
function shiftL(hex, amt) {
  // Convert hex to HSL for better control
  let r = parseInt(hex.slice(1,3),16), g = parseInt(hex.slice(3,5),16), b = parseInt(hex.slice(5,7),16);
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h, s, l = (max + min) / 2;
  if (max === min) h = s = 0;
  else {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
    }
    h /= 6;
  }
  l = Math.max(0, Math.min(1, l + amt / 100));
  
  // Back to RGB
  const hue2rgb = (p, q, t) => {
    if (t < 0) t += 1; if (t > 1) t -= 1;
    if (t < 1/6) return p + (q - p) * 6 * t;
    if (t < 1/2) return q;
    if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
    return p;
  };
  const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
  const p = 2 * l - q;
  const f = v => Math.round(hue2rgb(p, q, v) * 255).toString(16).padStart(2,'0');
  return `#${f(h+1/3)}${f(h)}${f(h-1/3)}`;
}

// ── Derive accessories from seed ─────────────────────────────────────────────────
export function accessoriesFromSeed(seed) {
  const rng = seededRandom(seed || 1);
  const pick = (obj) => {
    const keys = Object.keys(obj);
    return keys[Math.floor(rng() * keys.length)];
  };
  return {
    headwear: pick(HEADWEAR),
    eyewear:  pick(EYEWEAR),
    hair:     pick(HAIR),
    face:     pick(FACE_ACC),
    neck:     pick(NECK_ACC),
  };
}

// ── Main render function ─────────────────────────────────────────────────────────
export function renderAccessories(ctx, geo, pv, rx, ry, scale, cx, cy, accessories, accentColor) {
  if (!accessories) return;
  const ac = accentColor || '#3b82f6';

  // Helper: get projected point from accessory vert
  const pvAcc = (verts) => applyTransform(verts.map(v => ({...v})), rx, ry, scale, cx, cy);

  // ── HEADWEAR ────────────────────────────────────────────────────────────────────
  const hw = HEADWEAR[accessories.headwear];
  if (hw) {
    const def = hw(ac);
    const pvH = pvAcc(def.verts);
    drawTris(ctx, pvH, def.tris, def.color);
  }

  // ── HAIR ─────────────────────────────────────────────────────────────────────────
  const hr = HAIR[accessories.hair];
  if (hr) {
    const def = hr(ac);
    if (def.type === 'canvas2d') { /* skip */ }
    else {
      const pvHr = pvAcc(def.verts);
      drawTris(ctx, pvHr, def.tris, def.color);
    }
  }

  // ── NECK ─────────────────────────────────────────────────────────────────────────
  const nk = NECK_ACC[accessories.neck];
  if (nk) {
    const def = nk(ac);
    if (def?.type === 'canvas2d') {
      // Use projected chin center as reference
      const chinIdx = geo.verts.findIndex(v => v.id === 'chinC');
      if (chinIdx !== -1) def.draw(ctx, pv[chinIdx], scale);
    } else if (def?.verts) {
      const pvNk = pvAcc(def.verts);
      drawTris(ctx, pvNk, def.tris, def.color);
    }
  }

  // ── EYEWEAR ──────────────────────────────────────────────────────────────────────
  const ew = EYEWEAR[accessories.eyewear];
  if (ew) {
    const def = ew(ac);
    if (def?.type === 'canvas2d') {
      // Find projected eye centers
      const eyeRIdx = geo.verts.findIndex(v => v.id === 'eyeTopR');
      const eyeLIdx = geo.verts.findIndex(v => v.id === 'eyeTopL');
      if (eyeRIdx !== -1 && eyeLIdx !== -1) {
        def.draw(ctx, pv[eyeRIdx], pv[eyeLIdx], scale);
      }
    }
  }

  // ── FACE ACCESSORIES ─────────────────────────────────────────────────────────────
  const fa = FACE_ACC[accessories.face];
  if (fa) {
    const def = fa(ac);
    if (def?.type === 'canvas2d') {
      const noseIdx = geo.verts.findIndex(v => v.id === 'nostTip');
      if (noseIdx !== -1) def.draw(ctx, pv[noseIdx], scale);
    }
  }
}
