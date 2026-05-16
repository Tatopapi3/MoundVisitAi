'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, ChevronLeft, ChevronRight, AlertCircle, AlertTriangle, Info, Dumbbell, Trophy } from 'lucide-react'
import { MechanicalCheckpoint, DrillPrescription, HofComparison } from '@/types'
import LeaderboardModal from '@/components/LeaderboardModal'

interface DemoAnalysis {
  position: string
  overallScore: number
  summary: string
  checkpoints: MechanicalCheckpoint[]
  drills: DrillPrescription[]
  comparison: HofComparison[]
  frames?: string[]
}

const HOF_INFO: Record<string, { era: string; knownFor: string }> = {
  'Nolan Ryan':      { era: '1966–1993', knownFor: 'Explosive hip rotation & elite arm path' },
  'Randy Johnson':   { era: '1988–2009', knownFor: 'Dominant release point & stride length' },
  'Albert Pujols':   { era: '2001–2022', knownFor: 'Perfect hip-to-shoulder separation & contact' },
  'Ken Griffey Jr.': { era: '1989–2010', knownFor: 'Fluid, effortless swing mechanics' },
  'Ivan Rodriguez':  { era: '1991–2011', knownFor: 'Elite pop time & receiving technique' },
  'Yadier Molina':   { era: '2004–2022', knownFor: 'Framing mastery & pitch calling precision' },

  'Aaron Judge':     { era: '2016–present', knownFor: 'Elite power generation & disciplined plate approach' },
  'Mike Trout':      { era: '2011–present', knownFor: 'Near-perfect all-around mechanics & plate discipline' },
  'Shohei Ohtani':   { era: '2013–present', knownFor: 'Elite two-way mechanics — explosive delivery & compact swing' },
  'Juan Soto':       { era: '2018–present', knownFor: 'Advanced pitch recognition & elite walk approach' },
  'Jacob deGrom':    { era: '2014–present', knownFor: 'Effortless arm speed with elite extension & spin rate' },
  'Paul Skenes':     { era: '2024–present', knownFor: 'Elite fastball mechanics & dominant release point' },
  'Cam Schlittler':  { era: '2025–present', knownFor: 'Rising Yankees prospect with explosive arm & clean delivery' },
}

function initials(name: string) {
  return name.split(' ').map(n => n[0]).join('')
}

function frameIndexFromTimestamp(timestamp: string): number {
  const m = timestamp.match(/frame\s*(\d+)/i)
  return m ? parseInt(m[1], 10) - 1 : -1
}

