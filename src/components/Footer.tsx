'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useLang } from '@/lib/lang-context'

export default function Footer() {
  const { t } = useLang()
  const year = new Date().getFullYear()

  return (
    <footer className="border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950">
      {/* Main grid */}
      <div className="max-w-2xl mx-auto px-4 py-8 sm:py-10 grid grid-cols-2 gap-x-6 gap-y-8 sm:grid-cols-3">

        {/* Brand */}
        <div className="flex flex-col gap-3">
          <Link href="/" className="flex items-center gap-2 w-fit">
            <div className="bg-blue-600 rounded-lg p-1">
              <Image src="/logo.png" alt="EZsearch" width={24} height={24} className="block w-6 h-6" />
            </div>
            <span className="text-base font-extrabold tracking-tight text-gray-900 dark:text-white">EZsearch</span>
          </Link>
          <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed max-w-[200px]">
            {t.footerTagline}
          </p>
        </div>

        {/* Explore */}
        <div className="flex flex-col gap-3 sm:col-span-1">
          <p className="text-xs font-bold text-gray-900 dark:text-white uppercase tracking-widest">{t.footerExplore}</p>
          <nav className="flex flex-col gap-2">
            <FooterLink href="/watchlist">{t.watchlist}</FooterLink>
          </nav>
        </div>

        {/* Company */}
        <div className="flex flex-col gap-3">
          <p className="text-xs font-bold text-gray-900 dark:text-white uppercase tracking-widest">{t.footerCompany}</p>
          <nav className="flex flex-col gap-2">
            <FooterLink href="/about">{t.footerAbout}</FooterLink>
          </nav>
        </div>

      </div>

      {/* Bottom bar */}
      <div className="border-t border-gray-100 dark:border-gray-800">
        <div className="max-w-2xl mx-auto px-4 pt-4 pb-28 sm:pb-6 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p className="text-xs text-gray-400 dark:text-gray-600">
            © {year} EZsearch. {t.footerRights}
          </p>
          <p className="text-xs text-gray-400 dark:text-gray-600">{t.footerMadeIn}</p>
        </div>
      </div>
    </footer>
  )
}

function FooterLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="text-sm text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
    >
      {children}
    </Link>
  )
}
