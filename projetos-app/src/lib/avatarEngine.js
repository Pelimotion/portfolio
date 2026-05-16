// ============================================
// AVATAR 3D ENGINE — PS1 Low-Poly Character
// Flat-shaded, caricatured, war paint, eye-tracking
// ============================================

function seededRandom(seed) {
  let s = seed;
  return () => {
    s = (s * 16807 + 0) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

export function hashString(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash) + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

// Extract RGB from hex color
function hexToRgb(hex) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex || '#3b82f6');
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : { r: 59, g: 130, b: 246 };
}

// Generate skin color and paint color
export function seedToColors(seed, accentColor = '#3b82f6') {
  const rng = seededRandom(seed);
  // Non-realistic skin tones (pale, vibrant pink, neon green, blueish, yellow, etc)
  const hue = Math.floor(rng() * 360);
  const sat = 40 + Math.floor(rng() * 40);
  const light = 60 + Math.floor(rng() * 30);
  
  return {
    skinBase: `hsl(${hue}, ${sat}%, ${light}%)`,
    skinShadow: `hsl(${hue}, ${sat + 10}%, ${light - 20}%)`,
    paint: accentColor,
    bg: `hsl(${(hue + 180) % 360}, 20%, 20%)`
  };
}

// 3D Math Helpers
function rotateY(point, angle) {
  const c = Math.cos(angle);
  const s = Math.sin(angle);
  return {
    x: point.x * c - point.z * s,
    y: point.y,
    z: point.x * s + point.z * c
  };
}

function rotateX(point, angle) {
  const c = Math.cos(angle);
  const s = Math.sin(angle);
  return {
    x: point.x,
    y: point.y * c - point.z * s,
    z: point.y * s + point.z * c
  };
}

