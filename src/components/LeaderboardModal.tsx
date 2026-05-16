'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Trophy, X, Loader2, CheckCircle2, ExternalLink } from 'lucide-react'

interface Props {
  score: number
  position: string
  onClose: () => void
}

export default function LeaderboardModal({ score, position, onClose }: Props) {
  const [name, setName] = useState('')
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [error, setError] = useState('')

  const scoreColor = score >= 80 ? 'text-green-400' : score >= 60 ? 'text-yellow-400' : 'text-red-400'

  async function submit() {
    const trimmed = name.trim()
    if (trimmed.length < 2) { setError('Name must be at least 2 characters'); return }
    setStatus('loading')
    setError('')

    try {
      const supabase = createClient()
      const { data: authData, error: authError } = await supabase.auth.signInAnonymously()
      if (authError || !authData.user) throw new Error(authError?.message || 'Could not create session')

      const { error: insertError } = await supabase.from('leaderboard').insert({
        user_id: authData.user.id,
        display_name: trimmed,
        score,
        position,
      })
      if (insertError) throw new Error(insertError.message)

      setStatus('success')
    } catch (e) {
      setStatus('error')
      setError(e instanceof Error ? e.message : 'Something went wrong')
    }
  }

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-zinc-900 border border-white/10 rounded-2xl p-6 w-full max-w-sm shadow-2xl">

        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-yellow-400" />
            <h2 className="text-white font-bold">Submit to Leaderboard</h2>
          </div>
          <button onClick={onClose} className="text-gray-500 hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {status === 'success' ? (
          <div className="text-center py-4">
            <CheckCircle2 className="w-12 h-12 text-green-400 mx-auto mb-3" />
            <p className="text-white font-semibold text-lg">Score submitted!</p>
            <p className="text-gray-400 text-sm mt-1 mb-5">Check the leaderboard to see where you rank.</p>
            <div className="flex flex-col gap-2">
              <a
                href="/leaderboard"
                className="flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 text-white py-2.5 rounded-xl text-sm font-medium transition-colors"
              >
                <Trophy className="w-4 h-4" /> View Leaderboard
              </a>
              <button
                onClick={onClose}
                className="bg-white/5 hover:bg-white/10 text-gray-400 py-2.5 rounded-xl text-sm transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        ) : (
          <>
            <div className="bg-white/5 border border-white/10 rounded-xl p-4 mb-4 flex items-center justify-between">
              <span className="text-gray-400 text-sm capitalize">{position}</span>
              <span className={`text-3xl font-bold ${scoreColor}`}>
                {score}<span className="text-gray-500 text-base font-normal">/100</span>
              </span>
            </div>

            <label className="block text-sm text-gray-400 mb-1.5">Your display name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && submit()}
              placeholder="e.g. Juan F."
              maxLength={30}
              autoFocus
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm placeholder:text-gray-600 focus:outline-none focus:border-red-500/50 mb-3 transition-colors"
            />

            {error && <p className="text-red-400 text-xs mb-3">{error}</p>}

            <button
              onClick={submit}
              disabled={status === 'loading'}
              className="w-full bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white py-2.5 rounded-xl text-sm font-medium transition-colors flex items-center justify-center gap-2"
            >
              {status === 'loading'
                ? <><Loader2 className="w-4 h-4 animate-spin" /> Submitting…</>
                : <><Trophy className="w-4 h-4" /> Submit Score</>}
            </button>

            <p className="text-gray-600 text-xs text-center mt-3">
              No account needed — your score is saved anonymously.
            </p>
          </>
        )}
      </div>
    </div>
  )
}
