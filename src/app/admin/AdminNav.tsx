'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const NAV = [
  { href: '/admin', label: 'Dashboard' },
  { href: '/admin/users', label: 'Users' },
  { href: '/admin/content', label: 'Content' },
  { href: '/admin/analytics', label: 'Analytics' },
]

export default function AdminNav() {
  const pathname = usePathname()
  return (
    <header className="bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800">
      <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <Link href="/" className="font-bold text-blue-600">EZsearch</Link>
          <span className="text-xs text-gray-400 font-medium uppercase tracking-wide">Admin</span>
        </div>
        <Link href="/" className="text-sm text-gray-500 hover:text-gray-900 dark:hover:text-white">← Back to app</Link>
      </div>
      <nav className="max-w-5xl mx-auto px-4 flex gap-1">
        {NAV.map(item => (
          <Link
            key={item.href}
            href={item.href}
            className={`px-3 py-2 text-sm border-b-2 transition-colors ${
              pathname === item.href
                ? 'border-blue-600 text-blue-600 font-medium'
                : 'border-transparent text-gray-500 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            {item.label}
          </Link>
        ))}
      </nav>
    </header>
  )
}
