'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useLang } from '@/lib/lang-context'

export default function Footer() {
  const { t, lang } = useLang()
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
          {/* Social icons */}
          <div className={`flex items-center gap-3 mt-1 ${lang === 'ar' ? 'flex-row-reverse' : ''}`}>
            <a
              href="https://instagram.com"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Instagram"
              className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-500 dark:text-gray-400 hover:bg-pink-100 dark:hover:bg-pink-950 hover:text-pink-600 dark:hover:text-pink-400 transition-colors"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
              </svg>
            </a>
            <a
              href="https://x.com"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="X (Twitter)"
              className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white transition-colors"
            >
              <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.737-8.845L1.254 2.25H8.08l4.253 5.622zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
              </svg>
            </a>
          </div>
        </div>

        {/* Explore */}
        <div className="flex flex-col gap-3 sm:col-span-1">
          <p className="text-xs font-bold text-gray-900 dark:text-white uppercase tracking-widest">{t.footerExplore}</p>
          <nav className="flex flex-col gap-2">
            <FooterLink href="/">{t.productsCategory}</FooterLink>
            <FooterLink href="/">{t.shopsCategory}</FooterLink>
            <FooterLink href="/">{t.helpMeChoose}</FooterLink>
            <FooterLink href="/watchlist">{t.watchlist}</FooterLink>
          </nav>
        </div>

        {/* Company */}
        <div className="flex flex-col gap-3">
          <p className="text-xs font-bold text-gray-900 dark:text-white uppercase tracking-widest">{t.footerCompany}</p>
          <nav className="flex flex-col gap-2">
            <FooterLink href="/about">{t.footerAbout}</FooterLink>
            <FooterLink href="/contact">{t.footerContact}</FooterLink>
            <FooterLink href="/privacy">{t.footerPrivacy}</FooterLink>
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
