'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { LayoutDashboard, Plus, BookOpen, LogOut } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { User } from '@supabase/supabase-js'

export default function Navbar({ user }: { user: User | null }) {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()

  async function handleSignOut() {
    await supabase.auth.signOut()
    router.push('/')
  }

  const links = [
    { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/analyze', label: 'New Analysis', icon: Plus },
    { href: '/drills', label: 'Drills', icon: BookOpen },
  ]

  return (
    <nav className="border-b border-white/10 bg-black/40 backdrop-blur-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 flex items-center justify-between h-14">
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center gap-2">
            <img src="/logo.png" alt="MoundVisit AI" className="h-8 w-8" />
            <span className="font-bold text-sm text-white" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>MoundVisit AI</span>
          </Link>

          <div className="flex items-center gap-1">
            {links.map(({ href, label, icon: Icon }) => (
              <Link
                key={href}
                href={href}
                className={cn(
                  'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm transition-colors',
                  pathname === href || pathname.startsWith(href + '/')
                    ? 'bg-white/10 text-white'
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                )}
              >
                <Icon className="w-3.5 h-3.5" />
                {label}
              </Link>
            ))}
          </div>
        </div>

        {user ? (
          <button
            onClick={handleSignOut}
            className="flex items-center gap-1.5 text-gray-400 hover:text-white transition-colors text-sm px-3 py-1.5 rounded-lg hover:bg-white/5"
          >
            <LogOut className="w-3.5 h-3.5" />
            Sign Out
          </button>
        ) : (
          <Link
            href="/login"
            className="flex items-center gap-1.5 text-gray-400 hover:text-white transition-colors text-sm px-3 py-1.5 rounded-lg hover:bg-white/5"
          >
            Sign In
          </Link>
        )}
      </div>
    </nav>
  )
}
