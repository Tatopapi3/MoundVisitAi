import { MechanicalCheckpoint, DrillPrescription } from '@/types'
import DrillCard from './DrillCard'
import { cn } from '@/lib/utils'

interface Props {
  checkpoints: MechanicalCheckpoint[]
  drills: DrillPrescription[]
}

const severityStyles: Record<string, string> = {
  critical: 'bg-red-500/10 border-red-500/30 text-red-400',
  moderate: 'bg-yellow-500/10 border-yellow-500/30 text-yellow-400',
  minor: 'bg-blue-500/10 border-blue-500/30 text-blue-400',
}

export default function AnalysisReport({ checkpoints, drills }: Props) {
  return (
    <div className="space-y-6">
      {/* Checkpoints */}
      <div>
        <h2 className="text-lg font-semibold text-white mb-4">Mechanical Findings</h2>
        <div className="space-y-3">
          {checkpoints.map((cp, i) => (
            <div key={i} className="bg-white/5 border border-white/10 rounded-xl p-5">
              <div className="flex items-start justify-between gap-4 mb-3">
                <div className="flex items-center gap-2">
                  <span className="text-gray-500 text-xs font-mono">{cp.timestamp}</span>
                  <span className={cn('text-xs font-medium px-2 py-0.5 rounded-full border capitalize', severityStyles[cp.severity] || severityStyles.minor)}>
                    {cp.severity}
                  </span>
                </div>
              </div>
              <p className="text-white text-sm font-medium mb-2">{cp.observation}</p>
              <div className="space-y-2">
                <div className="bg-white/5 rounded-lg p-3">
                  <p className="text-xs text-gray-500 font-medium mb-1">Why it matters</p>
                  <p className="text-gray-300 text-sm">{cp.whyItMatters}</p>
                </div>
                <div className="bg-red-500/5 border border-red-500/10 rounded-lg p-3">
                  <p className="text-xs text-red-400 font-medium mb-1">Fix</p>
                  <p className="text-gray-300 text-sm">{cp.fix}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Drills */}
      {drills.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold text-white mb-4">Prescribed Drills</h2>
          <div className="grid md:grid-cols-2 gap-4">
            {drills.map((drill, i) => (
              <DrillCard key={i} drill={drill} />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
