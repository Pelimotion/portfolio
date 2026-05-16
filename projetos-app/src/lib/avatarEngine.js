// ============================================================
// AVATAR ENGINE — PS1 Low-Poly 3D Face (High Detail)
// Flat-shaded, caricature-driven, eye-tracking, war paint
// ~200 triangles, pure Canvas 2D, no dependencies
// ============================================================
import { renderAccessories } from './accessoryEngine';

export function hashString(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash) + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

function seededRandom(seed) {
  let s = Math.abs(seed) || 1;
  return () => {
    s = (s * 1664525 + 1013904223) & 0xffffffff;
    return (s >>> 0) / 0xffffffff;
  };
}

export function seedToColors(seed, accentColor = '#3b82f6') {
  const rng = seededRandom(seed);
  const hue = Math.floor(rng() * 360);
  const sat = 15 + Math.floor(rng() * 45); // Less saturated for "human" look
  const light = 45 + Math.floor(rng() * 40);
  return {
    skinBase: `hsl(${hue}, ${sat}%, ${light}%)`,
    skinMid:  `hsl(${hue}, ${sat + 5}%, ${light - 8}%)`,
    skinDark: `hsl(${hue}, ${sat + 8}%, ${light - 18}%)`,
    paint: accentColor,
  };
}

// ── 3D Math ─────────────────────────────────────────────────────────────────────
function rotX(p, a) {
  const c = Math.cos(a), s = Math.sin(a);
  return { x: p.x, y: p.y * c - p.z * s, z: p.y * s + p.z * c };
}
function rotY(p, a) {
  const c = Math.cos(a), s = Math.sin(a);
  return { x: p.x * c + p.z * s, y: p.y, z: -p.x * s + p.z * c };
}
function project(p, scale, cx, cy) {
  return { sx: p.x * scale + cx, sy: -p.y * scale + cy, z: p.z };
}
function faceNormalZ(v0, v1, v2) {
  return (v1.sx - v0.sx) * (v2.sy - v0.sy) - (v1.sy - v0.sy) * (v2.sx - v0.sx);
}
function faceDepth(v0, v1, v2) {
  return (v0.z + v1.z + v2.z) / 3;
}

