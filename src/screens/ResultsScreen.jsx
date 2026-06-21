import Footer from '../components/Footer.jsx'

function scoreColor(pct) {
  if (pct >= 80) return '#4ade80'
  if (pct >= 60) return '#facc15'
  if (pct >= 40) return '#fb923c'
  return '#f87171'
}

export default function ResultsScreen({ roundTeams, roundScores, collectionName, onPlayAgain, onChangeCollection }) {
  const avg = Math.round(roundScores.reduce((s, x) => s + x, 0) / roundScores.length)

  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center py-8 px-4">
      <div className="w-full max-w-lg">

        {/* Score total */}
        <div className="text-center mb-6 md:mb-8">
          <p className="text-xs text-zinc-500 uppercase tracking-widest mb-2 truncate px-4">{collectionName}</p>
          <p className="text-6xl md:text-7xl font-extrabold tabular-nums" style={{ color: scoreColor(avg) }}>
            {avg}%
          </p>
        </div>

        {/* Per-round breakdown */}
        <div className="bg-zinc-900 rounded-3xl border border-zinc-800 overflow-hidden mb-5 md:mb-6">
          {roundTeams.map((team, i) => {
            const pct = roundScores[i] ?? 0
            const correctHsl = `hsl(${team.dominantColor.h},${team.dominantColor.s}%,${team.dominantColor.l}%)`
            return (
              <div
                key={team.slug}
                className={`flex items-center gap-3 md:gap-4 px-4 md:px-5 py-3 md:py-4 ${i < roundTeams.length - 1 ? 'border-b border-zinc-800' : ''}`}
              >
                {/* Color dot */}
                <div
                  className="w-8 h-8 md:w-9 md:h-9 rounded-full shrink-0 border-2 border-zinc-700"
                  style={{ background: correctHsl }}
                />
                {/* Team name */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-white truncate">{team.name}</p>
                </div>
                {/* Score + bar */}
                <div className="flex items-center gap-2 md:gap-3 shrink-0">
                  <div className="w-16 md:w-24 h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all"
                      style={{ width: `${pct}%`, background: scoreColor(pct) }}
                    />
                  </div>
                  <span
                    className="text-sm font-bold tabular-nums w-10 text-right"
                    style={{ color: scoreColor(pct) }}
                  >
                    {pct}%
                  </span>
                </div>
              </div>
            )
          })}
        </div>

        {/* Actions */}
        <div className="space-y-3">
          <button
            onClick={onPlayAgain}
            className="w-full py-4 rounded-2xl bg-green-500 hover:bg-green-400 active:scale-[0.97] text-black font-bold text-base tracking-wide transition-all duration-150 cursor-pointer"
          >
            Play again with same collection
          </button>
          <button
            onClick={onChangeCollection}
            className="w-full py-4 rounded-2xl bg-zinc-800 hover:bg-zinc-700 active:scale-[0.97] text-white font-bold text-base tracking-wide transition-all duration-150 cursor-pointer"
          >
            Change collection
          </button>
        </div>

        <Footer />
      </div>
    </div>
  )
}
