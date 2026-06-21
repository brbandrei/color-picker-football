import { collections } from '../data/collections.js'
import { dominantColors } from '../data/dominant-colors.js'
import Footer from '../components/Footer.jsx'

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

export default function CollectionSelect({ onSelect }) {
  const sorted = DISPLAY_ORDER
    .map(id => collections.find(c => c.id === id))
    .filter(Boolean)

  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col items-center py-8 px-4 md:px-6">
      <div className="w-full max-w-5xl">

        {/* Header */}
        <div className="text-center mb-7 md:mb-10">
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-white">
            Football Color Matcher
          </h1>
          <p className="text-zinc-500 mt-2 text-sm">Choose a collection to play</p>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 md:gap-4">

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
