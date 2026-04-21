import { Clock, Repeat } from 'lucide-react'

interface Props {
  drill: {
    name: string
    description: string
    duration: string
    reps?: string
    focus: string
  }
}

export default function DrillCard({ drill }: Props) {
  return (
    <div className="bg-white/5 border border-white/10 rounded-xl p-5">
      <div className="flex items-start justify-between mb-3">
        <h3 className="font-semibold text-white text-sm">{drill.name}</h3>
        <span className="text-xs text-red-400 bg-red-500/10 border border-red-500/20 rounded-full px-2.5 py-0.5 ml-2 shrink-0">
          {drill.focus}
        </span>
      </div>
      <p className="text-gray-400 text-sm mb-4 leading-relaxed">{drill.description}</p>
      <div className="flex items-center gap-4 text-xs text-gray-500">
        <div className="flex items-center gap-1.5">
          <Clock className="w-3.5 h-3.5" />
          {drill.duration}
        </div>
        {drill.reps && (
          <div className="flex items-center gap-1.5">
            <Repeat className="w-3.5 h-3.5" />
            {drill.reps}
          </div>
        )}
      </div>
    </div>
  )
}
