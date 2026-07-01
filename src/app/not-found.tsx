import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-950 flex flex-col items-center justify-center px-4 text-center">
      <p className="text-6xl font-extrabold text-blue-600 mb-4">404</p>
      <h1 className="text-2xl font-extrabold text-gray-900 dark:text-white mb-2">Page not found</h1>
      <p className="text-gray-500 dark:text-gray-400 mb-8 max-w-sm">
        This page does not exist or has been moved.
      </p>
      <Link
        href="/"
        className="px-6 py-3 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold transition-colors"
      >
        Browse prices
      </Link>
    </div>
  )
}
