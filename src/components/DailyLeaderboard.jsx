import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase.js'

const MEDALS = ['🥇', '🥈', '🥉']

function scoreColor(pct) {
  if (pct >= 80) return '#4ade80'
  if (pct >= 60) return '#facc15'
  if (pct >= 40) return '#fb923c'
  return '#f87171'
}

export default function DailyLeaderboard({ date, highlightNickname }) {
  const [entries, setEntries] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!supabase) { setLoading(false); return }
    supabase
      .from('daily_scores')
      .select('nickname, score, created_at')
      .eq('date', date)
      .order('score', { ascending: false })
      .order('created_at', { ascending: true })
      .limit(20)
      .then(({ data }) => { setEntries(data || []); setLoading(false) })
  }, [date])

  if (!supabase) return (
    <p className="text-center text-xs text-zinc-600 mt-4">Leaderboard not configured.</p>
  )

  if (loading) return (
    <div className="flex justify-center mt-6">
      <div className="w-6 h-6 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
    </div>
  )

  if (entries.length === 0) return (
    <p className="text-center text-sm text-zinc-500 mt-4">No scores yet today — be the first!</p>
  )

  const myIndex = highlightNickname
    ? entries.findIndex(e => e.nickname.toLowerCase() === highlightNickname.toLowerCase())
    : -1

  return (
    <div className="mt-5">
      <p className="text-xs text-amber-400 font-bold uppercase tracking-widest text-center mb-3">
        Today's Leaderboard
      </p>
      <div className="bg-zinc-900 rounded-2xl border border-zinc-800 overflow-hidden">
        {entries.map((e, i) => {
          const isMe = i === myIndex
          return (
            <div
              key={i}
              className={`flex items-center gap-3 px-4 py-3 ${i < entries.length - 1 ? 'border-b border-zinc-800' : ''} ${isMe ? 'bg-amber-950/40' : ''}`}
            >
              <span className="w-6 text-center text-sm shrink-0">
                {i < 3 ? MEDALS[i] : <span className="text-zinc-500 font-mono text-xs">{i + 1}</span>}
              </span>
              <span className={`flex-1 text-sm font-semibold truncate ${isMe ? 'text-amber-300' : 'text-white'}`}>
                {e.nickname}
                {isMe && <span className="ml-1 text-[10px] text-amber-500">← you</span>}
              </span>
              <span className="text-sm font-bold tabular-nums shrink-0" style={{ color: scoreColor(e.score) }}>
                {e.score}%
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