// ── Geometry Generation ──────────────────────────────────────────────────────────
function buildGeometry(seed) {
  const rng = seededRandom(seed);
  const r = (lo, hi) => lo + rng() * (hi - lo);

  // PS2-style Caricature params
  const jawW    = r(0.40, 0.75);
  const cheekW  = r(0.75, 1.10);
  const foreW   = r(0.60, 0.90);
  const headH   = r(1.00, 1.35);
  const chinY   = r(-0.95, -0.75);
  const browH   = r(-0.02, 0.28);
  const eyeY    = r(0.15, 0.35);
  const eyeZ    = r(0.15, 0.25);
  const eyeSpX  = r(0.25, 0.50);
  const eyeSz   = r(0.08, 0.16);
  const noseLen = r(0.35, 0.65);
  const noseZ   = r(0.45, 0.75);
  const noseTipSz = r(0.02, 0.15);
  const earSz   = r(0.15, 0.35);
  const mouthY  = r(-0.45, -0.25);
  const mouthW  = r(0.20, 0.50);

  const V = {};
  const def = (k, x, y, z) => { V[k] = { x, y, z, id: k }; };
  const sym = (k, x, y, z) => {
    V[k + 'R'] = { x,  y, z, id: k + 'R' };
    V[k + 'L'] = { x: -x, y, z, id: k + 'L' };
  };

  // VERTICES (Watertight Hull)
  def('top',      0, headH,        -0.10);
  def('foreC',    0, headH * 0.7,   0.45);
  def('browC',    0, eyeY + 0.15,   0.35);
  def('noseBr',   0, eyeY + 0.05,   0.48);
  def('noseTip',  0, eyeY - noseLen, noseZ + 0.15);
  def('nostB',    0, eyeY - noseLen - 0.05, noseZ);
  def('mouthC',   0, mouthY + 0.05, 0.52);
  def('lipLo',    0, mouthY - 0.05, 0.50);
  def('chinC',    0, chinY,         0.45);
  def('neckC',    0, chinY - 0.4,   0.10);
  def('backHead', 0, headH * 0.4,  -0.95);
  def('occipital',0, chinY * 0.3,  -0.85);

  sym('foreHi',   foreW * 0.5, headH * 0.85, 0.20);
  sym('temple',   foreW * 0.9, eyeY + 0.4,   0.15);
  sym('earTop',   cheekW * 1.1, eyeY + 0.1,  -0.15);
  sym('earMid',   cheekW * 1.1 + earSz, eyeY - 0.1, -0.20);
  sym('earBot',   cheekW * 1.0, eyeY - 0.3,  -0.15);
  sym('cheekHi',  cheekW * 0.8, eyeY + 0.1,   0.35);
  sym('cheekLo',  cheekW,       eyeY - 0.2,   0.35);
  sym('jawNode',  jawW,         chinY + 0.4,  0.15);
  sym('jawAngle', jawW * 1.1,   chinY + 0.2, -0.20);
  sym('chinSide', jawW * 0.5,   chinY + 0.1,  0.40);
  sym('neckS',    jawW * 0.7,   chinY - 0.3, -0.15);

  sym('browIn',   eyeSpX * 0.4, eyeY + browH + 0.1, eyeZ + 0.15);
  sym('browOut',  eyeSpX * 1.6, eyeY + browH + 0.05, eyeZ + 0.10);
  sym('eyeIn',    eyeSpX * 0.6, eyeY,        eyeZ + 0.10);
  sym('eyeOut',   eyeSpX * 1.5, eyeY - 0.02, eyeZ + 0.05);
  sym('eyeTop',   eyeSpX * 1.0, eyeY + eyeSz, eyeZ + 0.12);
  sym('eyeBot',   eyeSpX * 1.0, eyeY - eyeSz, eyeZ + 0.08);

  sym('noseRoot', 0.15, eyeY + 0.05, 0.45);
  sym('nostSide', 0.18, eyeY - noseLen + 0.05, noseZ + 0.10);
  sym('nostWing', 0.22, eyeY - noseLen - 0.02, noseZ);

  sym('mouthCo',  mouthW,       mouthY,       0.48);
  sym('upLip',    mouthW * 0.5, mouthY + 0.06, 0.54);
  sym('loLip',    mouthW * 0.5, mouthY - 0.06, 0.54);

  const verts = Object.values(V);
  const idx = {};
  verts.forEach((v, i) => { idx[v.id] = i; });
  const I = (k) => idx[k];

  // ── Face Triplets ──────────────────────────────────────────────────────────────
  const tris = [
    // Forehead & Crown
    ['highlight','top','foreHiR','foreHiL'],
    ['highlight','foreHiR','templeR','top'],
    ['highlight','foreHiL','top','templeL'],
    ['skin','foreHiR','foreC','foreHiL'],
    ['skin','foreC','browCR','browCL'], // placeholder browC if defined, wait
    ['skin','foreC','browInR','browInL'],
    ['skin','foreHiR','templeR','foreC'],
    ['skin','foreHiL','foreC','templeL'],

    // Brow Ridge
    ['brow','browInR','browOutR','eyeTopR'],
    ['brow','browInL','eyeTopL','browOutL'],
    ['skin','browInR','eyeTopR','eyeInR'],
    ['skin','browInL','eyeInL','eyeTopL'],

    // Nose
    ['skin','noseBr','noseRootR','eyeInR'],
    ['skin','noseBr','eyeInL','noseRootL'],
    ['skin','noseBr','noseTip','noseRootR'],
    ['skin','noseBr','noseRootL','noseTip'],
    ['noseSkin','noseTip','nostSideR','noseRootR'],
    ['noseSkin','noseTip','noseRootL','nostSideL'],
    ['noseSkin','nostSideR','nostWingR','nostB'],
    ['noseSkin','nostSideL','nostB','nostWingL'],
    ['noseSkin','noseTip','nostSideR','nostB'],
    ['noseSkin','noseTip','nostB','nostSideL'],

    // Cheeks
    ['skin','eyeOutR','cheekHiR','eyeTopR'],
    ['skin','eyeOutL','eyeTopL','cheekHiL'],
    ['skin','cheekHiR','cheekLoR','nostSideR'],
    ['skin','cheekHiL','nostSideL','cheekLoL'],
    ['skin','cheekLoR','mouthCoR','nostWingR'],
    ['skin','cheekLoL','nostWingL','mouthCoL'],
    ['skin','cheekHiR','eyeOutR','templeR'],
    ['skin','cheekHiL','templeL','eyeOutL'],

    // Ears
    ['shadow','templeR','earTopR','cheekHiR'],
    ['shadow','templeL','cheekHiL','earTopL'],
    ['shadow','earTopR','earMidR','cheekHiR'],
    ['shadow','earTopL','cheekHiL','earMidL'],
    ['shadow','earMidR','earBotR','cheekLoR'],
    ['shadow','earBotL','earMidL','cheekLoL'],

    // Mouth & Chin
    ['skin','mouthC','upLipR','mouthCoR'],
    ['skin','mouthC','mouthCoL','upLipL'],
    ['lip','upLipR','loLipR','mouthCoR'],
    ['lip','upLipL','mouthCoL','loLipL'],
    ['skin','mouthCoR','loLipR','chinSideR'],
    ['skin','mouthCoL','chinSideL','loLipL'],
    ['skin','lipLo','loLipR','loLipL'],
    ['skin','chinC','chinSideR','chinSideL'],

    // Jaw & Neck
    ['shadow','cheekLoR','jawNodeR','mouthCoR'],
    ['shadow','cheekLoL','mouthCoL','jawNodeL'],
    ['shadow','jawNodeR','jawAngleR','earBotR'],
    ['shadow','jawNodeL','earBotL','jawAngleL'],
    ['shadow','jawNodeR','chinSideR','jawAngleR'],
    ['shadow','jawNodeL','jawAngleL','chinSideL'],
    ['shadow','chinSideR','neckSR','neckC'],
    ['shadow','chinSideL','neckC','neckSL'],

    // Back & Watertight Sealing
    ['shadow','top','templeR','backHead'],
    ['shadow','top','backHead','templeL'],
    ['shadow','templeR','earTopR','backHead'],
    ['shadow','templeL','backHead','earTopL'],
    ['shadow','backHead','occipital','earBotR'],
    ['shadow','backHead','earBotL','occipital'],
    ['shadow','occipital','neckC','neckSR'],
    ['shadow','occipital','neckSL','neckC'],
  ].filter(t => t && t[1] && t[2] && t[3] && idx[t[1]] !== undefined && idx[t[2]] !== undefined && idx[t[3]] !== undefined);

  // Paint seeds for style
  const paintSeeds = new Set();
  const rngP = seededRandom(seed * 3);
  if (rngP() > 0.4) paintSeeds.add('foreHiR');
  if (rngP() > 0.4) paintSeeds.add('cheekHiR');
  if (rngP() > 0.4) paintSeeds.add('foreHiL');

  const facesList = tris.map(t => ({
    group: t[0], i0: I(t[1]), i1: I(t[2]), i2: I(t[3]),
    isPaint: paintSeeds.has(t[1]) || paintSeeds.has(t[2])
  }));

  const eyeFeats = {
    R: { cx: eyeSpX * 1.0, cy: eyeY, cz: eyeZ + 0.12, size: eyeSz * 0.9 },
    L: { cx: -eyeSpX * 1.0, cy: eyeY, cz: eyeZ + 0.12, size: eyeSz * 0.9 }
  };

  const noseFeat = { cx: 0, cy: eyeY - noseLen, cz: noseZ + 0.15 };

  return { verts, facesList, eyeFeats, noseFeat, rng: seededRandom(seed + 7) };
}

