import { HofComparison } from '@/types'

interface Props {
  score: number
  summary: string
  comparison?: HofComparison[]
}

export default function MechanicsScore({ score, summary, comparison }: Props) {
  const color = score >= 80 ? 'text-green-400' : score >= 60 ? 'text-yellow-400' : 'text-red-400'
  const barColor = score >= 80 ? 'bg-green-500' : score >= 60 ? 'bg-yellow-500' : 'bg-red-500'
  const label = score >= 80 ? 'Strong Mechanics' : score >= 60 ? 'Developing' : 'Needs Work'

  return (
    <div className="bg-white/5 border border-white/10 rounded-2xl p-6 space-y-5">
      {/* Score row */}
      <div className="flex items-center gap-6">
        <div className="text-center">
          <div className={`text-5xl font-bold ${color}`}>{score}</div>
          <div className="text-gray-500 text-xs mt-1">/ 100</div>
        </div>
        <div className="flex-1">
          <div className={`text-sm font-semibold ${color} mb-2`}>{label}</div>
          <p className="text-gray-300 text-sm leading-relaxed">{summary}</p>
        </div>
      </div>
      <div className="bg-white/5 rounded-full h-2">
        <div
          className={`h-2 rounded-full transition-all ${barColor}`}
          style={{ width: `${score}%` }}
        />
      </div>

      {/* HOF Comparisons */}
      {comparison && comparison.length > 0 && (
        <div className="pt-1">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Hall of Fame Comparison</p>
          <div className="space-y-3">
            {comparison.map((hof) => {
              const hofColor = hof.similarity >= 70 ? 'bg-green-500' : hof.similarity >= 50 ? 'bg-yellow-500' : 'bg-red-500'
              const hofTextColor = hof.similarity >= 70 ? 'text-green-400' : hof.similarity >= 50 ? 'text-yellow-400' : 'text-red-400'
              return (
                <div key={hof.player} className="bg-white/5 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-white font-semibold text-sm">{hof.player}</span>
                    <span className={`text-sm font-bold ${hofTextColor}`}>{hof.similarity}%</span>
                  </div>
                  <div className="bg-white/5 rounded-full h-1.5 mb-3">
                    <div
                      className={`h-1.5 rounded-full ${hofColor}`}
                      style={{ width: `${hof.similarity}%` }}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <p className="text-green-500 font-medium mb-0.5">Shares</p>
                      <p className="text-gray-400 leading-snug">{hof.strengths}</p>
                    </div>
                    <div>
                      <p className="text-red-400 font-medium mb-0.5">Gaps</p>
                      <p className="text-gray-400 leading-snug">{hof.gaps}</p>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
