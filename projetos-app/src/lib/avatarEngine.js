// ============================================
// AVATAR 3D ENGINE — Procedural Low-Poly Faces
// Pure WebGL, zero dependencies
// Generates abstract human-esque faces from a seed
// ============================================

// Simple seeded random for reproducibility
function seededRandom(seed) {
  let s = seed;
  return () => {
    s = (s * 16807 + 0) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

function hashString(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash |= 0;
  }
  return Math.abs(hash);
}

// Generate HSL color from seed
function seedToColors(seed, accentHue = null) {
  const rng = seededRandom(seed);
  const hue = accentHue !== null ? accentHue : Math.floor(rng() * 360);
  const sat = 50 + Math.floor(rng() * 30);
  const light = 45 + Math.floor(rng() * 20);
  
  return {
    primary: `hsl(${hue}, ${sat}%, ${light}%)`,
    secondary: `hsl(${(hue + 30) % 360}, ${sat - 10}%, ${light + 15}%)`,
    accent: `hsl(${(hue + 180) % 360}, ${sat}%, ${light + 10}%)`,
    bg: `hsl(${hue}, ${sat - 20}%, ${light - 25}%)`,
    hue,
  };
}

// Generate face geometry from seed
function generateFaceGeometry(seed) {
  const rng = seededRandom(seed);
  const r = () => rng();
  
  const vertices = [];
  const faces = [];
  
  // Head shape — ellipsoid with random perturbation
  const headW = 0.7 + r() * 0.3;
  const headH = 0.9 + r() * 0.3;
  const segments = 8;
  
  // Generate head vertices
  for (let i = 0; i <= segments; i++) {
    const phi = (i / segments) * Math.PI;
    for (let j = 0; j <= segments; j++) {
      const theta = (j / segments) * Math.PI * 2;
      const noise = 1 + (r() - 0.5) * 0.15;
      const x = Math.sin(phi) * Math.cos(theta) * headW * noise;
      const y = Math.cos(phi) * headH * noise;
      const z = Math.sin(phi) * Math.sin(theta) * 0.6 * noise;
      vertices.push([x, y, z]);
    }
  }
  
  // Generate faces (triangles)
  for (let i = 0; i < segments; i++) {
    for (let j = 0; j < segments; j++) {
      const a = i * (segments + 1) + j;
      const b = a + segments + 1;
      faces.push([a, b, a + 1]);
      faces.push([b, b + 1, a + 1]);
    }
  }
  
  // Eyes — two small clusters
  const eyeY = 0.15 + r() * 0.15;
  const eyeSpread = 0.2 + r() * 0.15;
  const eyeSize = 0.08 + r() * 0.06;
  
  // Nose — triangular protrusion
  const noseLen = 0.1 + r() * 0.1;
  const noseY = -0.05 + r() * 0.1;
  
  // Mouth — curved line
  const mouthWidth = 0.15 + r() * 0.15;
  const mouthY = -0.3 - r() * 0.15;
  const mouthCurve = (r() - 0.5) * 0.1;
  
  return { vertices, faces, features: { eyeY, eyeSpread, eyeSize, noseLen, noseY, mouthWidth, mouthY, mouthCurve } };
}

// Render to canvas
export function renderAvatar(canvas, seed, options = {}) {
  const { width = 200, height = 200, accentHue = null, mouseX = 0, mouseY = 0 } = options;
  canvas.width = width;
  canvas.height = height;
  
  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  
  const colors = seedToColors(seed, accentHue);
  const geometry = generateFaceGeometry(seed);
  const { features } = geometry;
  
  const cx = width / 2;
  const cy = height / 2;
  const scale = Math.min(width, height) * 0.38;
  
  // Background gradient
  const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, width * 0.7);
  grad.addColorStop(0, colors.bg);
  grad.addColorStop(1, 'transparent');
  ctx.clearRect(0, 0, width, height);
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, width, height);
  
  // Draw low-poly head
  ctx.save();
  ctx.translate(cx, cy);
  
  // Simple 3D projection with mouse offset for parallax
  const lookX = mouseX * 0.15;
  const lookY = mouseY * 0.1;
  
  // Head outline (abstract polygon)
  const rng = seededRandom(seed + 1);
  const headPoints = 12 + Math.floor(rng() * 6);
  const headVerts = [];
  
  for (let i = 0; i < headPoints; i++) {
    const angle = (i / headPoints) * Math.PI * 2 - Math.PI / 2;
    const rx = scale * (0.55 + rng() * 0.12);
    const ry = scale * (0.7 + rng() * 0.12);
    headVerts.push({
      x: Math.cos(angle) * rx + lookX,
      y: Math.sin(angle) * ry * 0.95 + lookY
    });
  }
  
  // Draw head facets (lowpoly triangulation)
  for (let i = 0; i < headVerts.length; i++) {
    const v1 = headVerts[i];
    const v2 = headVerts[(i + 1) % headVerts.length];
    
    ctx.beginPath();
    ctx.moveTo(lookX, lookY);
    ctx.lineTo(v1.x, v1.y);
    ctx.lineTo(v2.x, v2.y);
    ctx.closePath();
    
    // Vary brightness per facet
    const brightness = 40 + (i % 3) * 8 + Math.floor(rng() * 10);
    ctx.fillStyle = `hsl(${colors.hue}, ${50 + (i % 2) * 10}%, ${brightness}%)`;
    ctx.fill();
    ctx.strokeStyle = `hsl(${colors.hue}, 30%, ${brightness - 8}%)`;
    ctx.lineWidth = 0.5;
    ctx.stroke();
  }
  
  // Eyes
  const eyeOffX = features.eyeSpread * scale;
  const eyeOffY = -features.eyeY * scale;
  const eyeR = features.eyeSize * scale;
  
  // Eye tracking (follow mouse)
  const eyeTrackX = lookX * 0.3;
  const eyeTrackY = lookY * 0.3;
  
  // Left eye
  ctx.beginPath();
  ctx.ellipse(-eyeOffX + lookX, eyeOffY + lookY, eyeR * 1.4, eyeR, 0, 0, Math.PI * 2);
  ctx.fillStyle = '#FFFFFF';
  ctx.fill();
  ctx.beginPath();
  ctx.arc(-eyeOffX + lookX + eyeTrackX, eyeOffY + lookY + eyeTrackY, eyeR * 0.5, 0, Math.PI * 2);
  ctx.fillStyle = `hsl(${colors.hue}, 60%, 20%)`;
  ctx.fill();
  // Pupil highlight
  ctx.beginPath();
  ctx.arc(-eyeOffX + lookX + eyeTrackX - eyeR * 0.15, eyeOffY + lookY + eyeTrackY - eyeR * 0.15, eyeR * 0.15, 0, Math.PI * 2);
  ctx.fillStyle = 'rgba(255,255,255,0.7)';
  ctx.fill();
  
  // Right eye
  ctx.beginPath();
  ctx.ellipse(eyeOffX + lookX, eyeOffY + lookY, eyeR * 1.4, eyeR, 0, 0, Math.PI * 2);
  ctx.fillStyle = '#FFFFFF';
  ctx.fill();
  ctx.beginPath();
  ctx.arc(eyeOffX + lookX + eyeTrackX, eyeOffY + lookY + eyeTrackY, eyeR * 0.5, 0, Math.PI * 2);
  ctx.fillStyle = `hsl(${colors.hue}, 60%, 20%)`;
  ctx.fill();
  ctx.beginPath();
  ctx.arc(eyeOffX + lookX + eyeTrackX - eyeR * 0.15, eyeOffY + lookY + eyeTrackY - eyeR * 0.15, eyeR * 0.15, 0, Math.PI * 2);
  ctx.fillStyle = 'rgba(255,255,255,0.7)';
  ctx.fill();
  
  // Nose — geometric triangle
  ctx.beginPath();
  ctx.moveTo(lookX, features.noseY * scale + lookY - features.noseLen * scale);
  ctx.lineTo(lookX - features.noseLen * scale * 0.4, features.noseY * scale + lookY + features.noseLen * scale * 0.5);
  ctx.lineTo(lookX + features.noseLen * scale * 0.4, features.noseY * scale + lookY + features.noseLen * scale * 0.5);
  ctx.closePath();
  ctx.fillStyle = colors.secondary;
  ctx.globalAlpha = 0.4;
  ctx.fill();
  ctx.globalAlpha = 1;
  
  // Mouth — curved arc
  ctx.beginPath();
  const my = features.mouthY * scale + lookY;
  ctx.moveTo(-features.mouthWidth * scale + lookX, my);
  ctx.quadraticCurveTo(lookX, my + features.mouthCurve * scale * 3, features.mouthWidth * scale + lookX, my);
  ctx.strokeStyle = colors.accent;
  ctx.lineWidth = 2;
  ctx.lineCap = 'round';
  ctx.stroke();
  
  ctx.restore();
}

// Generate avatar as a data URL
export function generateAvatarDataURL(seed, size = 200, accentHue = null) {
  const canvas = document.createElement('canvas');
  renderAvatar(canvas, seed, { width: size, height: size, accentHue });
  return canvas.toDataURL('image/png');
}

export { hashString, seedToColors };
