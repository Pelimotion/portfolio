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
  const sat = 30 + Math.floor(rng() * 50);
  const light = 55 + Math.floor(rng() * 30);
  return {
    skinBase: `hsl(${hue}, ${sat}%, ${light}%)`,
    skinMid:  `hsl(${hue}, ${sat + 5}%, ${light - 12}%)`,
    skinDark: `hsl(${hue}, ${sat + 10}%, ${light - 25}%)`,
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

  // Caricature params (all seed-driven)
  const jawW    = r(0.35, 0.70);
  const cheekW  = r(0.70, 1.00);
  const foreW   = r(0.55, 0.85);
  const headH   = r(0.90, 1.20);
  const chinY   = r(-0.85, -0.65);
  const browH   = r(-0.05, 0.25);   // brow raise
  const eyeY    = r(0.10, 0.30);
  const eyeZ    = r(0.12, 0.22);
  const eyeSpX  = r(0.20, 0.45);    // eye x spread
  const eyeSz   = r(0.06, 0.14);    // eye size
  const lidDrop = r(0.0, 0.06);     // upper lid droop
  const noseLen = r(0.25, 0.55);
  const noseZ   = r(0.35, 0.65);
  const noseTip = r(0.0, 0.20);     // bulbous tip
  const mouthW  = r(0.18, 0.45);
  const mouthY  = r(-0.35, -0.20);
  const lipCurl = r(-0.05, 0.08);   // smile/frown
  const earW    = r(0.06, 0.14);
  const earH    = r(0.18, 0.32);

  const V = {};
  const def = (k, x, y, z) => { V[k] = { x, y, z, id: k }; };

  // CENTER LINE
  def('topC',   0, headH,        0.05);
  def('foreC',  0, headH * 0.70, 0.35);
  def('browC',  0, eyeY + browH, eyeZ + 0.08);
  def('nostC',  0, eyeY - noseLen, noseZ + noseTip);
  def('nostB',  0, eyeY - noseLen * 0.4, noseZ);
  def('mouthC', 0, mouthY + 0.04, 0.42);
  def('lowlipC',0, mouthY - 0.02, 0.40);
  def('chinC',  0, chinY,        0.30);
  def('neckC',  0, chinY - 0.35, 0.10);
  def('backC',  0, headH * 0.30, -0.85);
  def('backLoC',0, chinY * 0.40, -0.70);

  // SYMMETRIC (right side, will mirror to left)
  const sym = (k, x, y, z) => {
    V[k + 'R'] = { x,  y, z, id: k + 'R' };
    V[k + 'L'] = { x: -x, y, z, id: k + 'L' };
  };

  sym('topSide',   foreW * 0.80, headH * 0.95, -0.10);
  sym('templeT',   cheekW * 0.88, headH * 0.78, -0.05);
  sym('temple',    cheekW * 0.95, eyeY + 0.30, 0.05);
  sym('ear',       cheekW * 1.05 + earW, eyeY - 0.02, -0.08);
  sym('earLo',     cheekW * 1.05 + earW * 0.7, eyeY - earH, -0.08);
  sym('cheek',     cheekW,        eyeY - 0.10, 0.28);
  sym('cheekHi',   cheekW * 0.80, eyeY + 0.06, 0.28);
  sym('jaw',       jawW,          chinY + 0.25, 0.12);
  sym('chin',      jawW * 0.42,   chinY + 0.10, 0.30);
  sym('neckSide',  jawW * 0.70,   chinY - 0.30, -0.10);

  // MOUTH & LIPS
  sym('mouthCo',   mouthW,        mouthY + lipCurl, 0.40);
  sym('upLip',     mouthW * 0.55, mouthY + 0.055,  0.44);
  sym('loLip',     mouthW * 0.55, mouthY - 0.035,  0.44);

  // NOSE
  sym('nostSide', 0.12, eyeY - noseLen + 0.04, noseZ + noseTip - 0.02);
  sym('nostWing', 0.18, eyeY - noseLen - 0.01, noseZ + noseTip * 0.5);
  def('nostTip',  0,    eyeY - noseLen - 0.02, noseZ + noseTip + 0.08);
  def('noseBridgeC', 0, eyeY + 0.06, noseZ - 0.10);

  // EYES
  sym('browIn',  eyeSpX * 0.40, eyeY + browH + 0.06, eyeZ + 0.12);
  sym('browOut', eyeSpX * 1.45, eyeY + browH + 0.02, eyeZ + 0.08);
  sym('eyeIn',   eyeSpX * 0.55, eyeY - lidDrop * 0.3, eyeZ + 0.04);
  sym('eyeOut',  eyeSpX * 1.45, eyeY - lidDrop * 0.5, eyeZ + 0.02);
  sym('eyeTop',  eyeSpX * 1.00, eyeY + eyeSz - lidDrop, eyeZ + 0.07);
  sym('eyeBot',  eyeSpX * 1.00, eyeY - eyeSz * 0.55,  eyeZ + 0.01);

  // FOREHEAD DETAIL
  sym('foreHi',  foreW * 0.40, headH * 0.55, 0.32);
  sym('foreMid', foreW * 0.65, headH * 0.70, 0.18);

  // Collect into array and build index
  const verts = Object.values(V);
  const idx = {};
  verts.forEach((v, i) => { idx[v.id] = i; });
  const I = (k) => idx[k];

  // ── Face Triplets ──────────────────────────────────────────────────────────────
  // Groups: 'skin' | 'shadow' | 'highlight' | 'paint' | 'noseSkin' | 'lip' | 'brow'
  const tris = [
    // FOREHEAD
    ['highlight', 'topC','topSideR','foreHiR'],
    ['highlight', 'topC','foreHiL','topSideL'],
    ['highlight', 'topC','topSideR','topSideL'],
    ['skin','foreC','topC','foreHiR'],
    ['skin','foreC','foreHiL','topC'],
    ['skin','foreC','foreHiR','foreMidR'],
    ['skin','foreC','foreMidL','foreHiL'],
    ['skin','foreC','foreMidR','browIn R'],
    ['skin','foreC','browInL','foreMidL'],

    // BROW RIDGE
    ['brow','browInR','foreMidR','browOutR'],
    ['brow','browInL','browOutL','foreMidL'],
    ['brow','browInR','browOutR','eyeTopR'],
    ['brow','browInL','eyeTopL','browOutL'],

    // TEMPLES & SIDES
    ['skin','topSideR','templeT R','foreMidR'],
    ['skin','topSideL','foreMidL','templeTL'],
    ['skin','templeT R','templeR','foreMidR'],
    ['skin','templeTL','foreMidL','templeL'],
    ['shadow','templeR','earR','templeT R'],
    ['shadow','templeL','templeTL','earL'],
    ['shadow','templeR','cheekHiR','earR'],
    ['shadow','templeL','earL','cheekHiL'],

    // CHEEKS
    ['skin','cheekHiR','cheekR','cheekHiR'].map ? null : null, // placeholder
    ['skin','cheekHiR','eyeOutR','cheekR'],
    ['skin','cheekHiL','cheekL','eyeOutL'],
    ['skin','cheekR','nostSideR','cheekHiR'],
    ['skin','cheekL','cheekHiL','nostSideL'],
    ['skin','cheekR','mouthCoR','nostSideR'],
    ['skin','cheekL','nostSideL','mouthCoL'],

    // EAR
    ['shadow','earR','earLoR','cheekR'],
    ['shadow','earL','cheekL','earLoL'],
    ['shadow','cheekR','earLoR','jawR'],
    ['shadow','cheekL','jawL','earLoL'],

    // UPPER FACE (Eye zone)
    ['skin','noseBridgeC','browInR','eyeInR'],
    ['skin','noseBridgeC','eyeInL','browInL'],
    ['skin','noseBridgeC','eyeInR','nostSideR'],
    ['skin','noseBridgeC','nostSideL','eyeInL'],

    // NOSE
    ['noseSkin','nostSideR','nostTip','nostWingR'],
    ['noseSkin','nostSideL','nostWingL','nostTip'],
    ['noseSkin','nostBR' || 'nostC','nostSideR','nostB'],
    ['noseSkin','nostSideR','nostWingR','nostB'],
    ['noseSkin','nostSideL','nostB','nostWingL'],
    ['noseSkin','nostTip','nostWingR','mouthC'],
    ['noseSkin','nostTip','mouthC','nostWingL'],

    // MID FACE (between nose and mouth)
    ['skin','mouthC','nostWingR','mouthCoR'],
    ['skin','mouthC','mouthCoL','nostWingL'],
    ['skin','mouthC','mouthCoR','upLipR'],
    ['skin','mouthC','upLipL','mouthCoL'],

    // LIPS
    ['lip','upLipR','mouthCoR','lowlipC'],
    ['lip','upLipL','lowlipC','mouthCoL'],
    ['lip','upLipR','lowlipC','mouthC'],
    ['lip','upLipL','mouthC','lowlipC'],
    ['lip','loLipR','chinR','mouthCoR'],
    ['lip','loLipL','mouthCoL','chinL'],
    ['lip','loLipR','lowlipC','chinR'],
    ['lip','loLipL','chinL','lowlipC'],

    // LOWER FACE
    ['skin','chinR','jawR','mouthCoR'],
    ['skin','chinL','mouthCoL','jawL'],
    ['skin','chinC','chinR','chinL'],
    ['skin','chinC','chinR','jaw R'],
    ['skin','chinC','jawL','chinL'],

    // JAW LINE
    ['shadow','jawR','neckSideR','chinR'],
    ['shadow','jawL','chinL','neckSideL'],
    ['shadow','chinR','neckSideR','neckC'],
    ['shadow','chinL','neckC','neckSideL'],
    ['shadow','chinC','chinR','neckC'],
    ['shadow','chinC','neckC','chinL'],

    // BACK OF HEAD
    ['shadow','topSideR','backC','templeT R'],
    ['shadow','topSideL','templeTL','backC'],
    ['shadow','templeT R','backC','earR'],
    ['shadow','templeTL','earL','backC'],
    ['shadow','earR','backC','earLoR'],
    ['shadow','earL','earLoL','backC'],
    ['shadow','earLoR','backC','backLoC'],
    ['shadow','earLoL','backLoC','backC'],
    ['shadow','earLoR','backLoC','neckSideR'],
    ['shadow','earLoL','neckSideL','backLoC'],
    ['shadow','neckSideR','backLoC','neckC'],
    ['shadow','neckSideL','neckC','backLoC'],
  ].filter(t => t && t[1] && t[2] && t[3] && idx[t[1]] !== undefined && idx[t[2]] !== undefined && idx[t[3]] !== undefined);

  // Mark some faces as paint (war paint accent)
  const paintSeeds = new Set();
  const rngP = seededRandom(seed * 7 + 1);
  const paintGroups = ['cheekHiR', 'cheekHiL', 'templeR', 'templeL', 'foreHiR', 'foreHiL'];
  paintGroups.forEach(k => {
    if (rngP() > 0.55) paintSeeds.add(k);
  });

  const facesList = tris.map(t => ({
    group: t[0],
    i0: I(t[1]),
    i1: I(t[2]),
    i2: I(t[3]),
    isPaint: paintSeeds.has(t[1]) || paintSeeds.has(t[2]),
  })).filter(f => f.i0 !== undefined && f.i1 !== undefined && f.i2 !== undefined);

  // Eye feature data for iris rendering
  const eyeFeats = {
    R: { cx: eyeSpX * 1.00, cy: eyeY - (eyeSz * 0.05), cz: eyeZ + 0.10, size: eyeSz * 0.85 },
    L: { cx: -eyeSpX * 1.00, cy: eyeY - (eyeSz * 0.05), cz: eyeZ + 0.10, size: eyeSz * 0.85 },
  };

  // Nose tip for tracking
  const noseFeat = { cx: 0, cy: eyeY - noseLen - 0.02, cz: noseZ + noseTip + 0.08 };

  return { verts, facesList, eyeFeats, noseFeat, rng: seededRandom(seed + 9999) };
}

// ── Render ────────────────────────────────────────────────────────────────────────
export function renderAvatar(canvas, seed, options = {}) {
  const { width = 200, height = 200, accentColor = '#3b82f6', mouseX = 0, mouseY = 0, accessories } = options;
  if (!canvas) return;

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

  // Rotation from mouse
  const ry = mouseX * 0.55;
  const rx = -mouseY * 0.35;

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
