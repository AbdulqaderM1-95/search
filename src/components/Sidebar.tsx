'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import type { Shop, IphoneModel } from '@/lib/types'
import { useLang } from '@/lib/lang-context'

function ShopAvatar({ shop, selected }: { shop: Shop; selected: boolean }) {
  const [imgError, setImgError] = useState(false)
  const SHOP_COLORS: Record<string, string> = {
    X: 'bg-blue-600', B: 'bg-purple-600', E: 'bg-green-600',
  }
  const initial = shop.name[0].toUpperCase()
  const colorClass = SHOP_COLORS[initial] ?? 'bg-red-600'

  if (shop.logo_url && !imgError) {
    return (
      <Image
        src={shop.logo_url}
        alt={shop.name}
        width={28}
        height={28}
        className="w-7 h-7 rounded-lg object-contain bg-white border border-gray-100 flex-shrink-0"
        onError={() => setImgError(true)}
      />
    )
  }
  return (
    <span className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold flex-shrink-0 ${
      selected ? 'bg-white/20 text-white' : `${colorClass} text-white`
    }`}>
      {initial}
    </span>
  )
}

function ChevronIcon({ open }: { open: boolean }) {
  return (
    <svg
      className={`w-3.5 h-3.5 text-gray-400 transition-transform duration-200 flex-shrink-0 ${open ? 'rotate-90' : ''}`}
      fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
    </svg>
  )
}

function groupModelsBySeries(models: IphoneModel[]): Map<string, IphoneModel[]> {
  const groups = new Map<string, IphoneModel[]>()
  for (const m of models) {
    const match = m.model_name.match(/^(iPhone \d+)/)
    const series = match ? match[1] : m.model_name
    if (!groups.has(series)) groups.set(series, [])
    groups.get(series)!.push(m)
  }
  return groups
}

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
  shops: Shop[]
  models: IphoneModel[]
  selectedModel: IphoneModel | null
  onSelectModel: (m: IphoneModel | null) => void
  searchActive?: boolean
  shopsViewActive?: boolean
  onProductsHeaderClick?: () => void
  onShopsHeaderClick?: () => void
}

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
  shops,
  models,
  selectedModel,
  onSelectModel,
  searchActive = false,
  shopsViewActive = false,
  onProductsHeaderClick,
  onShopsHeaderClick,
}: Props) {
  const { t } = useLang()

  // Top-level "All Categories" toggle
  const [allOpen, setAllOpen] = useState(true)
  // Which top-level sections are expanded
  const [expanded, setExpanded] = useState<Set<string>>(new Set(['products']))
  // Which series sub-groups are expanded inside Products
  const [seriesExpanded, setSeriesExpanded] = useState<Set<string>>(new Set())

  // Auto-expand the series that contains the selected model
  useEffect(() => {
    if (!selectedModel) return
    const match = selectedModel.model_name.match(/^(iPhone \d+)/)
    if (match) setSeriesExpanded(prev => new Set([...prev, match[1]]))
  }, [selectedModel])

  const toggleSection = (key: string) => {
    setExpanded(prev => {
      const next = new Set(prev)
      if (next.has(key)) next.delete(key)
      else next.add(key)
      return next
    })
  }

  const toggleSeries = (series: string) => {
    setSeriesExpanded(prev => {
      const next = new Set(prev)
      if (next.has(series)) next.delete(series)
      else next.add(series)
      return next
    })
  }

  const handleSelectShop = (id: string | null) => {
    onSelectShop(id)
    if (window.innerWidth < 768) onMobileClose()
  }

  const handleSelectModel = (m: IphoneModel) => {
    onSelectModel(m)
    if (window.innerWidth < 768) onMobileClose()
  }

  const isExpanded = (key: string) => expanded.has(key)
  const seriesGroups = groupModelsBySeries(models)

  return (
    <>
      {/* Mobile backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-[55] bg-black/40 backdrop-blur-sm"
          onClick={onMobileClose}
        />
      )}

      <aside
        className={`fixed top-0 left-0 h-full z-[60] bg-white dark:bg-gray-900 border-r border-gray-100 dark:border-gray-800 flex flex-col transition-[translate] duration-300 w-72
          ${mobileOpen ? 'translate-x-0' : 'translate-x-[-100%]'}`}
      >
        {/* ── All Categories header ── */}
        <div className="border-b border-gray-100 dark:border-gray-800 flex items-center px-4 py-3">
          <button
            onClick={() => setAllOpen(v => !v)}
            className="flex-1 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors rounded-lg"
          >
            <span className="text-[11px] font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-widest">
              All Categories
            </span>
            <ChevronIcon open={allOpen} />
          </button>
          <button
            onClick={onMobileClose}
            className="ml-2 p-1 rounded-md text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {allOpen && (
          <div className="flex-1 overflow-y-auto py-2">

            {/* ── Products Category ── */}
            <div className="px-3 mb-1">
              <button
                onClick={() => { if (isExpanded('products')) onProductsHeaderClick?.(); toggleSection('products') }}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-all text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 active:bg-blue-50 dark:active:bg-blue-950 active:text-blue-700 dark:active:text-blue-300 ${
                  isExpanded('products') ? 'shadow-[0_4px_16px_rgba(37,99,235,0.25)]' : ''
                }`}
              >
                <span className="flex items-center gap-2.5">
                  <span className="text-base">📱</span>
                  <span>{t.productsCategory}</span>
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="text-xs bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 px-1.5 py-0.5 rounded-md font-medium">
                    {models.length}
                  </span>
                  <ChevronIcon open={isExpanded('products')} />
                </span>
              </button>

              {isExpanded('products') && (
                <div className="mt-1 ml-2 pl-3 border-l-2 border-blue-100 dark:border-blue-900 py-1 space-y-1">

                  {/* ── Flat search results ── */}
                  {searchActive && models.map((m) => {
                    const isSelected = selectedModel?.id === m.id
                    return (
                      <button
                        key={m.id}
                        onClick={() => handleSelectModel(m)}
                        className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-sm transition-colors ${
                          isSelected ? 'bg-blue-600 text-white' : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                        }`}
                      >
                        <span className={`w-7 h-7 rounded-lg flex items-center justify-center text-[10px] font-bold flex-shrink-0 ${
                          isSelected ? 'bg-white/20 text-white' : 'bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300'
                        }`}>
                          {m.model_name.replace('iPhone ', '').split(' ')[0]}
                        </span>
                        <span className="font-medium truncate">{m.model_name}</span>
                      </button>
                    )
                  })}

                  {/* ── Grouped by series (normal mode) ── */}
                  {!searchActive && [...seriesGroups.entries()].map(([series, seriesModels]) => {
                    const seriesOpen = seriesExpanded.has(series)
                    const seriesNum = series.replace('iPhone ', '')
                    const hasSelected = seriesModels.some(m => m.id === selectedModel?.id)
                    return (
                      <div key={series}>
                        {/* Series sub-header */}
                        <button
                          onClick={() => toggleSeries(series)}
                          className={`w-full flex items-center justify-between px-2.5 py-2 rounded-xl text-sm transition-colors ${
                            hasSelected
                              ? 'text-blue-600 dark:text-blue-400 font-semibold'
                              : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
                          }`}
                        >
                          <span className="flex items-center gap-2.5">
                            <span className={`w-7 h-7 rounded-lg flex items-center justify-center text-[10px] font-bold flex-shrink-0 ${
                              hasSelected
                                ? 'bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300'
                                : 'bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400'
                            }`}>
                              {seriesNum}
                            </span>
                            <span className="font-medium">{series.replace(/\s+\d+$/, '')}</span>
                          </span>
                          <span className="flex items-center gap-1.5">
                            <span className="text-xs text-gray-400 dark:text-gray-500">{seriesModels.length}</span>
                            <ChevronIcon open={seriesOpen} />
                          </span>
                        </button>

                        {/* Models inside series */}
                        {seriesOpen && (
                          <div className="ml-2 pl-3 border-l-2 border-gray-100 dark:border-gray-800 py-0.5 space-y-0.5">
                            {seriesModels.map((m) => {
                              const isSelected = selectedModel?.id === m.id
                              const variant = m.model_name.includes('Pro Max') ? `${seriesNum} Pro Max`
                                : m.model_name.includes('Pro') ? `${seriesNum} Pro`
                                : m.model_name.includes('Air') ? `${seriesNum} Air`
                                : `iPhone ${seriesNum}`
                              const badge = m.model_name.includes('Pro Max') ? 'Max'
                                : m.model_name.includes('Pro') ? 'Pro'
                                : m.model_name.includes('Air') ? 'Air'
                                : seriesNum
                              return (
                                <button
                                  key={m.id}
                                  onClick={() => handleSelectModel(m)}
                                  className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-sm transition-colors ${
                                    isSelected
                                      ? 'bg-blue-600 text-white'
                                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                                  }`}
                                >
                                  <span className={`w-7 h-7 rounded-lg flex items-center justify-center text-[10px] font-bold flex-shrink-0 ${
                                    isSelected ? 'bg-white/20 text-white' : 'bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300'
                                  }`}>
                                    {badge}
                                  </span>
                                  <span className="font-medium truncate">{variant}</span>
                                </button>
                              )
                            })}
                          </div>
                        )}
                      </div>
                    )
                  })}

                  {/* Sort & filter — price-related, shown only when a model is selected */}
                  {selectedModel && (
                    <>
                      <div className="border-t border-gray-100 dark:border-gray-800 mt-1" />

                      <div className="pt-1">
                        <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest mb-2 px-1">{t.sort}</p>
                        <div className="space-y-0.5">
                          {[
                            { label: t.priceLowHigh, value: 'asc' as SortOrder },
                            { label: t.priceHighLow, value: 'desc' as SortOrder },
                          ].map((opt) => (
                            <button
                              key={opt.value}
                              onClick={() => onSortChange(opt.value)}
                              className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-sm transition-colors ${
                                sortOrder === opt.value
                                  ? 'bg-gray-100 dark:bg-gray-800 font-medium text-gray-900 dark:text-white'
                                  : 'text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800'
                              }`}
                            >
                              <span className={`w-3.5 h-3.5 rounded-full border-2 flex-shrink-0 transition-colors ${
                                sortOrder === opt.value ? 'border-blue-600 bg-blue-600' : 'border-gray-300 dark:border-gray-600'
                              }`} />
                              {opt.label}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="border-t border-gray-100 dark:border-gray-800" />

                      <div>
                        <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest mb-2 px-1">{t.filter}</p>
                        <div className="space-y-0.5">
                          {[
                            { label: t.inStockFilter, value: filterInStock, onChange: onFilterInStock },
                            { label: t.authorisedFilter, value: filterAuthorised, onChange: onFilterAuthorised },
                          ].map((f) => (
                            <button
                              key={f.label}
                              onClick={() => f.onChange(!f.value)}
                              className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-sm transition-colors ${
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
                    </>
                  )}
                </div>
              )}
            </div>

            <div className="mx-3 border-t border-gray-100 dark:border-gray-800 my-1" />

            {/* ── Shops Category ── */}
            <div className="px-3">
              <button
                onClick={() => { if (isExpanded('shops')) onShopsHeaderClick?.(); toggleSection('shops') }}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-all text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 active:bg-blue-50 dark:active:bg-blue-950 active:text-blue-700 dark:active:text-blue-300 ${
                  isExpanded('shops') ? 'shadow-[0_4px_16px_rgba(37,99,235,0.25)]' : ''
                }`}
              >
                <span className="flex items-center gap-2.5">
                  <span className="text-base">🏪</span>
                  <span>{t.shopsCategory}</span>
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="text-xs bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 px-1.5 py-0.5 rounded-md font-medium">
                    {shops.length}
                  </span>
                  <ChevronIcon open={isExpanded('shops')} />
                </span>
              </button>

              {isExpanded('shops') && (
                <div className="mt-1 ml-2 pl-3 border-l-2 border-blue-100 dark:border-blue-900 py-1 space-y-3">

                  <div className="space-y-0.5">
                    {!searchActive && (
                      <button
                        onClick={() => handleSelectShop(null)}
                        className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-sm transition-colors ${
                          shopsViewActive && selectedShopId === null
                            ? 'bg-blue-600 text-white'
                            : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                        }`}
                      >
                        <span className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold flex-shrink-0 ${
                          shopsViewActive && selectedShopId === null ? 'bg-white/20 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300'
                        }`}>
                          All
                        </span>
                        <span className="font-medium">{t.allShops}</span>
                      </button>
                    )}

                    {shops.map((shop) => (
                      <button
                        key={shop.id}
                        onClick={() => handleSelectShop(shop.id)}
                        className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-sm transition-colors ${
                          selectedShopId === shop.id
                            ? 'bg-blue-600 text-white'
                            : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                        }`}
                      >
                        <ShopAvatar shop={shop} selected={selectedShopId === shop.id} />
                        <span className="font-medium truncate">{shop.name}</span>
                        {shop.is_authorised_reseller && (
                          <svg
                            className={`w-3.5 h-3.5 ml-auto shrink-0 ${selectedShopId === shop.id ? 'text-white' : 'text-emerald-500'}`}
                            fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24"
                            aria-label="Authorised reseller"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                          </svg>
                        )}
                      </button>
                    ))}
                  </div>

                </div>
              )}
            </div>

          </div>
        )}
      </aside>
    </>
  )
}