// Generate stylized PS1 low-poly face geometry
function generateGeometry(seed) {
  const rng = seededRandom(seed);
  const r = () => (rng() - 0.5) * 2; // -1 to 1
  
  // Caricature parameters
  const jawW = 0.5 + r() * 0.3;
  const cheekW = 0.8 + r() * 0.2;
  const browW = 0.7 + r() * 0.1;
  const headH = 1.0 + r() * 0.2;
  const chinY = -0.8 + r() * 0.2;
  const noseZ = 0.5 + Math.abs(r() * 0.4);
  const noseY = -0.1 + r() * 0.1;
  const eyeY = 0.2 + r() * 0.1;
  const eyeZ = 0.15 + r() * 0.1;
  const eyeSpread = 0.3 + r() * 0.1;
  
  // Vertices definition (symmetric, right side defined, then mirrored)
  // Format: [x, y, z, id]
  const rawVerts = {
    chin: [0, chinY, 0.4],
    mouthCenter: [0, chinY + 0.2, 0.45],
    noseTip: [0, noseY, noseZ],
    noseBridge: [0, eyeY, noseZ * 0.8],
    foreheadCenter: [0, headH * 0.6, 0.4],
    topCenter: [0, headH, 0],
    backCenter: [0, 0, -1.0],
    
    // Right side
    jaw: [jawW, chinY + 0.3, 0.1],
    mouthCorner: [jawW * 0.4, chinY + 0.25, 0.4],
    cheekbone: [cheekW, noseY + 0.1, 0.3],
    eyeOuter: [eyeSpread * 1.5, eyeY, eyeZ],
    eyeInner: [eyeSpread * 0.5, eyeY - 0.05, eyeZ + 0.05],
    browOuter: [browW, eyeY + 0.15, eyeZ + 0.1],
    temple: [headW = cheekW * 0.9, eyeY + 0.2, 0],
    topRight: [headW * 0.7, headH * 0.9, 0],
    earTop: [cheekW * 1.1, eyeY, -0.1],
    earBot: [cheekW * 1.0, noseY, -0.1],
    neckRight: [jawW * 0.8, chinY - 0.4, -0.2],
    neckCenter: [0, chinY - 0.5, 0]
  };

  const verts = [];
  const vertMap = {};
  
  // Add center verts
  ['chin', 'mouthCenter', 'noseTip', 'noseBridge', 'foreheadCenter', 'topCenter', 'backCenter', 'neckCenter'].forEach(k => {
    vertMap[k] = verts.length;
    verts.push({ x: rawVerts[k][0], y: rawVerts[k][1], z: rawVerts[k][2], id: k });
  });
  
  // Add right and left verts
  ['jaw', 'mouthCorner', 'cheekbone', 'eyeOuter', 'eyeInner', 'browOuter', 'temple', 'topRight', 'earTop', 'earBot', 'neckRight'].forEach(k => {
    vertMap[k + 'R'] = verts.length;
    verts.push({ x: rawVerts[k][0], y: rawVerts[k][1], z: rawVerts[k][2], id: k + 'R' });
    
    vertMap[k + 'L'] = verts.length;
    verts.push({ x: -rawVerts[k][0], y: rawVerts[k][1], z: rawVerts[k][2], id: k + 'L' });
  });

  // Define faces (triangles) using vertex keys
  const faceDefs = [
    // Nose & Center Face
    ['noseTip', 'noseBridge', 'eyeInnerR'], ['noseTip', 'eyeInnerL', 'noseBridge'],
    ['noseTip', 'eyeInnerR', 'cheekboneR'], ['noseTip', 'cheekboneL', 'eyeInnerL'],
    ['noseTip', 'cheekboneR', 'mouthCornerR'], ['noseTip', 'mouthCornerL', 'cheekboneL'],
    ['noseTip', 'mouthCornerR', 'mouthCenter'], ['noseTip', 'mouthCenter', 'mouthCornerL'],
    
    // Eyes & Brow
    ['noseBridge', 'foreheadCenter', 'browOuterR'], ['noseBridge', 'browOuterL', 'foreheadCenter'],
    ['noseBridge', 'browOuterR', 'eyeInnerR'], ['noseBridge', 'eyeInnerL', 'browOuterL'],
    ['eyeInnerR', 'browOuterR', 'eyeOuterR'], ['eyeInnerL', 'eyeOuterL', 'browOuterL'],
    ['eyeInnerR', 'eyeOuterR', 'cheekboneR'], ['eyeInnerL', 'cheekboneL', 'eyeOuterL'],
    
    // Cheeks & Jaw
    ['mouthCenter', 'mouthCornerR', 'chin'], ['mouthCenter', 'chin', 'mouthCornerL'],
    ['mouthCornerR', 'jawR', 'chin'], ['mouthCornerL', 'chin', 'jawL'],
    ['mouthCornerR', 'cheekboneR', 'jawR'], ['mouthCornerL', 'jawL', 'cheekboneL'],
    
    // Sides
    ['cheekboneR', 'eyeOuterR', 'earTopR'], ['cheekboneL', 'earTopL', 'eyeOuterL'],
    ['cheekboneR', 'earTopR', 'earBotR'], ['cheekboneL', 'earBotL', 'earTopL'],
    ['cheekboneR', 'earBotR', 'jawR'], ['cheekboneL', 'jawL', 'earBotL'],
    
    // Forehead & Top
    ['foreheadCenter', 'topCenter', 'topRightR'], ['foreheadCenter', 'topRightL', 'topCenter'],
    ['foreheadCenter', 'topRightR', 'browOuterR'], ['foreheadCenter', 'browOuterL', 'topRightL'],
    ['browOuterR', 'topRightR', 'templeR'], ['browOuterL', 'templeL', 'topRightL'],
    ['browOuterR', 'templeR', 'eyeOuterR'], ['browOuterL', 'eyeOuterL', 'templeL'],
    ['eyeOuterR', 'templeR', 'earTopR'], ['eyeOuterL', 'earTopL', 'templeL'],
    
    // Neck
    ['chin', 'jawR', 'neckRightR'], ['chin', 'neckRightL', 'jawL'],
    ['chin', 'neckRightR', 'neckCenter'], ['chin', 'neckCenter', 'neckRightL']
  ];

  const faces = faceDefs.map(f => ({
    indices: f.map(k => vertMap[k]),
    keys: f,
    // Assign "paint" zones randomly based on seed
    isPaint: rng() > 0.7
  }));

  // Assign features info for drawing eyes/details later
  const features = {
    eyeXR: rawVerts['eyeInner'][0] + (rawVerts['eyeOuter'][0] - rawVerts['eyeInner'][0]) * 0.5,
    eyeXL: -(rawVerts['eyeInner'][0] + (rawVerts['eyeOuter'][0] - rawVerts['eyeInner'][0]) * 0.5),
    eyeY: rawVerts['eyeOuter'][1],
    eyeZ: rawVerts['eyeOuter'][2] + 0.05,
    eyeSize: 0.08 + Math.abs(r()) * 0.05
  };

  return { verts, faces, features, rng };
}

