'use client'

import { useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'


export default function SignupPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const supabase = createClient()
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName },
      },
    })

    if (error) {
      setError(error.message)
      setLoading(false)
    } else {
      setSuccess(true)
    }
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-green-400 text-2xl">✓</span>
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Check your email</h2>
          <p className="text-gray-400">We sent a confirmation link to <strong className="text-white">{email}</strong>. Click it to activate your account.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="page-bg-stadium min-h-screen flex items-center justify-center px-4 relative">

      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 mb-6">
            <img src="/logo.png" alt="MoundVisit AI" className="h-9 w-9" />
            <span className="font-bold text-lg text-white">MoundVisit AI</span>
          </Link>
          <h1 className="text-2xl font-bold text-white">Create your account</h1>
          <p className="text-gray-400 mt-1 text-sm">Start analyzing your mechanics for free</p>
        </div>

        <form onSubmit={handleSignup} className="bg-white/5 border border-white/10 rounded-2xl p-8 space-y-4">
          {error && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-3 text-red-400 text-sm">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1.5">Full Name</label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-red-500 transition-colors text-sm"
              placeholder="Your name"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1.5">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-red-500 transition-colors text-sm"
              placeholder="you@example.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1.5">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={8}
              className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-red-500 transition-colors text-sm"
              placeholder="Min. 8 characters"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white py-3 rounded-lg font-semibold transition-colors text-sm"
          >
            {loading ? 'Creating account...' : 'Create Account'}
          </button>

          <p className="text-center text-gray-400 text-sm">
            Already have an account?{' '}
            <Link href="/login" className="text-red-400 hover:text-red-300 transition-colors">
              Sign in
            </Link>
          </p>
        </form>
      </div>
    </div>
  )
}
