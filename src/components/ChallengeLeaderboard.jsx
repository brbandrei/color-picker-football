import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase.js'

const MEDALS = ['🥇', '🥈', '🥉']

function scoreColor(pct) {
  if (pct >= 80) return '#4ade80'
  if (pct >= 60) return '#facc15'
  if (pct >= 40) return '#fb923c'
  return '#f87171'
}

function fmt(ts) {
  const d = new Date(ts)
  return `${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}`
}

export default function ChallengeLeaderboard({ challengeId, highlightNickname }) {
  const [entries, setEntries] = useState([])
  const [loading, setLoading] = useState(true)
  const [lastRefresh, setLastRefresh] = useState(null)

  const fetch = useCallback(async () => {
    if (!supabase) return
    const { data } = await supabase
      .from('challenge_scores')
      .select('nickname, score, completed_at')
      .eq('challenge_id', challengeId)
      .order('score', { ascending: false })
      .order('completed_at', { ascending: true })
    setEntries(data || [])
    setLoading(false)
    setLastRefresh(new Date())
  }, [challengeId])

  useEffect(() => {
    fetch()
    const id = setInterval(fetch, 5000)
    return () => clearInterval(id)
  }, [fetch])

  if (!supabase) return null

  return (
    <div className="mt-5">
      <div className="flex items-center justify-between mb-3">
        <p className="text-xs text-violet-400 font-bold uppercase tracking-widest">Leaderboard</p>
        {lastRefresh && (
          <p className="text-[10px] text-zinc-600">
            updated {fmt(lastRefresh)} · auto-refreshes
          </p>
        )}
      </div>

      {loading ? (
        <div className="flex justify-center py-4">
          <div className="w-5 h-5 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : entries.length === 0 ? (
        <p className="text-center text-sm text-zinc-500 py-3">No scores yet.</p>
      ) : (
        <div className="bg-zinc-900 rounded-2xl border border-zinc-800 overflow-hidden">
          {entries.map((e, i) => {
            const isMe = highlightNickname &&
              e.nickname.toLowerCase() === highlightNickname.toLowerCase()
            return (
              <div
                key={i}
                className={`flex items-center gap-3 px-4 py-3 ${i < entries.length - 1 ? 'border-b border-zinc-800' : ''} ${isMe ? 'bg-violet-950/40' : ''}`}
              >
                <span className="w-6 text-center shrink-0">
                  {i < 3
                    ? <span className="text-base">{MEDALS[i]}</span>
                    : <span className="text-zinc-500 font-mono text-xs">{i + 1}</span>
                  }
                </span>
                <span className={`flex-1 text-sm font-semibold truncate ${isMe ? 'text-violet-300' : 'text-white'}`}>
                  {e.nickname}
                  {isMe && <span className="ml-1 text-[10px] text-violet-500">← you</span>}
                </span>
                <span className="text-xs text-zinc-600 shrink-0 mr-2">{fmt(e.completed_at)}</span>
                <span className="text-sm font-bold tabular-nums shrink-0 w-10 text-right" style={{ color: scoreColor(e.score) }}>
                  {e.score}%
                </span>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
