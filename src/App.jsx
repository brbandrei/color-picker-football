import { useState, useEffect } from 'react'
import { dominantColors } from './data/dominant-colors.js'
import { collections as allCollections } from './data/collections.js'
import VerticalColorSlider from './components/VerticalColorSlider.jsx'
import MaskedLogo from './components/MaskedLogo.jsx'
import CollectionSelect from './screens/CollectionSelect.jsx'
import ResultsScreen from './screens/ResultsScreen.jsx'
import ChallengeLobby from './screens/ChallengeLobby.jsx'
import { calculateScore } from './utils/color.js'
import { getDailyDateString, getDailySeed, seededShuffle, lcg } from './utils/daily.js'
import { supabase } from './lib/supabase.js'

const ROUNDS_PER_GAME = 5

const HUE_TRACK =
  'linear-gradient(to right,' +
  'hsl(0,100%,50%),hsl(30,100%,50%),hsl(60,100%,50%),' +
  'hsl(90,100%,50%),hsl(120,100%,50%),hsl(150,100%,50%),' +
  'hsl(180,100%,50%),hsl(210,100%,50%),hsl(240,100%,50%),' +
  'hsl(270,100%,50%),hsl(300,100%,50%),hsl(330,100%,50%),' +
  'hsl(360,100%,50%))'

// Detect /challenge/[id] on initial load
const challengePathMatch = window.location.pathname.match(/^\/challenge\/([a-z0-9]+)$/i)

function slugToName(slug) {
  return slug.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')
}

function generateChallengeId() {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789'
  return Array.from({ length: 7 }, () => chars[Math.floor(Math.random() * chars.length)]).join('')
}

function idToSeed(id) {
  return id.split('').reduce((acc, c, i) => acc + c.charCodeAt(0) * (i + 1), 0)
}

function buildTeamsFromSlugs(slugs, challengeId) {
  const slugToLogoUrl = {}
  for (const col of allCollections) {
    for (const t of col.teams) {
      if (!slugToLogoUrl[t.slug]) {
        slugToLogoUrl[t.slug] = col.logoBasePath + t.logoFile
      }
    }
  }
  const rng = lcg(idToSeed(challengeId))
  return slugs.map(slug => {
    const dc = dominantColors[slug]
    return {
      slug,
      name: slugToName(slug),
      logoUrl: slugToLogoUrl[slug] || '',
      dominantColor: dc,
      randomStartingColor: { h: (dc.h + 150 + Math.floor(rng() * 60)) % 360, s: 80, l: 50 },
    }
  })
}

function buildDailyTeams() {
  const seen = new Set()
  const all = []
  for (const col of allCollections) {
    for (const t of col.teams) {
      if (!seen.has(t.slug) && dominantColors[t.slug] != null) {
        seen.add(t.slug)
        all.push({ slug: t.slug, logoUrl: col.logoBasePath + t.logoFile })
      }
    }
  }
  const seed = getDailySeed()
  const picked = seededShuffle(all, seed).slice(0, ROUNDS_PER_GAME)
  const rng = lcg(seed + 999)
  return picked.map(t => {
    const dc = dominantColors[t.slug]
    return {
      slug: t.slug,
      name: slugToName(t.slug),
      logoUrl: t.logoUrl,
      dominantColor: dc,
      randomStartingColor: { h: (dc.h + 150 + Math.floor(rng() * 60)) % 360, s: 80, l: 50 },
    }
  })
}

