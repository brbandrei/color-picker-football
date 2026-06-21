import { useState } from 'react'

export default function ChallengeLobby({ challengeId, isCreator, isLoading, error, onPlay, onBack }) {
  const [nickname, setNickname] = useState(localStorage.getItem('crestfc_nickname') || '')
  const [copied, setCopied] = useState(false)

  const link = `${window.location.origin}/challenge/${challengeId}`

  async function copyLink() {
    await navigator.clipboard.writeText(link)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  function handlePlay() {
    const nick = nickname.trim().slice(0, 20)
    localStorage.setItem('crestfc_nickname', nick)
    onPlay(nick)
  }

  if (isLoading) return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
      <div className="text-center space-y-4">
        <div className="w-10 h-10 border-2 border-violet-500 border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-zinc-400 text-sm">Loading challenge...</p>
      </div>
    </div>
  )

  if (error) return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center px-4">
      <div className="text-center space-y-4 max-w-sm">
        <p className="text-4xl">🤔</p>
        <p className="text-white font-bold text-lg">Challenge not found</p>
        <p className="text-zinc-500 text-sm">This link may be invalid or expired.</p>
        <button onClick={onBack} className="mt-4 px-6 py-3 rounded-2xl bg-zinc-800 hover:bg-zinc-700 text-white font-bold text-sm cursor-pointer transition-all">
          Back to home
        </button>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center py-10 px-4">
      <div className="w-full max-w-sm space-y-6">

        {/* Header */}
        <div className="text-center">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-700 flex items-center justify-center text-3xl mx-auto mb-4 shadow-lg shadow-violet-900/50">
            ⚔️
          </div>
          <h1 className="text-2xl font-extrabold text-white">
            {isCreator ? 'Challenge created!' : "You've been challenged!"}
          </h1>
          <p className="text-zinc-500 text-sm mt-1">
            {isCreator ? 'Share the link, then play yourself.' : 'Enter a nickname and show what you\'ve got.'}
          </p>
        </div>

        {/* Link (creator only) */}
        {isCreator && (
          <div className="bg-zinc-900 border border-zinc-700 rounded-2xl p-4 space-y-3">
            <p className="text-xs text-zinc-500 uppercase tracking-wide font-semibold">Your challenge link</p>
            <div className="flex items-center gap-2">
              <p className="flex-1 text-sm text-violet-300 font-mono truncate bg-zinc-800 rounded-lg px-3 py-2">
                {link}
              </p>
              <button
                onClick={copyLink}
                className="shrink-0 px-4 py-2 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-bold text-sm cursor-pointer transition-all"
              >
                {copied ? '✓' : 'Copy'}
              </button>
            </div>
          </div>
        )}

        {/* Nickname + Play */}
        <div className="space-y-3">
          <input
            type="text"
            placeholder="Your nickname"
            maxLength={20}
            value={nickname}
            onChange={e => setNickname(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && nickname.trim() && handlePlay()}
            className="w-full bg-zinc-900 border border-zinc-700 rounded-2xl px-5 py-4 text-white placeholder-zinc-500 outline-none focus:border-violet-500 transition-colors text-base"
          />
          <button
            onClick={handlePlay}
            disabled={!nickname.trim()}
            className="w-full py-4 rounded-2xl bg-violet-600 hover:bg-violet-500 disabled:opacity-40 text-white font-bold text-base tracking-wide transition-all cursor-pointer"
          >
            Play challenge
          </button>
          <button
            onClick={onBack}
            className="w-full py-3 rounded-2xl bg-zinc-800 hover:bg-zinc-700 text-zinc-400 font-semibold text-sm transition-all cursor-pointer"
          >
            Back to home
          </button>
        </div>

      </div>
    </div>
  )
}
