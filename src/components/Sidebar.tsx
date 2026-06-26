'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Shop } from '@/lib/types'

type SortOrder = 'asc' | 'desc'

type Props = {
  mobileOpen: boolean
  onMobileClose: () => void
  selectedShopId: string | null
  onSelectShop: (id: string | null) => void
  sortOrder: SortOrder
  onSortChange: (o: SortOrder) => void
  filterInStock: boolean
  onFilterInStock: (v: boolean) => void
  filterAuthorised: boolean
  onFilterAuthorised: (v: boolean) => void
}

type Category = { key: string; label: string; icon: string }

const CATEGORIES: Category[] = [
  { key: 'tech', label: 'Tech Shops', icon: '💻' },
  // future: { key: 'telecom', label: 'Telecom Shops', icon: '📡' }
]

export default function Sidebar({
  mobileOpen,
  onMobileClose,
  selectedShopId,
  onSelectShop,
  sortOrder,
  onSortChange,
  filterInStock,
  onFilterInStock,
  filterAuthorised,
  onFilterAuthorised,
}: Props) {
  const supabase = createClient()
  const [shops, setShops] = useState<Shop[]>([])
  const [activeCategory, setActiveCategory] = useState<string | null>(null)

  useEffect(() => {
    supabase
      .from('shops')
      .select('*')
      .order('name')
      .then(({ data }) => setShops((data as Shop[]) ?? []))
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const handleCategoryClick = (key: string) => {
    setActiveCategory(prev => prev === key ? null : key)
  }

  const handleSelectShop = (id: string | null) => {
    onSelectShop(id)
    if (window.innerWidth < 768) onMobileClose()
  }

  const initial = (name: string) => name[0].toUpperCase()

  const SHOP_COLORS: Record<string, string> = {
    X: 'bg-blue-600', B: 'bg-purple-600', E: 'bg-green-600',
  }
  const shopColor = (name: string) => SHOP_COLORS[initial(name)] ?? 'bg-red-600'

  const activeShops = shops // future: filter by category

  return (
    <>
      {/* Mobile backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/40 backdrop-blur-sm md:hidden"
          onClick={onMobileClose}
        />
      )}

      {/* Sidebar panel */}
      <aside
        className={`fixed top-0 left-0 h-full z-40 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 flex flex-col transition-transform duration-300
          ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}
          md:translate-x-0 md:static md:h-auto md:min-h-screen
          ${activeCategory ? 'w-72' : 'w-56'}`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-4 border-b border-gray-100 dark:border-gray-800">
          <span className="text-sm font-bold text-gray-900 dark:text-white tracking-wide">
            Shops Category
          </span>
          <button
            onClick={onMobileClose}
            className="md:hidden text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto">

          {/* Category list */}
          <div className="p-3 space-y-1">
            {CATEGORIES.map((cat) => (
              <div key={cat.key}>
                <button
                  onClick={() => handleCategoryClick(cat.key)}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                    activeCategory === cat.key
                      ? 'bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <span>{cat.icon}</span>
                    <span>{cat.label}</span>
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="text-xs text-gray-400">{activeShops.length}</span>
                    <svg
                      className={`w-3.5 h-3.5 text-gray-400 transition-transform ${activeCategory === cat.key ? 'rotate-90' : ''}`}
                      fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                    </svg>
                  </span>
                </button>

                {/* Sub-panel: shop list + filters */}
                {activeCategory === cat.key && (
                  <div className="mt-1 ml-2 pl-3 border-l-2 border-blue-100 dark:border-blue-900 space-y-4 py-2">

                    {/* Shops */}
                    <div className="space-y-1">
                      {/* All Shops — always first */}
                      <button
                        onClick={() => handleSelectShop(null)}
                        className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-sm transition-colors ${
                          selectedShopId === null
                            ? 'bg-blue-600 text-white'
                            : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                        }`}
                      >
                        <span className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold flex-shrink-0 ${
                          selectedShopId === null ? 'bg-white/20 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300'
                        }`}>
                          All
                        </span>
                        <span className="font-medium">All Shops</span>
                      </button>

                      {/* Individual shops */}
                      {activeShops.map((shop) => (
                        <button
                          key={shop.id}
                          onClick={() => handleSelectShop(shop.id)}
                          className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-sm transition-colors ${
                            selectedShopId === shop.id
                              ? 'bg-blue-600 text-white'
                              : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                          }`}
                        >
                          <span className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold text-white flex-shrink-0 ${shopColor(shop.name)}`}>
                            {initial(shop.name)}
                          </span>
                          <span className="font-medium truncate">{shop.name}</span>
                          {shop.is_authorised_reseller && (
                            <span className="ml-auto text-xs shrink-0" title="Authorised reseller">✓</span>
                          )}
                        </button>
                      ))}
                    </div>

                    {/* Divider */}
                    <div className="border-t border-gray-100 dark:border-gray-800" />

                    {/* Sort */}
                    <div>
                      <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2 px-1">Sort</p>
                      <div className="space-y-1">
                        {[
                          { label: 'Price: Low → High', value: 'asc' as SortOrder },
                          { label: 'Price: High → Low', value: 'desc' as SortOrder },
                        ].map((opt) => (
                          <button
                            key={opt.value}
                            onClick={() => onSortChange(opt.value)}
                            className={`w-full flex items-center gap-2 px-2.5 py-2 rounded-xl text-sm transition-colors ${
                              sortOrder === opt.value
                                ? 'bg-gray-100 dark:bg-gray-800 font-medium text-gray-900 dark:text-white'
                                : 'text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800'
                            }`}
                          >
                            <span className={`w-3.5 h-3.5 rounded-full border-2 flex-shrink-0 ${
                              sortOrder === opt.value ? 'border-blue-600 bg-blue-600' : 'border-gray-300 dark:border-gray-600'
                            }`} />
                            {opt.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Divider */}
                    <div className="border-t border-gray-100 dark:border-gray-800" />

                    {/* Filters */}
                    <div>
                      <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2 px-1">Filter</p>
                      <div className="space-y-1">
                        {[
                          { label: 'In stock only', value: filterInStock, onChange: onFilterInStock },
                          { label: 'Authorised reseller', value: filterAuthorised, onChange: onFilterAuthorised },
                        ].map((f) => (
                          <button
                            key={f.label}
                            onClick={() => f.onChange(!f.value)}
                            className={`w-full flex items-center gap-2 px-2.5 py-2 rounded-xl text-sm transition-colors ${
                              f.value
                                ? 'bg-gray-100 dark:bg-gray-800 font-medium text-gray-900 dark:text-white'
                                : 'text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800'
                            }`}
                          >
                            <span className={`w-4 h-4 rounded border-2 flex items-center justify-center flex-shrink-0 transition-colors ${
                              f.value ? 'bg-blue-600 border-blue-600' : 'border-gray-300 dark:border-gray-600'
                            }`}>
                              {f.value && (
                                <svg className="w-2.5 h-2.5 text-white" fill="none" stroke="currentColor" strokeWidth={3} viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                                </svg>
                              )}
                            </span>
                            {f.label}
                          </button>
                        ))}
                      </div>
                    </div>

                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </aside>
    </>
  )
}
