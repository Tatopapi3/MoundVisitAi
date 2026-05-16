import { createClient } from '@/lib/supabase/server'
import { Trophy } from 'lucide-react'
import Link from 'next/link'

const positionColors: Record<string, string> = {
  pitching: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  hitting:  'bg-orange-500/20 text-orange-400 border-orange-500/30',
  fielding: 'bg-green-500/20 text-green-400 border-green-500/30',
  catching: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
}

const medals = ['🥇', '🥈', '🥉']

interface Entry {
  id: string
  display_name: string
  score: number
  position: string
  created_at: string
}

export default async function LeaderboardPage() {
  let entries: Entry[] = []

  try {
    const supabase = await createClient()
    const { data } = await supabase
      .from('leaderboard')
      .select('id, display_name, score, position, created_at')
      .order('score', { ascending: false })
      .limit(50)
    entries = data || []
  } catch {
    // treat as empty on error
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <Trophy className="w-6 h-6 text-yellow-400" />
            <h1 className="text-2xl font-bold text-white">Leaderboard</h1>
          </div>
          <p className="text-gray-400 text-sm">Top mechanics scores across all positions</p>
        </div>
        <Link
          href="/analyze"
          className="bg-red-600 hover:bg-red-700 text-white px-5 py-2.5 rounded-lg font-medium text-sm transition-colors"
        >
          Submit Your Score
        </Link>
      </div>

      {entries.length === 0 ? (
        <div className="text-center py-24 bg-white/5 border border-white/10 rounded-2xl">
          <Trophy className="w-12 h-12 text-gray-600 mx-auto mb-3" />
          <h3 className="text-white font-semibold text-lg mb-2">No scores yet</h3>
          <p className="text-gray-400 text-sm mb-6">Be the first to submit your mechanics score.</p>
          <Link
            href="/analyze"
            className="inline-flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg font-medium text-sm transition-colors"
          >
            Analyze Your Mechanics
          </Link>
        </div>
      ) : (
        <div className="space-y-2">
          {/* Top 3 podium */}
          {entries.length >= 3 && (
            <div className="grid grid-cols-3 gap-3 mb-6">
              {[entries[1], entries[0], entries[2]].map((entry, podiumIdx) => {
                const rank = podiumIdx === 0 ? 1 : podiumIdx === 1 ? 0 : 2
                const heights = ['h-28', 'h-36', 'h-24']
                const scoreColor = entry.score >= 80 ? 'text-green-400' : entry.score >= 60 ? 'text-yellow-400' : 'text-red-400'
                return (
                  <div key={entry.id} className={`flex flex-col items-center justify-end ${heights[podiumIdx]} bg-white/5 border border-white/10 rounded-2xl p-4`}>
                    <span className="text-2xl mb-1">{medals[rank]}</span>
                    <p className="text-white font-semibold text-sm truncate w-full text-center">{entry.display_name}</p>
                    <p className={`text-xl font-bold ${scoreColor}`}>{entry.score}</p>
                    <span className={`text-xs px-2 py-0.5 rounded-full border capitalize mt-1 ${positionColors[entry.position] || 'bg-gray-500/20 text-gray-400 border-gray-500/30'}`}>
                      {entry.position}
                    </span>
                  </div>
                )
              })}
            </div>
          )}

          {/* Full list */}
          {entries.map((entry, i) => {
            const scoreColor = entry.score >= 80 ? 'text-green-400' : entry.score >= 60 ? 'text-yellow-400' : 'text-red-400'
            return (
              <div
                key={entry.id}
                className={`flex items-center gap-4 border rounded-xl px-5 py-4 transition-colors ${
                  i === 0 ? 'bg-yellow-500/5 border-yellow-500/20' :
                  i === 1 ? 'bg-gray-400/5 border-gray-400/20' :
                  i === 2 ? 'bg-orange-600/5 border-orange-600/20' :
                  'bg-white/5 border-white/10'
                }`}
              >
                <div className="w-8 text-center flex-shrink-0">
                  {medals[i] ? (
                    <span className="text-lg">{medals[i]}</span>
                  ) : (
                    <span className="text-gray-500 text-sm font-mono">#{i + 1}</span>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <p className="text-white font-semibold text-sm truncate">{entry.display_name}</p>
                  <p className="text-gray-500 text-xs">{new Date(entry.created_at).toLocaleDateString()}</p>
                </div>

                <span className={`text-xs font-medium px-2.5 py-0.5 rounded-full border capitalize flex-shrink-0 ${positionColors[entry.position] || 'bg-gray-500/20 text-gray-400 border-gray-500/30'}`}>
                  {entry.position}
                </span>

                <span className={`text-xl font-bold w-14 text-right flex-shrink-0 ${scoreColor}`}>
                  {entry.score}
                </span>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