// ── Render ────────────────────────────────────────────────────────────────────────
// Animation state for lerping & idle
const animState = {
  curX: 0, curY: 0,
  targetX: 0, targetY: 0,
};

export function renderAvatar(canvas, seed, options = {}) {
  const { width = 200, height = 200, accentColor = '#3b82f6', mouseX = 0, mouseY = 0, accessories, time = 0 } = options;
  if (!canvas) return;

  // Smoother movement with lerp
  animState.targetX = mouseX;
  animState.targetY = mouseY;
  animState.curX += (animState.targetX - animState.curX) * 0.12;
  animState.curY += (animState.targetY - animState.curY) * 0.12;

  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  const colors = seedToColors(seed, accentColor);
  const geo = buildGeometry(seed);
  ctx.clearRect(0, 0, width, height);

  const cx = width * 0.50;
  const cy = height * 0.52;
  const scale = Math.min(width, height) * 0.42;

  // Idle movement (breathing & slight swaying)
  const idleX = Math.sin(time * 0.001) * 0.05;
  const idleY = Math.cos(time * 0.0015) * 0.03;

  // Fixed Rotation from mouse (corrected Y mapping)
  const ry = (animState.curX + idleX) * 0.65;
  const rx = (animState.curY + idleY) * 0.45; // Removed negative to fix inversion

  // Transform verts
  const pv = geo.verts.map(v => {
    let p = rotX(v, rx);
    p = rotY(p, ry);
    return project(p, scale, cx, cy);
  });

  // Build face render list
  const faces = geo.facesList.map(f => {
    const v0 = pv[f.i0], v1 = pv[f.i1], v2 = pv[f.i2];
    return {
      v0, v1, v2,
      nz: faceNormalZ(v0, v1, v2),
      depth: faceDepth(v0, v1, v2),
      group: f.group,
      isPaint: f.isPaint,
    };
  }).filter(f => f.nz < 0); // backface cull

  // Sort painter's algorithm
  faces.sort((a, b) => a.depth - b.depth);

  // Derive skin HSL
  const skinMatch = /hsl\((\d+),\s*(\d+)%,\s*(\d+)%\)/.exec(colors.skinBase) || [];
  const sh = +skinMatch[1] || 0;
  const ss = +skinMatch[2] || 40;
  const sl = +skinMatch[3] || 70;

  const groupColor = (group, shade, isPaint) => {
    if (isPaint) return accentColor;
    const lMod = shade * 28;
    const lFinal = Math.max(8, Math.min(92, sl - lMod));
    if (group === 'shadow')    return `hsl(${sh}, ${ss + 5}%, ${lFinal - 10}%)`;
    if (group === 'highlight') return `hsl(${sh}, ${ss - 5}%, ${lFinal + 6}%)`;
    if (group === 'noseSkin')  return `hsl(${sh}, ${ss + 3}%, ${lFinal - 4}%)`;
    if (group === 'lip')       return `hsl(${(sh + 10) % 360}, ${ss + 15}%, ${lFinal - 8}%)`;
    if (group === 'brow')      return `hsl(${sh}, ${ss}%, ${lFinal - 18}%)`;
    return `hsl(${sh}, ${ss}%, ${lFinal}%)`;
  };

  // Draw faces
  for (const f of faces) {
    const shade = (f.v0.z + f.v1.z + f.v2.z) / 3 - 0.1;
    const color = groupColor(f.group, shade, f.isPaint);
    ctx.beginPath();
    ctx.moveTo(f.v0.sx, f.v0.sy);
    ctx.lineTo(f.v1.sx, f.v1.sy);
    ctx.lineTo(f.v2.sx, f.v2.sy);
    ctx.closePath();
    ctx.fillStyle = color;
    ctx.strokeStyle = color;
    ctx.lineWidth = 0.8;
    ctx.fill();
    ctx.stroke();
  }

  // Draw bold sketch outlines
  ctx.strokeStyle = `rgba(0,0,0,0.18)`;
  ctx.lineWidth = 2;
  ctx.lineCap = 'round';
  const stroke = (ids) => {
    const pts = ids.map(id => {
      const vi = geo.verts.findIndex(v => v.id === id);
      return vi !== -1 ? pv[vi] : null;
    }).filter(Boolean);
    if (pts.length < 2) return;
    ctx.beginPath();
    ctx.moveTo(pts[0].sx, pts[0].sy);
    for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i].sx, pts[i].sy);
    ctx.stroke();
  };

  // Key outline strokes (jaw, brow, nose)
  stroke(['jawR', 'chinR', 'chinC', 'chinL', 'jawL']);
  stroke(['browInR', 'browOutR']);
  stroke(['browInL', 'browOutL']);
  stroke(['nostTip', 'nostWingR']);
  stroke(['nostTip', 'nostWingL']);
  stroke(['mouthCoR', 'upLipR', 'mouthC', 'upLipL', 'mouthCoL']);
  stroke(['mouthCoR', 'loLipR', 'lowlipC', 'loLipL', 'mouthCoL']);

  // ── Draw Eyes ─────────────────────────────────────────────────────────────────
  const drawEye = (feat) => {
    let p = rotX(feat, rx);
    p = rotY(p, ry);
    const ep = project(p, scale, cx, cy);
    if (ep.z < -0.05) return;
    const es = feat.size * scale;

    // Sclera (white-ish, flat-shaded dark to match PS1 style)
    ctx.beginPath();
    ctx.ellipse(ep.sx, ep.sy, es * 1.4, es * 0.85, 0, 0, Math.PI * 2);
    ctx.fillStyle = `hsl(${sh}, 5%, ${sl - 30}%)`;
    ctx.fill();
    ctx.strokeStyle = 'rgba(0,0,0,0.3)';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Iris (tracks mouse)
    const ix = ep.sx + mouseX * es * 0.65;
    const iy = ep.sy + mouseY * es * 0.65;
    ctx.beginPath();
    ctx.arc(ix, iy, es * 0.62, 0, Math.PI * 2);
    ctx.fillStyle = accentColor;
    ctx.fill();

    // Pupil
    ctx.beginPath();
    ctx.arc(ix, iy, es * 0.28, 0, Math.PI * 2);
    ctx.fillStyle = '#000';
    ctx.fill();

    // Specular dot
    ctx.beginPath();
    ctx.arc(ix + es * 0.18, iy - es * 0.18, es * 0.10, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(255,255,255,0.7)';
    ctx.fill();
  };

  const ef = geo.eyeFeats;
  drawEye({ x: ef.R.cx, y: ef.R.cy, z: ef.R.cz, size: ef.R.size });
  drawEye({ x: ef.L.cx, y: ef.L.cy, z: ef.L.cz, size: ef.L.size });

  // ── Draw Accessories ──────────────────────────────────────────────────────────
  if (accessories) {
    try {
      renderAccessories(ctx, geo, pv, rx, ry, scale, cx, cy, accessories, accentColor);
    } catch(e) { console.warn('Accessories render error:', e); }
  }
}

export function generateAvatarDataURL(seed, size = 200, accentColor = '#3b82f6', accessories) {
  const canvas = document.createElement('canvas');
  renderAvatar(canvas, seed, { width: size, height: size, accentColor, accessories });
  return canvas.toDataURL('image/png');
}
