import { Position } from '@/types'
import { cn } from '@/lib/utils'

const positions: { value: Position; label: string; description: string; emoji: string }[] = [
  { value: 'pitching', label: 'Pitching', description: 'Delivery mechanics & arm health', emoji: '⚾' },
  { value: 'hitting', label: 'Hitting', description: 'Swing path & power generation', emoji: '🏏' },
  { value: 'fielding', label: 'Fielding', description: 'Footwork, approach & throwing', emoji: '🧤' },
  { value: 'catching', label: 'Catching', description: 'Receiving, framing & blocking', emoji: '🎯' },
]

interface Props {
  selected: Position | null
  onSelect: (p: Position) => void
}

export default function PositionSelector({ selected, onSelect }: Props) {
  return (
    <div className="grid grid-cols-2 gap-3">
      {positions.map(({ value, label, description, emoji }) => (
        <button
          key={value}
          onClick={() => onSelect(value)}
          className={cn(
            'text-left p-4 rounded-xl border transition-all',
            selected === value
              ? 'bg-red-600/20 border-red-500/50 text-white'
              : 'bg-white/5 border-white/10 text-gray-400 hover:bg-white/8 hover:text-white'
          )}
        >
          <div className="text-2xl mb-2">{emoji}</div>
          <div className="font-semibold text-sm">{label}</div>
          <div className="text-xs mt-0.5 opacity-70">{description}</div>
        </button>
      ))}
    </div>
  )
}
