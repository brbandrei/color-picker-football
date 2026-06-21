/**
 * teams.js — curated teams for the default game mode
 *
 * dominantColor: auto-extracted from logo pixels (most prevalent non-white/non-black hue)
 *                → used both as the mask target AND as the correct answer
 * randomStartingColor: complementary hue (+180°) so the mask starts clearly wrong
 *
 * collectionId + logoUrl → file on disk under public/logos/
 */

export const teams = [
  {
    id: 'real-madrid',
    name: 'Real Madrid',
    collectionId: 'spain-la-liga-2025-2026',
    logoUrl: '/logos/spain-la-liga-2025-2026/real-madrid.football-logos.cc.png',
    dominantColor: { h: 53, s: 94, l: 52 },
    randomStartingColor: { h: 233, s: 90, l: 50 },
  },
  {
    id: 'barcelona',
    name: 'FC Barcelona',
    collectionId: 'spain-la-liga-2025-2026',
    logoUrl: '/logos/spain-la-liga-2025-2026/barcelona.football-logos.cc.png',
    dominantColor: { h: 48, s: 100, l: 46 },
    randomStartingColor: { h: 228, s: 90, l: 50 },
  },
  {
    id: 'manchester-city',
    name: 'Manchester City',
    collectionId: 'english-premier-league-2026-2027',
    logoUrl: '/logos/english-premier-league-2026-2027/manchester-city.football-logos.cc.png',
    dominantColor: { h: 218, s: 83, l: 37 },
    randomStartingColor: { h: 38, s: 85, l: 50 },
  },
  {
    id: 'liverpool',
    name: 'Liverpool FC',
    collectionId: 'english-premier-league-2026-2027',
    logoUrl: '/logos/english-premier-league-2026-2027/liverpool.football-logos.cc.png',
    dominantColor: { h: 3, s: 79, l: 50 },
    randomStartingColor: { h: 183, s: 80, l: 50 },
  },
  {
    id: 'psg',
    name: 'Paris Saint-Germain',
    collectionId: 'france-ligue-1-2025-2026',
    logoUrl: '/logos/france-ligue-1-2025-2026/paris-saint-germain.football-logos.cc.png',
    dominantColor: { h: 203, s: 96, l: 24 },
    randomStartingColor: { h: 23, s: 90, l: 45 },
  },
  {
    id: 'inter',
    name: 'Inter Milan',
    collectionId: 'italy-serie-a-2025-2026',
    logoUrl: '/logos/italy-serie-a-2025-2026/inter.football-logos.cc.png',
    dominantColor: { h: 233, s: 98, l: 32 },
    randomStartingColor: { h: 53, s: 95, l: 50 },
  },
  {
    id: 'ac-milan',
    name: 'AC Milan',
    collectionId: 'italy-serie-a-2025-2026',
    logoUrl: '/logos/italy-serie-a-2025-2026/milan.football-logos.cc.png',
    dominantColor: { h: 338, s: 98, l: 43 },
    randomStartingColor: { h: 158, s: 90, l: 50 },
  },
  {
    id: 'chelsea',
    name: 'Chelsea FC',
    collectionId: 'english-premier-league-2026-2027',
    logoUrl: '/logos/english-premier-league-2026-2027/chelsea.football-logos.cc.png',
    dominantColor: { h: 238, s: 93, l: 30 },
    randomStartingColor: { h: 58, s: 90, l: 50 },
  },
  {
    id: 'arsenal',
    name: 'Arsenal FC',
    collectionId: 'english-premier-league-2026-2027',
    logoUrl: '/logos/english-premier-league-2026-2027/arsenal.football-logos.cc.png',
    dominantColor: { h: 8, s: 98, l: 46 },
    randomStartingColor: { h: 188, s: 90, l: 50 },
  },
  {
    id: 'dortmund',
    name: 'Borussia Dortmund',
    collectionId: 'germany-bundesliga-2025-2026',
    logoUrl: '/logos/germany-bundesliga-2025-2026/borussia-dortmund.football-logos.cc.png',
    dominantColor: { h: 48, s: 100, l: 49 },
    randomStartingColor: { h: 228, s: 90, l: 50 },
  },
  {
    id: 'bayern',
    name: 'Bayern Munich',
    collectionId: 'germany-bundesliga-2025-2026',
    logoUrl: '/logos/germany-bundesliga-2025-2026/bayern-munchen.football-logos.cc.png',
    dominantColor: { h: 353, s: 99, l: 49 },
    randomStartingColor: { h: 173, s: 90, l: 50 },
  },
  {
    id: 'ajax',
    name: 'Ajax Amsterdam',
    collectionId: 'netherlands-eredivisie-2025-2026',
    logoUrl: '/logos/netherlands-eredivisie-2025-2026/ajax.football-logos.cc.png',
    dominantColor: { h: 3, s: 83, l: 46 },
    randomStartingColor: { h: 183, s: 85, l: 50 },
  },
]
