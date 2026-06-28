'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/client'
import type { User } from '@supabase/supabase-js'
import { useLang } from '@/lib/lang-context'

type Props = {
  onMenuClick?: () => void
  onHomeClick?: () => void
  searchQuery?: string
  onSearchChange?: (q: string) => void
  onSearchSubmit?: () => void
  onClearSearch?: () => void
}

export default function Header({ onMenuClick, onHomeClick, searchQuery = '', onSearchChange = () => {}, onSearchSubmit = () => {}, onClearSearch }: Props) {
  const supabase = createClient()
  const [user, setUser] = useState<User | null>(null)
  const [role, setRole] = useState<string | null>(null)
  const { lang, setLang, t } = useLang()

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
    <header className="sticky top-0 z-50 bg-blue-600 shadow-[0_2px_16px_rgba(37,99,235,0.35)]">
      <div className="px-3 sm:px-6 h-14 sm:h-16 flex items-center gap-2 sm:gap-3">

        {/* Hamburger (mobile) */}
        {onMenuClick && (
          <button
            onClick={onMenuClick}
            className="md:hidden p-2 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition-colors shrink-0"
            aria-label="Open menu"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5M3.75 17.25h16.5" />
            </svg>
          </button>
        )}

        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 shrink-0">
          <div className="bg-white rounded-lg p-0.5 shrink-0">
            <Image src="/logo.png" alt="EZsearch" width={28} height={28} className="block w-7 h-7" />
          </div>
          <span className="text-lg font-extrabold tracking-tight text-white hidden sm:block">EZsearch</span>
        </Link>

        {/* Home button */}
        {onHomeClick && (
          <button
            onClick={onHomeClick}
            className="shrink-0 flex items-center gap-1.5 px-2 sm:px-3 py-1.5 rounded-full bg-white/15 hover:bg-white/25 text-white text-sm font-medium transition-colors"
            aria-label="Home"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12l8.954-8.955a1.126 1.126 0 011.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
            </svg>
            <span className="hidden sm:inline">Home</span>
          </button>
        )}

        {/* Search bar */}
        <div className="flex-1 max-w-lg mx-auto">
          <div className="relative">
            <svg
              className={`absolute top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none ${lang === 'ar' ? 'right-3' : 'left-3'}`}
              fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
            </svg>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && searchQuery.trim() && onSearchSubmit()}
              placeholder={t.searchPlaceholder}
              className={`w-full py-2 rounded-full bg-white text-gray-900 placeholder-gray-400 text-sm outline-none focus:ring-2 focus:ring-blue-300 ${
                lang === 'ar' ? 'pr-9 pl-12 text-right' : 'pl-9 pr-12'
              }`}
            />
            {searchQuery && (
              <button
                onClick={() => onClearSearch ? onClearSearch() : onSearchChange('')}
                className={`absolute top-1/2 -translate-y-1/2 text-red-500 hover:text-red-600 text-xs font-semibold transition-colors ${lang === 'ar' ? 'left-3' : 'right-3'}`}
              >
                Clear
              </button>
            )}
          </div>
        </div>

        {/* Right side: language toggle + auth */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">

          {/* Language toggle — hidden on mobile */}
          <button
            onClick={() => setLang(lang === 'en' ? 'ar' : 'en')}
            className="hidden sm:block text-white/90 hover:text-white text-sm font-semibold px-2.5 py-1 rounded-lg hover:bg-white/10 transition-colors whitespace-nowrap border border-white/20"
          >
            {lang === 'en' ? 'العربية' : 'English'}
          </button>

          {user ? (
            <>
              <Link
                href="/watchlist"
                className="hidden md:block text-white/90 hover:text-white text-sm font-medium transition-colors"
              >
                {t.watchlist}
              </Link>
              {role === 'shop_owner' && (
                <Link
                  href="/shop/dashboard"
                  className="hidden md:block text-yellow-300 hover:text-yellow-200 font-semibold text-sm transition-colors"
                >
                  {t.myShop}
                </Link>
              )}
              {role === 'admin' && (
                <Link
                  href="/admin"
                  className="hidden md:block text-white/90 hover:text-white text-sm font-medium transition-colors"
                >
                  {t.admin}
                </Link>
              )}
              <button
                onClick={signOut}
                className="text-white/90 hover:text-white text-sm font-medium transition-colors"
              >
                <span className="hidden sm:inline">{t.signOut}</span>
                <svg className="sm:hidden w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75" />
                </svg>
              </button>
            </>
          ) : (
            <Link
              href="/auth/login"
              className="bg-white text-blue-600 hover:bg-blue-50 active:bg-blue-100 text-xs sm:text-sm font-bold px-3 sm:px-4 py-1.5 rounded-full transition-colors shadow-sm whitespace-nowrap"
            >
              {t.signIn}
            </Link>
          )}
        </div>

      </div>
    </header>
  )
}
