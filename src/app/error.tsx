'use client'

import { useEffect } from 'react'
import Link from 'next/link'

export default function GlobalError({ error, reset }: { error: Error; reset: () => void }) {
  useEffect(() => { console.error(error) }, [error])

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950 flex flex-col items-center justify-center px-4 text-center">
      <p className="text-5xl mb-6">⚠️</p>
      <h1 className="text-2xl font-extrabold text-gray-900 dark:text-white mb-2">Something went wrong</h1>
      <p className="text-gray-500 dark:text-gray-400 mb-8 max-w-sm">
        An unexpected error occurred. Try refreshing, or head back home.
      </p>
      <div className="flex gap-3">
        <button
          onClick={reset}
          className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold transition-colors"
        >
          Try again
        </button>
        <Link
          href="/"
          className="px-5 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 text-sm font-semibold hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
        >
          Go home
        </Link>
      </div>
    </div>
  )
}
