import { useState } from 'react'
import Footer from '../components/Footer.jsx'

function scoreColor(pct) {
  if (pct >= 80) return '#4ade80'
  if (pct >= 60) return '#facc15'
  if (pct >= 40) return '#fb923c'
  return '#f87171'
}

function scoreEmoji(pct) {
  if (pct >= 80) return '🟩'
  if (pct >= 60) return '🟨'
  if (pct >= 40) return '🟧'
  return '🟥'
}

function buildShareText(collectionName, roundTeams, roundScores, avg) {
  const lines = roundTeams.map((t, i) =>
    `${scoreEmoji(roundScores[i])} ${t.name}: ${roundScores[i]}%`
  )
  return [
    `🎯 Crest FC — ${collectionName}`,
    '',
    ...lines,
    '',
    `Average: ${avg}%`,
    'crestfc.xyz',
  ].join('\n')
}

export default function ResultsScreen({ roundTeams, roundScores, collectionName, onPlayAgain, onChangeCollection }) {
  const avg = Math.round(roundScores.reduce((s, x) => s + x, 0) / roundScores.length)
  const [toast, setToast] = useState(null) // 'shared' | 'copied' | null

  function showToast(type) {
    setToast(type)
    setTimeout(() => setToast(null), 2500)
  }

  async function handleShare() {
    const text = buildShareText(collectionName, roundTeams, roundScores, avg)
    if (navigator.share) {
      try {
        await navigator.share({ text })
        showToast('shared')
      } catch {
        // user cancelled — do nothing
      }
    } else {
      await navigator.clipboard.writeText(text)
      showToast('copied')
    }
  }

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
                <div
                  className="w-8 h-8 md:w-9 md:h-9 rounded-full shrink-0 border-2 border-zinc-700"
                  style={{ background: correctHsl }}
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-white truncate">{team.name}</p>
                </div>
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

          {/* Share button */}
          <button
            onClick={handleShare}
            className="w-full py-4 rounded-2xl bg-zinc-700 hover:bg-zinc-600 active:scale-[0.97] text-white font-bold text-base tracking-wide transition-all duration-150 cursor-pointer flex items-center justify-center gap-2"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/>
              <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>
            </svg>
            Share result
          </button>

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

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-zinc-800 border border-zinc-700 text-white text-sm font-semibold px-5 py-3 rounded-2xl shadow-xl flex items-center gap-2 animate-fade-in">
          <span>{toast === 'copied' ? '📋' : '✅'}</span>
          {toast === 'copied' ? 'Copied to clipboard!' : 'Shared!'}
        </div>
      )}
    </div>
  )
}
