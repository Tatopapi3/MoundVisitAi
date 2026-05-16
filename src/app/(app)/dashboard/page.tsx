import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { ArrowRight, Plus, TrendingUp } from 'lucide-react'
import DeleteSessionButton from '@/components/DeleteSessionButton'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: sessions } = user
    ? await supabase
        .from('analysis_sessions')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(10)
    : { data: null }

  const positionColors: Record<string, string> = {
    pitching: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    hitting: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
    fielding: 'bg-green-500/20 text-green-400 border-green-500/30',
    catching: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white">Dashboard</h1>
          <p className="text-gray-400 text-sm mt-1">Your mechanics analysis history</p>
        </div>
        <Link
          href="/analyze"
          className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-5 py-2.5 rounded-lg font-medium text-sm transition-colors"
        >
          <Plus className="w-4 h-4" /> New Analysis
        </Link>
      </div>

      {sessions && sessions.length > 0 ? (
        <div className="space-y-3">
          {sessions.map((session) => (
            <div key={session.id} className="flex items-center gap-2 group">
              <Link
                href={`/analyze/${session.id}`}
                className="flex-1 flex items-center justify-between bg-white/5 border border-white/10 rounded-xl p-5 hover:bg-white/8 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-white/5 rounded-xl flex items-center justify-center">
                    <TrendingUp className="w-5 h-5 text-gray-400" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`text-xs font-medium px-2.5 py-0.5 rounded-full border capitalize ${positionColors[session.position] || 'bg-gray-500/20 text-gray-400 border-gray-500/30'}`}>
                        {session.position}
                      </span>
                      <span className="text-white font-semibold">{session.overall_score}/100</span>
                    </div>
                    <p className="text-gray-400 text-sm line-clamp-1">{session.summary}</p>
                    <p className="text-gray-600 text-xs mt-1">{new Date(session.created_at).toLocaleDateString()}</p>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-gray-600 group-hover:text-gray-400 transition-colors" />
              </Link>
              <DeleteSessionButton sessionId={session.id} />
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-24 bg-white/5 border border-white/10 rounded-2xl">
          <div className="w-16 h-16 bg-red-600/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <Plus className="w-8 h-8 text-red-400" />
          </div>
          <h3 className="text-white font-semibold text-lg mb-2">No analyses yet</h3>
          <p className="text-gray-400 text-sm mb-6 max-w-sm mx-auto">Upload your first video to get AI-powered mechanics feedback</p>
          <Link
            href="/analyze"
            className="inline-flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg font-medium text-sm transition-colors"
          >
            Analyze Your Mechanics <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      )}
    </div>
  )
}
