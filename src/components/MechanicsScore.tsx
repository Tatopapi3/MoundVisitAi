interface Props {
  score: number
  summary: string
}

export default function MechanicsScore({ score, summary }: Props) {
  const color = score >= 80 ? 'text-green-400' : score >= 60 ? 'text-yellow-400' : 'text-red-400'
  const label = score >= 80 ? 'Strong Mechanics' : score >= 60 ? 'Developing' : 'Needs Work'

  return (
    <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
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
      <div className="mt-4 bg-white/5 rounded-full h-2">
        <div
          className={`h-2 rounded-full transition-all ${score >= 80 ? 'bg-green-500' : score >= 60 ? 'bg-yellow-500' : 'bg-red-500'}`}
          style={{ width: `${score}%` }}
        />
      </div>
    </div>
  )
}