export function renderAvatar(canvas, seed, options = {}) {
  const { width = 200, height = 200, accentColor = '#3b82f6', mouseX = 0, mouseY = 0 } = options;
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  const { skinBase, skinShadow, paint } = seedToColors(seed, accentColor);
  const geo = generateGeometry(seed);
  
  // Clear
  ctx.clearRect(0, 0, width, height);
  
  const cx = width / 2;
  const cy = height / 2;
  const scale = Math.min(width, height) * 0.45;
  
  // Calculate rotation from mouse
  // MouseX is -1 to 1, MouseY is -1 to 1
  const rotY = mouseX * 0.6; 
  const rotX = -mouseY * 0.4;
  
  // Transform vertices
  const projVerts = geo.verts.map(v => {
    let p = rotateX(v, rotX);
    p = rotateY(p, rotY);
    // Simple ortho projection with scale
    return {
      x: p.x * scale + cx,
      y: -p.y * scale + cy, // Flip Y for canvas
      z: p.z,
      orig: v
    };
  });

  // Calculate face depths and normals
  const projectedFaces = geo.faces.map(f => {
    const v0 = projVerts[f.indices[0]];
    const v1 = projVerts[f.indices[1]];
    const v2 = projVerts[f.indices[2]];
    
    const zAvg = (v0.z + v1.z + v2.z) / 3;
    
    // Normal calculation (Z component for backface culling & flat shading)
    const dx1 = v1.x - v0.x;
    const dy1 = v1.y - v0.y;
    const dx2 = v2.x - v0.x;
    const dy2 = v2.y - v0.y;
    const nz = dx1 * dy2 - dy1 * dx2; // 2D cross product = Z normal in screen space
    
    // Base shading on original normals so it looks 3D even when rotated
    const nx = v0.orig.x + v1.orig.x + v2.orig.x;
    const ny = v0.orig.y + v1.orig.y + v2.orig.y;
    const shade = (ny * 0.5 + (nx > 0 ? nx : -nx) * 0.2) / 3; 

    return { v0, v1, v2, zAvg, nz, shade, isPaint: f.isPaint };
  });

  // Sort faces by Z depth (Painter's algorithm)
  projectedFaces.sort((a, b) => a.zAvg - b.zAvg);

  // Parse colors
  // We'll just use a simple lerp or hsl adjustments for flat shading
  const skinHSL = /hsl\((\d+),\s*(\d+)%,\s*(\d+)%\)/.exec(skinBase);
  const h = skinHSL ? parseInt(skinHSL[1]) : 0;
  const s = skinHSL ? parseInt(skinHSL[2]) : 0;
  const l = skinHSL ? parseInt(skinHSL[3]) : 50;

  // Draw faces
  ctx.lineJoin = 'round';
  for (const f of projectedFaces) {
    if (f.nz > 0) continue; // Backface cull
    
    ctx.beginPath();
    ctx.moveTo(f.v0.x, f.v0.y);
    ctx.lineTo(f.v1.x, f.v1.y);
    ctx.lineTo(f.v2.x, f.v2.y);
    ctx.closePath();
    
    // Calculate light for this facet
    const lightMod = f.shade * 30; // -15 to 15
    const finalL = Math.max(10, Math.min(90, l - lightMod));
    
    if (f.isPaint) {
      // War paint facet
      ctx.fillStyle = paint;
      ctx.strokeStyle = paint;
    } else {
      // Skin facet
      const color = `hsl(${h}, ${s}%, ${finalL}%)`;
      ctx.fillStyle = color;
      ctx.strokeStyle = color;
    }
    
    ctx.lineWidth = 1.0;
    ctx.fill();
    ctx.stroke(); // Stroke with same color avoids gaps between polygons
    
    // Optional: add a tiny wireframe black outline for that comic/PS1 look
    // like the reference image which has black sketched lines
    if (Math.abs(f.shade) > 0.2) {
      ctx.strokeStyle = 'rgba(0,0,0,0.15)';
      ctx.lineWidth = 1;
      ctx.stroke();
    }
  }

  // Draw 3D Eyes that track
  const drawEye = (origX, origY, origZ) => {
    let p = rotateX({x: origX, y: origY, z: origZ}, rotX);
    p = rotateY(p, rotY);
    if (p.z < -0.1) return; // Behind face
    
    const ex = p.x * scale + cx;
    const ey = -p.y * scale + cy;
    const eSize = geo.features.eyeSize * scale;
    
    // Sclera
    ctx.beginPath();
    ctx.ellipse(ex, ey, eSize * 1.5, eSize * 0.8, 0, 0, Math.PI * 2);
    ctx.fillStyle = '#111';
    ctx.fill();
    
    // Iris tracking
    // The iris shifts based on mouse position relative to face
    const ix = ex + mouseX * eSize * 0.8;
    const iy = ey + mouseY * eSize * 0.8;
    
    ctx.beginPath();
    ctx.arc(ix, iy, eSize * 0.5, 0, Math.PI * 2);
    ctx.fillStyle = paint; // Iris matches accent color
    ctx.fill();
    
    // Pupil
    ctx.beginPath();
    ctx.arc(ix, iy, eSize * 0.2, 0, Math.PI * 2);
    ctx.fillStyle = '#000';
    ctx.fill();
  };

  drawEye(geo.features.eyeXR, geo.features.eyeY, geo.features.eyeZ);
  drawEye(geo.features.eyeXL, geo.features.eyeY, geo.features.eyeZ);

  // Sketched black lines overlay (like the reference)
  ctx.strokeStyle = '#111';
  ctx.lineWidth = 2;
  ctx.lineCap = 'round';
  const drawStroke = (v1Id, v2Id, v3Id) => {
    const v1 = projVerts[geo.verts.findIndex(v => v.id === v1Id)];
    const v2 = projVerts[geo.verts.findIndex(v => v.id === v2Id)];
    const v3 = projVerts[geo.verts.findIndex(v => v.id === v3Id)];
    if (!v1 || !v2 || v1.z < 0 || v2.z < 0) return;
    ctx.beginPath();
    ctx.moveTo(v1.x, v1.y);
    ctx.lineTo(v2.x, v2.y);
    if (v3 && v3.z > 0) ctx.lineTo(v3.x, v3.y);
    ctx.stroke();
  };

  // Add some chaotic stylized strokes
  if (geo.rng() > 0.5) drawStroke('cheekboneR', 'jawR');
  if (geo.rng() > 0.5) drawStroke('cheekboneL', 'jawL');
  drawStroke('mouthCornerR', 'mouthCenter', 'mouthCornerL'); // Mouth line
  if (geo.rng() > 0.3) drawStroke('browOuterR', 'foreheadCenter');
  if (geo.rng() > 0.3) drawStroke('browOuterL', 'foreheadCenter');
}

export function generateAvatarDataURL(seed, size = 200, accentColor = '#3b82f6') {
  const canvas = document.createElement('canvas');
  renderAvatar(canvas, seed, { width: size, height: size, accentColor });
  return canvas.toDataURL('image/png');
}
