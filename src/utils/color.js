export function rgbToHsl(r, g, b) {
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h = 0, s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
      case g: h = ((b - r) / d + 2) / 6; break;
      case b: h = ((r - g) / d + 4) / 6; break;
    }
  }
  return [h * 360, s * 100, l * 100];
}

export function hslToRgb(h, s, l) {
  h /= 360; s /= 100; l /= 100;
  if (s === 0) {
    const v = Math.round(l * 255);
    return [v, v, v];
  }
  const hue2rgb = (p, q, t) => {
    if (t < 0) t += 1;
    if (t > 1) t -= 1;
    if (t < 1 / 6) return p + (q - p) * 6 * t;
    if (t < 1 / 2) return q;
    if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
    return p;
  };
  const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
  const p = 2 * l - q;
  return [
    Math.round(hue2rgb(p, q, h + 1 / 3) * 255),
    Math.round(hue2rgb(p, q, h) * 255),
    Math.round(hue2rgb(p, q, h - 1 / 3) * 255),
  ];
}

export function hueDiff(a, b) {
  const d = Math.abs(a - b) % 360;
  return d > 180 ? 360 - d : d;
}

/**
 * Weighted HSL distance — hue heavily dominant — with steep power curve.
 * Hue (75%) > Saturation (15%) > Lightness (10%).
 * Power 4: wrong hue kills the score, sat/lit can't compensate.
 *
 *   0° off → 100% | 10° → 84% | 30° → 59% | 60° → 32%
 *   80° off → 20% | 90° → 16% | 120° → 6%  | 180° → 1%
 */
export function calculateScore(guessHsl, realHsl) {
  const hDist = hueDiff(guessHsl.h, realHsl.h) / 180        // 0–1
  const sDist = Math.abs(guessHsl.s - realHsl.s) / 100      // 0–1
  const lDist = Math.abs(guessHsl.l - realHsl.l) / 100      // 0–1

  const dist = 0.75 * hDist + 0.15 * sDist + 0.10 * lDist  // 0–1

  return Math.round(Math.max(0, 1 - dist) ** 4 * 100)
}