function shuffle(arr) {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

function buildRoundTeams(collection) {
  const eligible = collection.teams.filter(t => dominantColors[t.slug] != null)
  return shuffle(eligible).slice(0, ROUNDS_PER_GAME).map(t => {
    const dc = dominantColors[t.slug]
    return {
      slug: t.slug,
      name: slugToName(t.slug),
      logoUrl: t.logoUrl ?? (collection.logoBasePath + t.logoFile),
      dominantColor: dc,
      randomStartingColor: {
        h: (dc.h + 150 + Math.floor(Math.random() * 60)) % 360,
        s: 80,
        l: 50,
      },
    }
  })
}

function timerColor(t) {
  if (t > 15) return '#4ade80'
  if (t > 8)  return '#facc15'
  return '#f87171'
}

function scoreColor(pct) {
  if (pct >= 80) return '#4ade80'
  if (pct >= 60) return '#facc15'
  if (pct >= 40) return '#fb923c'
  return '#f87171'
}

function useResponsive() {
  const get = () => {
    const mobile = window.innerWidth < 640
    return { logoSize: mobile ? 185 : 240, trackH: mobile ? 14 : 10, thumbSize: mobile ? 34 : 22 }
  }
  const [vals, setVals] = useState(get)
  useEffect(() => {
    const update = () => setVals(get())
    window.addEventListener('resize', update)
    return () => window.removeEventListener('resize', update)
  }, [])
  return vals
}

function goHome(setScreen) {
  setScreen('select')
  history.pushState(null, '', '/')
}

// ── Main App ────────────────────────────────────────────────────────────────

export default function App() {
  const [screen, setScreen] = useState(challengePathMatch ? 'challenge-join' : 'select')
  const [collection, setCollection] = useState(null)
  const [roundTeams, setRoundTeams] = useState([])
  const [currentRound, setCurrentRound] = useState(0)
  const [roundScores, setRoundScores] = useState([])
  const [isDailyChallenge, setIsDailyChallenge] = useState(false)

  // Challenge state
  const [isChallengeMode, setIsChallengeMode] = useState(false)
  const [challengeId, setChallengeId] = useState(challengePathMatch?.[1] ?? null)
  const [challengeNickname, setChallengeNickname] = useState('')
  const [challengeIsCreator, setChallengeIsCreator] = useState(false)
  const [challengeLoading, setChallengeLoading] = useState(!!challengePathMatch)
  const [challengeError, setChallengeError] = useState(false)

  // Per-round game state
  const { logoSize, trackH, thumbSize } = useResponsive()
  const [guess, setGuess] = useState({ h: 0, s: 80, l: 50 })
  const [phase, setPhase] = useState('playing')
  const [score, setScore] = useState(null)
  const [timeLeft, setTimeLeft] = useState(30)

  const currentTeam = roundTeams[currentRound]

  // Load challenge teams when joining via URL
  useEffect(() => {
    if (screen !== 'challenge-join' || !challengeId) return
    if (!supabase) { setChallengeError(true); setChallengeLoading(false); return }
    supabase.from('challenges').select('team_slugs').eq('id', challengeId).single()
      .then(({ data, error }) => {
        if (error || !data) { setChallengeError(true); setChallengeLoading(false); return }
        setRoundTeams(buildTeamsFromSlugs(data.team_slugs, challengeId))
        setCollection({ id: 'challenge', name: 'Friend Challenge', logoBasePath: '', teams: [] })
        setChallengeLoading(false)
      })
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Reset guess + timer when round changes
  useEffect(() => {
    if (currentTeam) {
      setGuess({ ...currentTeam.randomStartingColor })
      setPhase('playing')
      setScore(null)
      setTimeLeft(30)
    }
  }, [currentRound, roundTeams])

  // Countdown
  useEffect(() => {
    if (phase !== 'playing') return
    if (timeLeft === 0) { handleVerify(); return }
    const id = setTimeout(() => setTimeLeft(t => t - 1), 1000)
    return () => clearTimeout(id)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timeLeft, phase])

  function handleSelectCollection(col) {
    const teams = buildRoundTeams(col)
    setCollection(col)
    setRoundTeams(teams)
    setCurrentRound(0)
    setRoundScores([])
    setIsDailyChallenge(false)
    setIsChallengeMode(false)
    setScreen('game')
  }

  function handleDailyChallenge() {
    const teams = buildDailyTeams()
    const date = getDailyDateString()
    setCollection({ id: 'daily', name: `Daily Challenge — ${date}`, logoBasePath: '', teams: [] })
    setRoundTeams(teams)
    setCurrentRound(0)
    setRoundScores([])
    setIsDailyChallenge(true)
    setIsChallengeMode(false)
    setScreen('game')
  }

  async function handleCreateChallenge() {
    const seen = new Set()
    const all = []
    for (const col of allCollections) {
      for (const t of col.teams) {
        if (!seen.has(t.slug) && dominantColors[t.slug] != null) {
          seen.add(t.slug)
          all.push(t.slug)
        }
      }
    }
    const slugs = shuffle(all).slice(0, ROUNDS_PER_GAME)
    const id = generateChallengeId()
    if (supabase) {
      await supabase.from('challenges').insert({ id, team_slugs: slugs })
    }
    setChallengeId(id)
    setRoundTeams(buildTeamsFromSlugs(slugs, id))
    setCollection({ id: 'challenge', name: 'Friend Challenge', logoBasePath: '', teams: [] })
    setCurrentRound(0)
    setRoundScores([])
    setIsChallengeMode(true)
    setChallengeIsCreator(true)
    setChallengeError(false)
    setScreen('challenge-lobby')
  }

  function handlePlayChallenge(nickname) {
    setChallengeNickname(nickname)
    setIsDailyChallenge(false)
    setIsChallengeMode(true)
    setCurrentRound(0)
    setRoundScores([])
    setScreen('game')
  }

  function handleVerify() {
    const pct = calculateScore(guess, currentTeam.dominantColor)
    setScore(pct)
    setPhase('revealed')
  }

  function handleNextRound() {
    const newScores = [...roundScores, score]
    setRoundScores(newScores)
    if (currentRound + 1 >= ROUNDS_PER_GAME) {
      setScreen('results')
    } else {
      setCurrentRound(r => r + 1)
    }
  }

  // ── Screens ──────────────────────────────────────────────────────────────

  if (screen === 'select') {
    return (
      <CollectionSelect
        onSelect={handleSelectCollection}
        onDailyChallenge={handleDailyChallenge}
        onChallengeFriends={handleCreateChallenge}
      />
    )
  }

  if (screen === 'challenge-lobby') {
    return (
      <ChallengeLobby
        challengeId={challengeId}
        isCreator={challengeIsCreator}
        isLoading={false}
        error={false}
        onPlay={handlePlayChallenge}
        onBack={() => goHome(setScreen)}
      />
    )
  }

  if (screen === 'challenge-join') {
    return (
      <ChallengeLobby
        challengeId={challengeId}
        isCreator={false}
        isLoading={challengeLoading}
        error={challengeError}
        onPlay={handlePlayChallenge}
        onBack={() => goHome(setScreen)}
      />
    )
  }

  if (screen === 'results') {
    return (
      <ResultsScreen
        roundTeams={roundTeams}
        roundScores={roundScores}
        collectionName={collection?.name ?? ''}
        onPlayAgain={() => isDailyChallenge ? handleDailyChallenge() : handleSelectCollection(collection)}
        onChangeCollection={() => goHome(setScreen)}
        isDailyChallenge={isDailyChallenge}
        dailyDate={getDailyDateString()}
        isChallengeMode={isChallengeMode}
        challengeId={challengeId}
        challengeNickname={challengeNickname}
      />
    )
  }

  // ── Game screen ───────────────────────────────────────────────────────────
  if (!currentTeam) return null

  const { h, s, l } = guess
  const dominant   = currentTeam.dominantColor
  const guessHsl   = `hsl(${h},${s}%,${l}%)`
  const correctHsl = `hsl(${dominant.h},${dominant.s}%,${dominant.l}%)`
  const logoColor  = phase === 'revealed' ? dominant : guess

  const satTrack = `linear-gradient(to right, hsl(${h},0%,${l}%), hsl(${h},100%,${l}%))`
  const litTrack = `linear-gradient(to right, hsl(${h},${s}%,5%), hsl(${h},${s}%,50%), hsl(${h},${s}%,95%))`

  return (
    <div className="min-h-screen bg-zinc-950 flex items-start md:items-center justify-center p-3 md:p-4 pt-4 md:pt-4">
      <div className="w-full max-w-lg">

        <div className="bg-zinc-900 rounded-3xl border border-zinc-800 shadow-2xl overflow-hidden">

          {/* Progress bar */}
          <div className="h-1 bg-zinc-800">
            <div
              className="h-full bg-green-500 transition-all duration-500 rounded-full"
              style={{ width: `${((currentRound + (phase === 'revealed' ? 1 : 0)) / ROUNDS_PER_GAME) * 100}%` }}
            />
          </div>

          {/* Header */}
          <div className="flex items-center gap-3 px-4 md:px-6 py-3 md:py-4 border-b border-zinc-800/60">
            <button
              onClick={() => goHome(setScreen)}
              className="shrink-0 w-8 h-8 flex items-center justify-center rounded-xl bg-zinc-800 hover:bg-zinc-700 active:scale-90 transition-all duration-150 cursor-pointer text-zinc-400 hover:text-white"
              aria-label="Back to collections"
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M10 3L5 8L10 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
            <div className="min-w-0 flex-1">
              <h1 className="text-sm md:text-base font-extrabold tracking-tight text-white leading-tight truncate">
                {collection?.name}
              </h1>
              {isChallengeMode && challengeNickname && (
                <p className="text-xs text-violet-400 mt-0.5 hidden sm:block">
                  Playing as {challengeNickname}
                </p>
              )}
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <span className="text-xs font-mono text-zinc-500">
                {currentRound + 1}/{ROUNDS_PER_GAME}
              </span>
              {/* Circular countdown */}
              <div className="relative w-10 h-10">
                <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                  <circle cx="18" cy="18" r="15.9" fill="none" stroke="#3f3f46" strokeWidth="3.2"/>
                  <circle
                    cx="18" cy="18" r="15.9" fill="none"
                    stroke={phase === 'revealed' ? '#3f3f46' : timerColor(timeLeft)}
                    strokeWidth="3.2"
                    strokeLinecap="round"
                    strokeDasharray={`${(timeLeft / 30) * 100} 100`}
                    style={{ transition: 'stroke-dasharray 0.9s linear, stroke 0.5s' }}
                  />
                </svg>
                <span
                  className="absolute inset-0 flex items-center justify-center text-[11px] font-bold tabular-nums"
                  style={{ color: phase === 'revealed' ? '#71717a' : timerColor(timeLeft) }}
                >
                  {phase === 'revealed' ? '✓' : timeLeft}
                </span>
              </div>
            </div>
          </div>

          {/* Main area */}
          <div className="flex flex-col md:flex-row items-center gap-4 md:gap-6 px-4 md:px-6 py-5 md:py-8">
            <div className="flex flex-col items-center justify-center min-w-0 order-1 md:order-2 md:flex-1">
              <MaskedLogo
                src={currentTeam.logoUrl}
                dominantColor={dominant}
                guessColor={logoColor}
                size={logoSize}
              />
              <h2 className="mt-3 md:mt-5 text-lg md:text-xl font-bold text-white tracking-tight text-center">
                {currentTeam.name}
              </h2>
              <p className="text-xs text-zinc-500 mt-1 text-center">{collection?.name}</p>
            </div>

            <div className={`flex items-center gap-4 shrink-0 order-2 md:order-1 transition-opacity duration-300 ${phase === 'revealed' ? 'opacity-40 pointer-events-none' : ''}`}>
              <VerticalColorSlider
                label="Hue" abbr="H" value={h} min={0} max={360} unit="°"
                trackGradient={HUE_TRACK} trackH={trackH} thumbSize={thumbSize}
                onChange={val => setGuess(prev => ({ ...prev, h: val }))}
              />
              <VerticalColorSlider
                label="Saturation" abbr="S" value={s} min={0} max={100} unit="%"
                trackGradient={satTrack} trackH={trackH} thumbSize={thumbSize}
                onChange={val => setGuess(prev => ({ ...prev, s: val }))}
              />
              <VerticalColorSlider
                label="Lightness" abbr="L" value={l} min={0} max={100} unit="%"
                trackGradient={litTrack} trackH={trackH} thumbSize={thumbSize}
                onChange={val => setGuess(prev => ({ ...prev, l: val }))}
              />
            </div>
          </div>

          {/* Bottom */}
          <div className="px-4 md:px-6 pb-6 md:pb-7 border-t border-zinc-800/60 pt-4 md:pt-5 space-y-3">

            {phase === 'playing' ? (
              <>
                <div
                  className="rounded-xl overflow-hidden border border-zinc-700/60"
                  style={{ boxShadow: `0 4px 20px hsla(${h},${s}%,${l}%,0.22)` }}
                >
                  <div className="h-12 transition-colors duration-150" style={{ background: guessHsl }} />
                  <div className="bg-zinc-800 px-4 py-2 flex items-center justify-between">
                    <span className="text-xs text-zinc-400 font-medium uppercase tracking-wide">Your color</span>
                    <span className="text-xs font-mono text-zinc-200">hsl({h}, {s}%, {l}%)</span>
                  </div>
                </div>

                <button
                  onClick={handleVerify}
                  className="w-full py-4 rounded-2xl bg-green-500 hover:bg-green-400 active:scale-[0.97] text-black font-bold text-base tracking-wide transition-all duration-150 shadow-lg shadow-green-950/50 cursor-pointer"
                >
                  Check Score
                </button>
              </>
            ) : (
              <>
                <div className="flex items-center justify-between gap-4 py-1">
                  <div>
                    <p className="text-xs text-zinc-500 uppercase tracking-wide mb-0.5">Your score</p>
                    <p className="text-4xl font-extrabold tabular-nums" style={{ color: scoreColor(score) }}>
                      {score}%
                    </p>
                  </div>

                  <div className="flex gap-2 flex-1">
                    <div className="flex-1 rounded-xl overflow-hidden border border-zinc-700/60">
                      <div className="h-14" style={{ background: guessHsl }} />
                      <div className="bg-zinc-800 px-2 py-1.5 text-center">
                        <p className="text-[10px] text-zinc-400 uppercase tracking-wide">Yours</p>
                      </div>
                    </div>
                    <div className="flex-1 rounded-xl overflow-hidden border border-zinc-600/60">
                      <div className="h-14" style={{ background: correctHsl }} />
                      <div className="bg-zinc-700 px-2 py-1.5 text-center">
                        <p className="text-[10px] text-zinc-300 uppercase tracking-wide">Correct</p>
                      </div>
                    </div>
                  </div>
                </div>

                <button
                  onClick={handleNextRound}
                  className="w-full py-4 rounded-2xl bg-zinc-700 hover:bg-zinc-600 active:scale-[0.97] text-white font-bold text-base tracking-wide transition-all duration-150 cursor-pointer"
                >
                  {currentRound + 1 < ROUNDS_PER_GAME ? 'Next Round →' : 'See Results →'}
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
