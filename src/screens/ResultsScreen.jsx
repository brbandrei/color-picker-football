import { useState, useEffect } from 'react'
import Footer from '../components/Footer.jsx'
import ChallengeLeaderboard from '../components/ChallengeLeaderboard.jsx'
import { supabase } from '../lib/supabase.js'

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
    `${scoreEmoji(roundScores[i])} ${t.name}: ${roundScores[i]}%`)
  return [`🎯 Crest FC — ${collectionName}`, '', ...lines, '', `Average: ${avg}%`, 'crestfc.xyz'].join('\n')
}

async function submitAndGetPercentile(date, score) {
  if (!supabase) return null
  await supabase.from('daily_scores').insert({ date, score })
  const [{ count: total }, { count: below }] = await Promise.all([
    supabase.from('daily_scores').select('*', { count: 'exact', head: true }).eq('date', date),
    supabase.from('daily_scores').select('*', { count: 'exact', head: true }).eq('date', date).lt('score', score),
  ])
  if (!total || total < 2) return null
  return Math.round((below / total) * 100)
}

async function submitChallengeScore(challengeId, nickname, score) {
  if (!supabase) return
  await supabase.from('challenge_scores').insert({ challenge_id: challengeId, nickname, score })
}

export default function ResultsScreen({
  roundTeams, roundScores, collectionName,
  onPlayAgain, onChangeCollection,
  isDailyChallenge, dailyDate,
  isChallengeMode, challengeId, challengeNickname,
}) {
  const avg = Math.round(roundScores.reduce((s, x) => s + x, 0) / roundScores.length)
  const [toast, setToast] = useState(null)
  const [percentile, setPercentile] = useState(undefined)
  const [challengeSubmitted, setChallengeSubmitted] = useState(false)

  // Daily percentile submit
  useEffect(() => {
    if (!isDailyChallenge || !dailyDate) return
    const key = `crestfc_daily_${dailyDate}`
    const saved = parseInt(localStorage.getItem(`${key}_pct`), 10)
    if (localStorage.getItem(key)) {
      setPercentile(isNaN(saved) ? null : saved)
      return
    }
    localStorage.setItem(key, '1')
    submitAndGetPercentile(dailyDate, avg).then(pct => {
      setPercentile(pct)
      if (pct !== null) localStorage.setItem(`${key}_pct`, String(pct))
    })
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Challenge score submit
  useEffect(() => {
    if (!isChallengeMode || !challengeId || !challengeNickname) return
    submitChallengeScore(challengeId, challengeNickname, avg).then(() => setChallengeSubmitted(true))
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  function showToast(type) {
    setToast(type)
    setTimeout(() => setToast(null), 2500)
  }

  async function handleShare() {
    const text = buildShareText(collectionName, roundTeams, roundScores, avg)
    if (navigator.share) {
      try { await navigator.share({ text }); showToast('shared') } catch {}
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
        <div className="bg-zinc-900 rounded-3xl border border-zinc-800 overflow-hidden mb-5">
          {roundTeams.map((team, i) => {
            const pct = roundScores[i] ?? 0
            const correctHsl = `hsl(${team.dominantColor.h},${team.dominantColor.s}%,${team.dominantColor.l}%)`
            return (
              <div key={team.slug} className={`flex items-center gap-3 md:gap-4 px-4 md:px-5 py-3 md:py-4 ${i < roundTeams.length - 1 ? 'border-b border-zinc-800' : ''}`}>
                <div className="w-8 h-8 md:w-9 md:h-9 rounded-full shrink-0 border-2 border-zinc-700" style={{ background: correctHsl }} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-white truncate">{team.name}</p>
                </div>
                <div className="flex items-center gap-2 md:gap-3 shrink-0">
                  <div className="w-16 md:w-24 h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                    <div className="h-full rounded-full" style={{ width: `${pct}%`, background: scoreColor(pct) }} />
                  </div>
                  <span className="text-sm font-bold tabular-nums w-10 text-right" style={{ color: scoreColor(pct) }}>{pct}%</span>
                </div>
              </div>
            )
          })}
        </div>

        {/* Daily percentile */}
        {isDailyChallenge && (
          <div className="bg-amber-950/30 border border-amber-800/40 rounded-2xl px-5 py-4 mb-4 text-center">
            {percentile === undefined && (
              <div className="flex items-center justify-center gap-2 text-amber-400 text-sm">
                <div className="w-4 h-4 border-2 border-amber-400 border-t-transparent rounded-full animate-spin" />
                Calculating your ranking...
              </div>
            )}
            {percentile === null && <p className="text-amber-400 text-sm">You're among the first to play today!</p>}
            {percentile !== null && percentile !== undefined && (
              <>
                <p className="text-3xl font-extrabold text-white">{percentile}%</p>
                <p className="text-amber-300 text-sm mt-1">
                  You scored better than <span className="font-bold text-white">{percentile}%</span> of today's players
                </p>
              </>
            )}
          </div>
        )}

        {/* Challenge leaderboard */}
        {isChallengeMode && (
          <div className="bg-violet-950/20 border border-violet-800/30 rounded-2xl px-4 py-4 mb-4">
            {!challengeSubmitted ? (
              <div className="flex items-center justify-center gap-2 text-violet-400 text-sm py-2">
                <div className="w-4 h-4 border-2 border-violet-400 border-t-transparent rounded-full animate-spin" />
                Submitting score...
              </div>
            ) : (
              <ChallengeLeaderboard challengeId={challengeId} highlightNickname={challengeNickname} />
            )}
          </div>
        )}

        {/* Actions */}
        <div className="space-y-3">
          <button onClick={handleShare} className="w-full py-4 rounded-2xl bg-zinc-700 hover:bg-zinc-600 active:scale-[0.97] text-white font-bold text-base tracking-wide transition-all cursor-pointer flex items-center justify-center gap-2">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/>
              <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>
            </svg>
            Share result
          </button>
          {!isDailyChallenge && !isChallengeMode && (
            <button onClick={onPlayAgain} className="w-full py-4 rounded-2xl bg-green-500 hover:bg-green-400 active:scale-[0.97] text-black font-bold text-base tracking-wide transition-all cursor-pointer">
              Play again with same collection
            </button>
          )}
          <button onClick={onChangeCollection} className="w-full py-4 rounded-2xl bg-zinc-800 hover:bg-zinc-700 active:scale-[0.97] text-white font-bold text-base tracking-wide transition-all cursor-pointer">
            {isDailyChallenge || isChallengeMode ? 'Back to collections' : 'Change collection'}
          </button>
        </div>

        <Footer />
      </div>

      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-zinc-800 border border-zinc-700 text-white text-sm font-semibold px-5 py-3 rounded-2xl shadow-xl flex items-center gap-2 animate-fade-in">
          <span>{toast === 'copied' ? '📋' : '✅'}</span>
          {toast === 'copied' ? 'Copied to clipboard!' : 'Shared!'}
        </div>
      )}
    </div>
  )
}
