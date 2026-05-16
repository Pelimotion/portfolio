/**
 * Set global CSS variables for accent color and its contrasting foreground
 * Ensures legibility on dynamic accent colors.
 */
export function setGlobalAccentColor(hex) {
  if (!hex) return;
  
  const root = document.documentElement;
  root.style.setProperty('--brand-color', hex);
  root.style.setProperty('--primary', hex);
  
  // Calculate relative luminance
  const rgb = hexToRgb(hex);
  if (!rgb) return;
  
  const luminance = (0.299 * rgb.r + 0.587 * rgb.g + 0.114 * rgb.b) / 255;
  
  // Set foreground (black or white) based on luminance
  const foreground = luminance > 0.5 ? '#000000' : '#FFFFFF';
  root.style.setProperty('--primary-foreground', foreground);
  
  // Set subtle variations
  root.style.setProperty('--primary-muted', hex + '22'); // 13% opacity
  root.style.setProperty('--primary-alpha', hex + '44'); // 26% opacity
}

function hexToRgb(hex) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : null;
}
