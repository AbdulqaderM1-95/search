import Link from 'next/link'
import Image from 'next/image'

export const metadata = { title: 'About — EZsearch' }

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-white dark:bg-gray-950">
      <div className="max-w-2xl mx-auto px-4 py-14 sm:py-20">

        {/* Logo + back */}
        <div className="flex items-center justify-between mb-12">
          <Link href="/" className="flex items-center gap-2">
            <div className="bg-blue-600 rounded-lg p-1">
              <Image src="/logo.png" alt="EZsearch" width={24} height={24} className="w-6 h-6" />
            </div>
            <span className="text-base font-extrabold tracking-tight text-gray-900 dark:text-white">EZsearch</span>
          </Link>
          <Link
            href="/"
            className="text-sm text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
          >
            ← Back
          </Link>
        </div>

        {/* Heading */}
        <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 dark:text-white mb-4 tracking-tight">
          About EZsearch
        </h1>
        <p className="text-lg text-blue-600 dark:text-blue-400 font-medium mb-10">
          Kuwait's simplest iPhone price tracker.
        </p>

        {/* Sections */}
        <div className="space-y-10 text-gray-600 dark:text-gray-300 leading-relaxed">

          <section>
            <h2 className="text-base font-bold text-gray-900 dark:text-white uppercase tracking-widest mb-3">What we do</h2>
            <p>
              EZsearch tracks live iPhone prices from the top shops across Kuwait so you never overpay.
              We gather prices from authorised resellers and independent stores alike, giving you a single,
              honest view of the market in seconds.
            </p>
          </section>

          <section>
            <h2 className="text-base font-bold text-gray-900 dark:text-white uppercase tracking-widest mb-3">Why we built it</h2>
            <p>
              Comparing iPhone prices in Kuwait used to mean visiting multiple Instagram pages, WhatsApp groups,
              and storefronts — only to find outdated information. EZsearch was built to cut through the noise
              and give shoppers a fast, trustworthy answer: <span className="font-semibold text-gray-800 dark:text-gray-100">where is the best deal right now?</span>
            </p>
          </section>

          <section>
            <h2 className="text-base font-bold text-gray-900 dark:text-white uppercase tracking-widest mb-3">Features</h2>
            <ul className="space-y-2">
              {[
                'Live prices updated directly by shop partners',
                'Side-by-side model comparison powered by AI',
                'Price alerts — get notified when a price drops',
                'Authorised reseller badges so you know who to trust',
                'Full Arabic language support',
              ].map(f => (
                <li key={f} className="flex items-start gap-2">
                  <span className="mt-1 w-1.5 h-1.5 rounded-full bg-blue-500 flex-shrink-0" />
                  {f}
                </li>
              ))}
            </ul>
          </section>

          <section>
            <h2 className="text-base font-bold text-gray-900 dark:text-white uppercase tracking-widest mb-3">For shop owners</h2>
            <p>
              Want your store listed on EZsearch? We partner with shops across Kuwait to display accurate,
              real-time pricing. Reach thousands of buyers actively looking for the best deal.
              Get in touch and we will set you up.
            </p>
          </section>

        </div>

        {/* CTA */}
        <div className="mt-14 pt-10 border-t border-gray-100 dark:border-gray-800 flex flex-col sm:flex-row gap-3">
          <Link
            href="/"
            className="flex-1 text-center bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-3 rounded-2xl transition-colors text-sm"
          >
            Browse prices
          </Link>
        </div>

      </div>
    </main>
  )
}
