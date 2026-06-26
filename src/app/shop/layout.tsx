import Link from 'next/link'

export default function ShopLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <header className="border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
        <div className="max-w-4xl mx-auto px-4 h-14 flex items-center justify-between">
          <Link href="/" className="text-lg font-bold">
            <span className="text-blue-600">EZ</span>search
          </Link>
          <div className="flex items-center gap-4 text-sm">
            <span className="text-amber-600 font-medium">Shop portal</span>
            <Link href="/" className="text-gray-500 hover:text-gray-900 dark:hover:text-white">
              ← Back to app
            </Link>
          </div>
        </div>
      </header>
      <main className="max-w-4xl mx-auto px-4 py-8">{children}</main>
    </div>
  )
}
