import { useState } from 'react'
import { collections } from '../data/collections.js'
import { dominantColors } from '../data/dominant-colors.js'
import Footer from '../components/Footer.jsx'
import { getDailyDateString } from '../utils/daily.js'

const TOURNAMENT_LOGOS = {
  'ucl-champions-league-2025-2026':       '/tournaments/tournaments_uefa-champions-league_512x512.football-logos.cc.png',
  'uefa-europa-league-2025-2026':          '/tournaments/tournaments_uefa-europa-league_512x512.football-logos.cc.png',
  'uefa-conference-league-2025-2026':      '/tournaments/tournaments_uefa-conference-league_512x512.football-logos.cc.png',
  'fifa-world-cup-2026':                   '/tournaments/tournaments_fifa-world-cup-2026_512x512.football-logos.cc.png',
  'english-premier-league-2026-2027':      '/tournaments/england_english-premier-league_512x512.football-logos.cc.png',
  'england-efl-championship-2026-2027':    '/tournaments/england_efl-championship_512x512.football-logos.cc.png',
  'spain-la-liga-2025-2026':               '/tournaments/spain_la-liga_512x512.football-logos.cc.png',
  'spain-la-liga-2-2025-2026':             '/tournaments/spain_la-liga-2_512x512.football-logos.cc.png',
  'germany-bundesliga-2025-2026':          '/tournaments/germany_bundesliga_512x512.football-logos.cc.png',
  'italy-serie-a-2025-2026':               '/tournaments/italy_serie-a_512x512.football-logos.cc.png',
  'france-ligue-1-2025-2026':              '/tournaments/france_ligue-1_512x512.football-logos.cc.png',
  'netherlands-eredivisie-2025-2026':      '/tournaments/netherlands_eredivisie_512x512.football-logos.cc.png',
  'belgium-pro-league-2025-2026':          '/tournaments/belgium_belgian-pro-league_512x512.football-logos.cc.png',
  'scotland-premiership-2025-2026':        '/tournaments/scotland_scottish-premiership_512x512.football-logos.cc.png',
  'turkey-super-lig-2025-2026':            '/tournaments/turkey_super-lig_512x512.football-logos.cc.png',
  'argentina-primera-division-2025-2026':  '/tournaments/argentina_argentina-primera-division_512x512.football-logos.cc.png',
  'brazil-serie-a-2025-2026':              '/tournaments/brazil_brazilian-serie-a_512x512.football-logos.cc.png',
  'usa-mls-2025-2026':                     '/tournaments/usa_mls_512x512.football-logos.cc.png',
  'saudi-arabia-pro-league-2025-2026':     '/tournaments/saudi-arabia_saudi-professional-league_512x512.football-logos.cc.png',
  'romania-liga-1-2025-2026':              '/tournaments/romania_superliga_512x512.football-logos.cc.png',
}

const DISPLAY_ORDER = [
  'ucl-champions-league-2025-2026',
  'uefa-europa-league-2025-2026',
  'uefa-conference-league-2025-2026',
  'fifa-world-cup-2026',
  'english-premier-league-2026-2027',
  'spain-la-liga-2025-2026',
  'germany-bundesliga-2025-2026',
  'italy-serie-a-2025-2026',
  'france-ligue-1-2025-2026',
  'netherlands-eredivisie-2025-2026',
  'england-efl-championship-2026-2027',
  'spain-la-liga-2-2025-2026',
  'turkey-super-lig-2025-2026',
  'belgium-pro-league-2025-2026',
  'scotland-premiership-2025-2026',
  'argentina-primera-division-2025-2026',
  'brazil-serie-a-2025-2026',
  'saudi-arabia-pro-league-2025-2026',
  'usa-mls-2025-2026',
  'romania-liga-1-2025-2026',
]

function buildAllCollection() {
  const seen = new Set()
  const teams = []
  for (const col of collections) {
    for (const t of col.teams) {
      if (!seen.has(t.slug)) {
        seen.add(t.slug)
        teams.push({ slug: t.slug, logoFile: t.logoFile, logoUrl: col.logoBasePath + t.logoFile })
      }
    }
  }
  return { id: 'all', name: 'All Teams', logoBasePath: '', teams }
}

const ALL_COLLECTION = buildAllCollection()

