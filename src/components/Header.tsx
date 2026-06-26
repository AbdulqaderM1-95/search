'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import type { User } from '@supabase/supabase-js'

export default function Header() {
  const supabase = createClient()
  const [user, setUser] = useState<User | null>(null)
  const [role, setRole] = useState<string | null>(null)

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data.user))
    supabase.auth.onAuthStateChange((_e, session) => setUser(session?.user ?? null))
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!user) { setRole(null); return }
    supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()
      .then(({ data }) => setRole(data?.role ?? 'user'))
  }, [user]) // eslint-disable-line react-hooks/exhaustive-deps

  const signOut = async () => {
    await supabase.auth.signOut()
    setUser(null)
  }

  return (
    <header className="sticky top-0 z-40 bg-white/80 dark:bg-gray-950/80 backdrop-blur border-b border-gray-100 dark:border-gray-800">
      <div className="max-w-2xl mx-auto px-4 h-14 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <span className="text-xl font-bold tracking-tight">
            <span className="text-blue-600">EZ</span>search
          </span>
        </Link>

        <nav className="flex items-center gap-3 text-sm">
          {user ? (
            <>
              <Link href="/watchlist" className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white">
                Watchlist
              </Link>
              {role === 'shop_owner' && (
                <Link href="/shop/dashboard" className="text-amber-600 hover:text-amber-700 font-medium">
                  My Shop
                </Link>
              )}
              {role === 'admin' && (
                <Link href="/admin" className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white">
                  Admin
                </Link>
              )}
              <button
                onClick={signOut}
                className="text-gray-500 hover:text-gray-900 dark:hover:text-white"
              >
                Sign out
              </button>
            </>
          ) : (
            <Link
              href="/auth/login"
              className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-1.5 rounded-full transition-colors"
            >
              Sign in
            </Link>
          )}
        </nav>
      </div>
    </header>
  )
}
