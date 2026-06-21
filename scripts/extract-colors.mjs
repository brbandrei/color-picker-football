/**
 * Extrage culoarea dominantă (non-alb, non-negru, non-gri) din fiecare logo
 * și afișează rezultatele pentru a fi copiate în teams.js → câmpul dominantColor.
 *
 * Rulare: node scripts/extract-colors.mjs
 */

import sharp from 'sharp'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const PUBLIC = resolve(__dirname, '../public')

function rgbToHsl(r, g, b) {
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

async function extractDominantColor(logoUrl) {
  const filePath = resolve(PUBLIC + logoUrl)
  const { data } = await sharp(filePath).ensureAlpha().raw().toBuffer({ resolveWithObject: true })

  // Bucket hues in 5° increments, ignoring white/black/gray
  const buckets = new Array(72).fill(0)

  for (let i = 0; i < data.length; i += 4) {
    const a = data[i + 3]
    if (a < 64) continue

    const [h, s, l] = rgbToHsl(data[i], data[i + 1], data[i + 2])
    if (l > 87 && s < 20) continue  // near-white
    if (l < 13) continue             // near-black
    if (s < 12) continue             // gray

    buckets[Math.floor(h / 5) % 72]++
  }

  // Find peak bucket; merge with immediate neighbours (handles edge of hue wheel)
  const score = (i) => (buckets[i] + buckets[(i + 1) % 72] + buckets[(i + 71) % 72])
  let peakIdx = 0
  for (let i = 1; i < 72; i++) if (score(i) > score(peakIdx)) peakIdx = i

  const peakHue = peakIdx * 5 + 2.5

  // Collect pixels within ±25° of peak hue for S/L averages
  let totalS = 0, totalL = 0, count = 0
  for (let i = 0; i < data.length; i += 4) {
    const a = data[i + 3]
    if (a < 64) continue

    const [h, s, l] = rgbToHsl(data[i], data[i + 1], data[i + 2])
    if (l > 87 && s < 20) continue
    if (l < 13) continue
    if (s < 12) continue

    const diff = Math.abs(h - peakHue)
    if (Math.min(diff, 360 - diff) < 25) {
      totalS += s
      totalL += l
      count++
    }
  }

  return {
    h: Math.round(peakHue),
    s: Math.round(totalS / count),
    l: Math.round(totalL / count),
    pixels: buckets[peakIdx],
  }
}

const teams = [
  { id: 'real-madrid',      logoUrl: '/logos/spain-la-liga-2025-2026/real-madrid.football-logos.cc.png' },
  { id: 'barcelona',        logoUrl: '/logos/spain-la-liga-2025-2026/barcelona.football-logos.cc.png' },
  { id: 'manchester-city',  logoUrl: '/logos/english-premier-league-2026-2027/manchester-city.football-logos.cc.png' },
  { id: 'liverpool',        logoUrl: '/logos/english-premier-league-2026-2027/liverpool.football-logos.cc.png' },
  { id: 'psg',              logoUrl: '/logos/france-ligue-1-2025-2026/paris-saint-germain.football-logos.cc.png' },
  { id: 'juventus',         logoUrl: '/logos/italy-serie-a-2025-2026/juventus.football-logos.cc.png' },
  { id: 'ac-milan',         logoUrl: '/logos/italy-serie-a-2025-2026/milan.football-logos.cc.png' },
  { id: 'chelsea',          logoUrl: '/logos/english-premier-league-2026-2027/chelsea.football-logos.cc.png' },
  { id: 'arsenal',          logoUrl: '/logos/english-premier-league-2026-2027/arsenal.football-logos.cc.png' },
  { id: 'dortmund',         logoUrl: '/logos/germany-bundesliga-2025-2026/borussia-dortmund.football-logos.cc.png' },
  { id: 'bayern',           logoUrl: '/logos/germany-bundesliga-2025-2026/bayern-munchen.football-logos.cc.png' },
  { id: 'ajax',             logoUrl: '/logos/netherlands-eredivisie-2025-2026/ajax.football-logos.cc.png' },
]

console.log('Extragere culori dominante...\n')
for (const team of teams) {
  try {
    const c = await extractDominantColor(team.logoUrl)
    console.log(`  { id: '${team.id}', dominantColor: { h: ${c.h}, s: ${c.s}, l: ${c.l} } },  // ${c.pixels} px`)
  } catch (e) {
    console.error(`  ✗ ${team.id}: ${e.message}`)
  }
}