function eligibleCount(collection) {
  return collection.teams.filter(t => dominantColors[t.slug] != null).length
}

export default function CollectionSelect({ onSelect, onDailyChallenge, onChallengeFriends }) {
  const sorted = DISPLAY_ORDER
    .map(id => collections.find(c => c.id === id))
    .filter(Boolean)

  const [showInfo, setShowInfo] = useState(false)
  const dailyDate = getDailyDateString()
  const alreadyPlayedToday = !!localStorage.getItem(`crestfc_daily_${dailyDate}`)

  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col items-center py-8 px-4 md:px-6">
      <div className="w-full max-w-5xl">

        {/* Header */}
        <div className="text-center mb-7 md:mb-10 relative">
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-white">
            Crest FC
          </h1>
          <p className="text-zinc-400 mt-1 text-sm font-medium">Football Color Picker</p>
          <p className="text-zinc-600 mt-1 text-xs">Guess the dominant color of football club badges</p>

          {/* Info button */}
          <button
            onClick={() => setShowInfo(true)}
            className="absolute right-0 top-0 w-8 h-8 rounded-full bg-zinc-800 hover:bg-zinc-700 flex items-center justify-center text-zinc-400 hover:text-white transition-all cursor-pointer text-sm font-bold"
            aria-label="How to play"
          >
            i
          </button>
        </div>

        {/* Info modal */}
        {showInfo && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
            onClick={() => setShowInfo(false)}
          >
            <div
              className="bg-zinc-900 border border-zinc-700 rounded-3xl p-6 max-w-sm w-full shadow-2xl"
              onClick={e => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-lg font-extrabold text-white">How to play</h2>
                <button
                  onClick={() => setShowInfo(false)}
                  className="w-7 h-7 rounded-full bg-zinc-800 hover:bg-zinc-700 flex items-center justify-center text-zinc-400 hover:text-white transition-all cursor-pointer text-sm"
                >
                  ✕
                </button>
              </div>

              <ol className="space-y-4">
                {[
                  { n: '1', title: 'Pick a collection', desc: 'Choose a league or competition. You\'ll get 5 random club badges.' },
                  { n: '2', title: 'Study the badge', desc: 'Each badge has its dominant color masked — replaced by a random color.' },
                  { n: '3', title: 'Adjust the sliders', desc: 'Use the Hue, Saturation and Lightness sliders to match the hidden color.' },
                  { n: '4', title: 'Check your score', desc: 'Press Check Score to reveal the correct color and see how close you were (0–100%).' },
                  { n: '5', title: 'Final result', desc: 'After 5 rounds, you get an average score. The closer to 100%, the better!' },
                ].map(({ n, title, desc }) => (
                  <li key={n} className="flex gap-3">
                    <span className="w-6 h-6 rounded-full bg-zinc-700 text-white text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">{n}</span>
                    <div>
                      <p className="text-sm font-semibold text-white">{title}</p>
                      <p className="text-xs text-zinc-400 mt-0.5">{desc}</p>
                    </div>
                  </li>
                ))}
              </ol>

              <button
                onClick={() => setShowInfo(false)}
                className="mt-6 w-full py-3 rounded-2xl bg-green-500 hover:bg-green-400 text-black font-bold text-sm transition-all cursor-pointer"
              >
                Let's play!
              </button>
            </div>
          </div>
        )}


        {/* Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 md:gap-4">

          {/* Daily Challenge */}
          <button
            onClick={alreadyPlayedToday ? undefined : onDailyChallenge}
            disabled={alreadyPlayedToday}
            className={`col-span-2 sm:col-span-3 md:col-span-4 lg:col-span-5 flex items-center gap-5 rounded-2xl border transition-all duration-150 px-6 py-5 ${
              alreadyPlayedToday
                ? 'border-zinc-800 bg-zinc-900/40 opacity-50 cursor-not-allowed'
                : 'border-amber-800/50 bg-gradient-to-r from-amber-950/70 via-yellow-950/60 to-amber-950/70 hover:border-amber-500 hover:brightness-110 active:scale-[0.98] cursor-pointer'
            }`}
          >
            <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shrink-0 shadow-lg shadow-amber-900/50 text-2xl">
              📅
            </div>
            <div className="text-left flex-1 min-w-0">
              <p className="text-base font-extrabold text-white tracking-tight">Daily Challenge</p>
              <p className="text-sm text-amber-300 mt-0.5">Same 5 crests for everyone · {dailyDate}</p>
            </div>
            <div className="shrink-0 text-right">
              {alreadyPlayedToday
                ? <span className="text-xs text-amber-500 font-bold">✓ Played today</span>
                : <span className="text-xs text-amber-400 font-bold uppercase tracking-wide">🏆 Leaderboard</span>
              }
            </div>
          </button>

          {/* Challenge Friends */}
          <button
            onClick={onChallengeFriends}
            className="col-span-2 sm:col-span-3 md:col-span-4 lg:col-span-5 flex items-center gap-5 rounded-2xl border border-violet-800/50 bg-gradient-to-r from-violet-950/70 via-purple-950/60 to-violet-950/70 hover:border-violet-500 hover:brightness-110 active:scale-[0.98] transition-all duration-150 cursor-pointer px-6 py-5"
          >
            <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-violet-500 to-purple-700 flex items-center justify-center shrink-0 shadow-lg shadow-violet-900/50 text-2xl">
              ⚔️
            </div>
            <div className="text-left flex-1 min-w-0">
              <p className="text-base font-extrabold text-white tracking-tight">Challenge Friends</p>
              <p className="text-sm text-violet-300 mt-0.5">Generate a link · everyone plays the same 5 crests</p>
            </div>
            <div className="shrink-0 text-right">
              <span className="text-xs text-violet-400 font-bold uppercase tracking-wide">🏆 Leaderboard</span>
            </div>
          </button>

          {/* All Teams — special card spanning full first row feel */}
          {(() => {
            const count = eligibleCount(ALL_COLLECTION)
            return (
              <button
                onClick={() => onSelect(ALL_COLLECTION)}
                className="col-span-2 sm:col-span-3 md:col-span-4 lg:col-span-5 flex items-center gap-5 rounded-2xl border border-indigo-800/60 bg-gradient-to-r from-indigo-950 via-purple-950 to-indigo-950 hover:border-indigo-500 hover:brightness-110 active:scale-[0.98] transition-all duration-150 cursor-pointer px-6 py-5"
              >
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shrink-0 shadow-lg shadow-indigo-900/60">
                  <span className="text-2xl font-black text-white leading-none">∞</span>
                </div>
                <div className="text-left">
                  <p className="text-base font-extrabold text-white tracking-tight">All Teams</p>
                  <p className="text-sm text-indigo-300 mt-0.5">{count} teams from all collections</p>
                </div>
              </button>
            )
          })()}

          {sorted.map(col => {
            const logoSrc = TOURNAMENT_LOGOS[col.id]
            const count   = eligibleCount(col)
            const disabled = count < 5

            return (
              <button
                key={col.id}
                disabled={disabled}
                onClick={() => onSelect(col)}
                className={[
                  'group relative flex flex-col rounded-2xl border overflow-hidden transition-all duration-150',
                  'aspect-square',
                  disabled
                    ? 'border-zinc-800 bg-zinc-900/30 opacity-35 cursor-not-allowed'
                    : 'border-zinc-800 bg-zinc-900 hover:border-zinc-500 hover:bg-zinc-800 hover:scale-[1.04] active:scale-[0.97] cursor-pointer',
                ].join(' ')}
              >
                {/* Logo */}
                <div className="flex-1 flex items-center justify-center p-4 min-h-0">
                  {logoSrc ? (
                    <img
                      src={logoSrc}
                      alt={col.name}
                      className="w-full h-full object-contain drop-shadow-lg"
                    />
                  ) : (
                    <span className="text-4xl">⚽</span>
                  )}
                </div>

                {/* Name + count */}
                <div className="shrink-0 px-2 pb-2.5 pt-1 border-t border-zinc-800/80 bg-zinc-900/90">
                  <p className="text-[11px] font-semibold text-white leading-tight truncate text-center">
                    {col.name.replace(/\s+\d{4}\/\d{2,4}$/, '').replace(/\s+\d{4}-\d{4}$/, '')}
                  </p>
                  <p className="text-[10px] text-zinc-500 text-center mt-0.5">{count} teams</p>
                </div>
              </button>
            )
          })}
        </div>

        <Footer />
      </div>
    </div>
  )
}