export default function DemoAnalysisPage() {
  const [analysis, setAnalysis] = useState<DemoAnalysis | null>(null)
  const [activeFrame, setActiveFrame] = useState(0)
  const [showLeaderboard, setShowLeaderboard] = useState(false)

  useEffect(() => {
    const stored = sessionStorage.getItem('demo-analysis')
    if (stored) setAnalysis(JSON.parse(stored))
  }, [])

  if (!analysis) {
    return (
      <div className="max-w-3xl mx-auto text-center py-24">
        <p className="text-gray-400">
          No demo analysis found.{' '}
          <Link href="/analyze" className="text-red-400 hover:text-red-300">Run a new analysis.</Link>
        </p>
      </div>
    )
  }

  const frames = analysis.frames || []
  const score = analysis.overallScore
  const scoreColor = score >= 80 ? 'text-green-400' : score >= 60 ? 'text-yellow-400' : 'text-red-400'
  const barColor   = score >= 80 ? 'bg-green-500'  : score >= 60 ? 'bg-yellow-500'  : 'bg-red-500'
  const label      = score >= 80 ? 'Strong Mechanics' : score >= 60 ? 'Developing' : 'Needs Work'

  const checkpointForFrame = (frameIdx: number) =>
    analysis.checkpoints.find(cp => frameIndexFromTimestamp(cp.timestamp) === frameIdx)

  return (
    <div className="max-w-4xl mx-auto space-y-8">

      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white capitalize">{analysis.position} Analysis</h1>
          <p className="text-gray-400 text-sm mt-1">Demo results</p>
        </div>
        <Link
          href="/analyze"
          className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-white border border-white/10 hover:border-white/20 px-3 py-1.5 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> New Analysis
        </Link>
      </div>

      {/* Frame Viewer */}
      {frames.length > 0 && (
        <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
          <div className="px-5 pt-4 pb-2">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Footage Analyzed</p>
          </div>

          <div className="relative bg-black">
            <img
              src={frames[activeFrame]}
              alt={`Frame ${activeFrame + 1}`}
              className="w-full max-h-96 object-contain"
            />

            {/* Frame label */}
            <div className="absolute top-3 left-3 bg-black/70 backdrop-blur-sm rounded-full px-3 py-1 text-white text-xs font-mono">
              Frame {activeFrame + 1} / {frames.length}
            </div>

            {/* Checkpoint overlay for this frame */}
            {(() => {
              const cp = checkpointForFrame(activeFrame)
              if (!cp) return null
              const overlayColor =
                cp.severity === 'critical' ? 'bg-red-900/85 border-red-500/50' :
                cp.severity === 'moderate' ? 'bg-yellow-900/85 border-yellow-500/50' :
                'bg-blue-900/85 border-blue-500/50'
              return (
                <div className={`absolute bottom-3 left-3 right-3 border rounded-xl p-3 backdrop-blur-sm ${overlayColor}`}>
                  <p className="text-white text-xs font-semibold mb-1">{cp.observation}</p>
                  <p className="text-gray-200 text-xs">→ {cp.fix}</p>
                </div>
              )
            })()}

            {activeFrame > 0 && (
              <button
                onClick={() => setActiveFrame(f => f - 1)}
                className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/60 hover:bg-black/80 text-white p-2 rounded-full transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
            )}
            {activeFrame < frames.length - 1 && (
              <button
                onClick={() => setActiveFrame(f => f + 1)}
                className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/60 hover:bg-black/80 text-white p-2 rounded-full transition-colors"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Filmstrip */}
          <div className="flex gap-2 p-3 bg-black/40 overflow-x-auto">
            {frames.map((frame, i) => {
              const cp = checkpointForFrame(i)
              const dotColor =
                cp?.severity === 'critical' ? 'bg-red-500' :
                cp?.severity === 'moderate' ? 'bg-yellow-500' :
                cp ? 'bg-blue-500' : ''
              return (
                <button
                  key={i}
                  onClick={() => setActiveFrame(i)}
                  className={`relative flex-shrink-0 rounded-lg overflow-hidden transition-all ${
                    activeFrame === i ? 'ring-2 ring-red-500 opacity-100' : 'opacity-50 hover:opacity-75'
                  }`}
                >
                  <img src={frame} alt={`Frame ${i + 1}`} className="w-20 h-14 object-cover" />
                  {cp && (
                    <div className={`absolute top-1 right-1 w-2.5 h-2.5 rounded-full ${dotColor}`} />
                  )}
                  <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-center text-xs text-gray-300 py-0.5">
                    F{i + 1}
                  </div>
                </button>
              )
            })}
          </div>
        </div>
      )}

      {/* Overall Score */}
      <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
        <div className="flex items-center gap-6 mb-4">
          <div className="text-center flex-shrink-0">
            <div className={`text-6xl font-bold ${scoreColor}`}>{score}</div>
            <div className="text-gray-500 text-xs mt-1">/ 100</div>
          </div>
          <div className="flex-1">
            <div className={`text-base font-bold ${scoreColor} mb-2`}>{label}</div>
            <p className="text-gray-300 text-sm leading-relaxed">{analysis.summary}</p>
          </div>
        </div>
        <div className="bg-white/5 rounded-full h-2 mb-4">
          <div className={`h-2 rounded-full transition-all ${barColor}`} style={{ width: `${score}%` }} />
        </div>

        <button
          onClick={() => setShowLeaderboard(true)}
          className="flex items-center gap-2 bg-yellow-500/10 hover:bg-yellow-500/20 border border-yellow-500/25 text-yellow-400 hover:text-yellow-300 px-4 py-2.5 rounded-xl text-sm font-semibold transition-colors w-full justify-center"
        >
          <Trophy className="w-4 h-4" /> Submit Score to Leaderboard
        </button>
      </div>

      {/* Prescribed Drills — shown immediately after score */}
      {analysis.drills.length > 0 && (
        <div id="drills">
          <h2 className="text-lg font-semibold text-white mb-1">Prescribed Drills</h2>
          <p className="text-gray-500 text-sm mb-4">Targeted drills to fix what was found</p>
          <div className="grid md:grid-cols-2 gap-4">
            {analysis.drills.map((drill, i) => (
              <div key={i} id={`drill-${i}`} className="bg-white/5 border border-white/10 rounded-xl p-5">
                <div className="flex items-start gap-3 mb-3">
                  <div className="w-9 h-9 bg-red-600/20 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Dumbbell className="w-4 h-4 text-red-400" />
                  </div>
                  <div>
                    <p className="text-white font-semibold text-sm">{drill.name}</p>
                    <p className="text-red-400 text-xs mt-0.5">{drill.focus}</p>
                  </div>
                </div>
                <p className="text-gray-400 text-sm leading-relaxed mb-3">{drill.description}</p>
                <div className="flex gap-2 text-xs flex-wrap">
                  <span className="bg-white/5 rounded-lg px-2.5 py-1.5 text-gray-400">⏱ {drill.duration}</span>
                  {drill.reps && <span className="bg-white/5 rounded-lg px-2.5 py-1.5 text-gray-400">🔁 {drill.reps}</span>}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* HOF Comparisons */}
      {analysis.comparison && analysis.comparison.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold text-white mb-1">Hall of Fame Comparison</h2>
          <p className="text-gray-500 text-sm mb-4">How your mechanics stack up against the legends</p>
          <div className="grid md:grid-cols-2 gap-4">
            {analysis.comparison.map((hof) => {
              const info = HOF_INFO[hof.player]
              const sim = hof.similarity
              const simColor = sim >= 70 ? 'text-green-400' : sim >= 50 ? 'text-yellow-400' : 'text-red-400'
              const barCol   = sim >= 70 ? 'bg-green-500'  : sim >= 50 ? 'bg-yellow-500'  : 'bg-red-500'
              return (
                <div key={hof.player} className="bg-white/5 border border-white/10 rounded-2xl p-5">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-12 h-12 rounded-full bg-red-600/20 border border-red-600/30 flex items-center justify-center flex-shrink-0">
                      <span className="text-red-400 font-bold text-sm">{initials(hof.player)}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-white font-bold text-sm truncate">{hof.player}</p>
                        <span className={`text-xl font-bold flex-shrink-0 ${simColor}`}>{sim}%</span>
                      </div>
                      {info && <p className="text-gray-500 text-xs">{info.era}</p>}
                    </div>
                  </div>

                  <div className="bg-white/5 rounded-full h-1.5 mb-3">
                    <div className={`h-1.5 rounded-full ${barCol}`} style={{ width: `${sim}%` }} />
                  </div>

                  {info && (
                    <p className="text-gray-600 text-xs italic mb-3">Known for: {info.knownFor}</p>
                  )}

                  <div className="space-y-2">
                    <div className="bg-green-500/5 border border-green-500/15 rounded-lg p-3">
                      <p className="text-green-400 text-xs font-bold mb-1">SHARED TRAITS</p>
                      <p className="text-gray-300 text-xs leading-relaxed">{hof.strengths}</p>
                    </div>
                    <div className="bg-red-500/5 border border-red-500/15 rounded-lg p-3">
                      <p className="text-red-400 text-xs font-bold mb-1">GAPS TO CLOSE</p>
                      <p className="text-gray-300 text-xs leading-relaxed">{hof.gaps}</p>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Mechanical Findings */}
      <div>
        <h2 className="text-lg font-semibold text-white mb-1">Mechanical Findings</h2>
        <p className="text-gray-500 text-sm mb-4">What was observed in your footage and what to change</p>
        <div className="space-y-3">
          {analysis.checkpoints.map((cp, i) => {
            const frameIdx = frameIndexFromTimestamp(cp.timestamp)
            const canJumpToFrame = frameIdx >= 0 && frameIdx < frames.length

            return (
              <div
                key={i}
                className={`border rounded-xl p-5 ${
                  cp.severity === 'critical' ? 'bg-red-500/5 border-red-500/20' :
                  cp.severity === 'moderate' ? 'bg-yellow-500/5 border-yellow-500/20' :
                  'bg-blue-500/5 border-blue-500/20'
                }`}
              >
                <div className="flex items-center gap-2 mb-3">
                  {cp.severity === 'critical'
                    ? <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
                    : cp.severity === 'moderate'
                    ? <AlertTriangle className="w-4 h-4 text-yellow-400 flex-shrink-0" />
                    : <Info className="w-4 h-4 text-blue-400 flex-shrink-0" />}
                  <span className={`text-xs font-bold uppercase tracking-wide ${
                    cp.severity === 'critical' ? 'text-red-400' :
                    cp.severity === 'moderate' ? 'text-yellow-400' : 'text-blue-400'
                  }`}>{cp.severity}</span>
                  <button
                    onClick={() => canJumpToFrame && setActiveFrame(frameIdx)}
                    className={`ml-auto text-xs px-2.5 py-0.5 rounded-full font-mono transition-colors ${
                      canJumpToFrame
                        ? 'bg-white/10 hover:bg-white/20 text-gray-300 cursor-pointer'
                        : 'bg-white/5 text-gray-500 cursor-default'
                    }`}
                    title={canJumpToFrame ? 'Click to view this frame' : undefined}
                  >
                    {cp.timestamp}
                  </button>
                </div>

                <p className="text-white font-semibold text-sm mb-3">{cp.observation}</p>

                <div className="space-y-2">
                  <div className="bg-black/20 rounded-lg p-3">
                    <p className="text-gray-500 text-xs font-medium mb-1">Why it matters</p>
                    <p className="text-gray-300 text-sm">{cp.whyItMatters}</p>
                  </div>
                  <div className={`rounded-lg p-3 border ${
                    cp.severity === 'critical' ? 'bg-red-500/10 border-red-500/25' :
                    cp.severity === 'moderate' ? 'bg-yellow-500/10 border-yellow-500/25' :
                    'bg-blue-500/10 border-blue-500/25'
                  }`}>
                    <p className={`text-xs font-bold mb-1.5 ${
                      cp.severity === 'critical' ? 'text-red-400' :
                      cp.severity === 'moderate' ? 'text-yellow-400' : 'text-blue-400'
                    }`}>→ CHANGE TO MAKE</p>
                    <p className="text-white text-sm font-medium">{cp.fix}</p>
                  </div>

                  {/* Link to matching drill */}
                  {(() => {
                    const obs = cp.observation.toLowerCase()
                    const drillIdx = analysis.drills.findIndex(d =>
                      obs.includes(d.focus.toLowerCase()) ||
                      d.focus.toLowerCase().split(' ').some(w => w.length > 4 && obs.includes(w))
                    )
                    if (drillIdx === -1) return null
                    return (
                      <a
                        href={`#drill-${drillIdx}`}
                        className="flex items-center gap-1.5 text-xs text-red-400 hover:text-red-300 font-semibold mt-2 transition-colors"
                      >
                        <Dumbbell className="w-3.5 h-3.5" />
                        Follow drill: {analysis.drills[drillIdx].name} →
                      </a>
                    )
                  })()}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {showLeaderboard && (
        <LeaderboardModal
          score={analysis.overallScore}
          position={analysis.position}
          onClose={() => setShowLeaderboard(false)}
        />
      )}
    </div>
  )
}
