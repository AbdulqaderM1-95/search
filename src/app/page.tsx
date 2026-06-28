'use client'

import { useEffect, useState, useCallback } from 'react'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/client'
import type { IphoneModel, Price, Shop } from '@/lib/types'
import StorageSelector from '@/components/StorageSelector'
import ShopCard from '@/components/ShopCard'
import Header from '@/components/Header'
import ChooseAssistant from '@/components/ChooseAssistant'
import Sidebar from '@/components/Sidebar'
import Footer from '@/components/Footer'
import { useLang } from '@/lib/lang-context'

type PriceWithShop = Price & { shops: Shop }

const SHOP_COLORS: Record<string, string> = {
  X: 'bg-blue-600', B: 'bg-purple-600', E: 'bg-green-600',
}
const shopColor = (name: string) => SHOP_COLORS[name[0]?.toUpperCase()] ?? 'bg-red-600'

function ShopProfileCard({ shop, t, onSelect }: { shop: Shop; t: Record<string, string>; onSelect?: () => void }) {
  const [imgError, setImgError] = useState(false)
  return (
    <div
      onClick={onSelect}
      className={`bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-5 flex items-center gap-4 hover:border-blue-200 dark:hover:border-blue-800 hover:shadow-md transition-all ${onSelect ? 'cursor-pointer' : ''}`}
    >
      {shop.logo_url && !imgError ? (
        <Image
          src={shop.logo_url}
          alt={shop.name}
          width={56}
          height={56}
          className="w-14 h-14 rounded-xl object-contain bg-white border border-gray-100 flex-shrink-0"
          onError={() => setImgError(true)}
        />
      ) : (
        <div className={`w-14 h-14 rounded-xl flex items-center justify-center text-2xl font-bold text-white flex-shrink-0 ${shopColor(shop.name)}`}>
          {shop.name[0]}
        </div>
      )}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <h3 className="font-bold text-gray-900 dark:text-white">{shop.name}</h3>
          {shop.is_authorised_reseller && (
            <span className="inline-flex items-center gap-1 text-xs text-blue-600 dark:text-blue-400 font-medium bg-blue-50 dark:bg-blue-950 px-2 py-0.5 rounded-full">
              <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
              </svg>
              {t.authorisedReseller}
            </span>
          )}
        </div>
        <div className="mt-1 flex flex-wrap gap-x-3 text-sm text-gray-500 dark:text-gray-400">
          {shop.area && <span>📍 {shop.area}</span>}
          {shop.phone && <span>📞 {shop.phone}</span>}
        </div>
      </div>
      <div className="flex flex-col gap-2 flex-shrink-0">
        {shop.reach_url && (
          <a
            href={shop.reach_url}
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-1.5 rounded-full bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold transition-colors text-center"
          >
            {t.visitShop}
          </a>
        )}
        {shop.instagram_url && (
          <a
            href={shop.instagram_url}
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-1.5 rounded-full border border-gray-200 dark:border-gray-700 text-xs font-medium text-gray-600 dark:text-gray-400 hover:border-pink-300 hover:text-pink-600 transition-colors flex items-center justify-center gap-1.5"
          >
            <svg className="w-3 h-3 text-pink-500" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/>
            </svg>
            Instagram
          </a>
        )}
      </div>
    </div>
  )
}

export default function HomePage() {
  const supabase = createClient()
  const { t } = useLang()

  const [models, setModels] = useState<IphoneModel[]>([])
  const [selectedModel, setSelectedModel] = useState<IphoneModel | null>(null)
  const [selectedStorage, setSelectedStorage] = useState('256 GB')
  const [prices, setPrices] = useState<PriceWithShop[]>([])
  const [shops, setShops] = useState<Shop[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')

  // Tracks which top-level category the user is browsing — independent of each other
  const [activeView, setActiveView] = useState<'products' | 'shops' | 'search'>('products')

  // Sidebar state
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [selectedShopId, setSelectedShopId] = useState<string | null>(null)
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc')
  const [filterInStock, setFilterInStock] = useState(false)
  const [filterAuthorised, setFilterAuthorised] = useState(false)
  const [bestDeals, setBestDeals] = useState<PriceWithShop[]>([])

  useEffect(() => {
    supabase
      .from('iphone_models')
      .select('*')
      .order('model_name')
      .then(({ data }) => {
        if (data && data.length > 0) setModels(data)
        setLoading(false)
      })

    supabase
      .from('shops')
      .select('*')
      .order('name')
      .then(({ data }) => setShops((data as Shop[]) ?? []))

    supabase
      .from('prices')
      .select('*, shops(*)')
      .eq('in_stock', true)
      .order('price_kwd', { ascending: true })
      .limit(4)
      .then(({ data }) => setBestDeals((data as PriceWithShop[]) ?? []))
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const loadPrices = useCallback(async () => {
    if (!selectedModel) return
    setLoading(true)
    const { data } = await supabase
      .from('prices')
      .select('*, shops(*)')
      .eq('model_id', selectedModel.id)
      .eq('storage_option', selectedStorage)
      .order('price_kwd', { ascending: true })
    setPrices((data as PriceWithShop[]) ?? [])
    setLoading(false)
  }, [selectedModel, selectedStorage]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => { loadPrices() }, [loadPrices])

  const q = searchQuery.trim().toLowerCase()
  const filteredModels = q ? models.filter(m => m.model_name.toLowerCase().includes(q)) : models
  const filteredShops = q ? shops.filter(s => s.name.toLowerCase().includes(q)) : shops

  let displayed = [...prices]
  if (filterInStock) displayed = displayed.filter(p => p.in_stock)
  if (filterAuthorised) displayed = displayed.filter(p => p.shops?.is_authorised_reseller)
  if (sortOrder === 'desc') displayed = displayed.sort((a, b) => b.price_kwd - a.price_kwd)

  const inStock = displayed.filter(p => p.in_stock)
  const outOfStock = displayed.filter(p => !p.in_stock)

  const selectedShop = shops.find(s => s.id === selectedShopId) ?? null

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex flex-col">

      <Header
        onMenuClick={() => setMobileMenuOpen(true)}
        onHomeClick={() => {
          setSearchQuery('')
          setSelectedModel(null)
          setSelectedShopId(null)
          setActiveView('products')
          setMobileMenuOpen(false)
        }}
        searchQuery={searchQuery}
        onSearchChange={(q) => {
          setSearchQuery(q)
          if (!q.trim() && activeView === 'search') setActiveView('products')
        }}
        onSearchSubmit={() => setActiveView('search')}
        onClearSearch={() => {
          setSearchQuery('')
          setSelectedModel(null)
          setSelectedShopId(null)
          setActiveView('products')
        }}
      />

      <div className="flex flex-1">
        <Sidebar
          mobileOpen={mobileMenuOpen}
          onMobileClose={() => setMobileMenuOpen(false)}
          selectedShopId={selectedShopId}
          onSelectShop={(id) => {
            setSelectedShopId(id)
            setActiveView('shops')
          }}
          sortOrder={sortOrder}
          onSortChange={setSortOrder}
          filterInStock={filterInStock}
          onFilterInStock={setFilterInStock}
          filterAuthorised={filterAuthorised}
          onFilterAuthorised={setFilterAuthorised}
          shops={filteredShops}
          models={filteredModels}
          searchActive={!!searchQuery.trim()}
          shopsViewActive={activeView === 'shops'}
          onProductsHeaderClick={() => { setSelectedModel(null); setActiveView('products') }}
          onShopsHeaderClick={() => { setSelectedShopId(null); setActiveView('products') }}
          selectedModel={selectedModel}
          onSelectModel={(m) => {
            setSelectedModel(m)
            setActiveView('products')
            setSearchQuery('')
            if (m && !m.storage_options.includes(selectedStorage)) {
              setSelectedStorage(m.storage_options[0] ?? '256 GB')
            }
          }}
        />

        <div className="flex-1 min-w-0">
          <main className="max-w-2xl mx-auto px-4 pb-6 pt-4 sm:pt-6">

            {activeView === 'search' ? (
              /* ── Search results ── */
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-5">
                  {filteredModels.length + filteredShops.length === 0
                    ? t.noResults
                    : `${filteredModels.length + filteredShops.length} ${t.resultsFor} "${searchQuery}"`}
                </p>

                {filteredModels.length === 0 && filteredShops.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-20 text-center">
                    <span className="text-4xl mb-3">🔍</span>
                    <p className="text-lg font-semibold text-gray-700 dark:text-gray-300">{t.noResults}</p>
                    <button
                      onClick={() => { setSearchQuery(''); setActiveView('products') }}
                      className="mt-4 text-sm text-blue-600 hover:underline font-medium"
                    >
                      {t.clearAllFilters}
                    </button>
                  </div>
                ) : (
                  <>
                    {filteredModels.length > 0 && (
                      <section className="mb-8">
                        <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3">
                          📱 {t.productsCategory}
                        </h2>
                        <div className="space-y-3">
                          {filteredModels.map(m => (
                            <button
                              key={m.id}
                              onClick={() => { setSelectedModel(m); setActiveView('products'); setSearchQuery(''); if (!m.storage_options.includes(selectedStorage)) setSelectedStorage(m.storage_options[0] ?? '256 GB') }}
                              className="w-full bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 hover:border-blue-300 dark:hover:border-blue-700 hover:shadow-md transition-all text-left p-5 flex items-center gap-4"
                            >
                              {/* Icon / image */}
                              {m.image_url ? (
                                <Image src={m.image_url} alt={m.model_name} width={56} height={56}
                                  className="w-14 h-14 rounded-xl object-contain flex-shrink-0" />
                              ) : (
                                <span className="w-14 h-14 rounded-xl bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300 flex items-center justify-center text-2xl flex-shrink-0">
                                  📱
                                </span>
                              )}
                              <div className="flex-1 min-w-0">
                                <p className="font-bold text-gray-900 dark:text-white text-base">{m.model_name}</p>
                                <div className="mt-2 flex flex-wrap gap-1.5">
                                  {m.storage_options.map(s => (
                                    <span key={s} className="text-xs px-2.5 py-0.5 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 font-medium">
                                      {s}
                                    </span>
                                  ))}
                                </div>
                              </div>
                              <svg className="w-5 h-5 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                              </svg>
                            </button>
                          ))}
                        </div>
                      </section>
                    )}

                    {filteredShops.length > 0 && (
                      <section>
                        <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3">
                          🏪 {t.shopsCategory}
                        </h2>
                        <div className="space-y-2">
                          {filteredShops.map(shop => (
                            <ShopProfileCard
                              key={shop.id}
                              shop={shop}
                              t={t}
                              onSelect={() => { setSelectedShopId(shop.id); setActiveView('shops'); setSearchQuery('') }}
                            />
                          ))}
                        </div>
                      </section>
                    )}
                  </>
                )}
              </div>
            ) : activeView === 'shops' ? (
              selectedShop ? (
                /* ── Single shop profile ── */
                <div className="py-2">
                  <div className="flex flex-col items-center text-center gap-4 py-8 bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 mb-6">
                    {selectedShop.logo_url ? (
                      <Image
                        src={selectedShop.logo_url}
                        alt={selectedShop.name}
                        width={80}
                        height={80}
                        className="rounded-2xl object-contain bg-white border border-gray-100 shadow-sm"
                      />
                    ) : (
                      <div className={`w-20 h-20 rounded-2xl flex items-center justify-center text-3xl font-bold text-white ${shopColor(selectedShop.name)}`}>
                        {selectedShop.name[0]}
                      </div>
                    )}
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{selectedShop.name}</h2>
                      {selectedShop.is_authorised_reseller && (
                        <span className="inline-flex items-center gap-1 text-sm text-blue-600 dark:text-blue-400 font-medium mt-1">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          {t.authorisedReseller}
                        </span>
                      )}
                    </div>
                    <div className="flex flex-col items-center gap-1 text-sm text-gray-500 dark:text-gray-400">
                      {selectedShop.area && <span>📍 {selectedShop.area}</span>}
                      {selectedShop.phone && <span>📞 {selectedShop.phone}</span>}
                    </div>
                    <div className="flex gap-3 mt-1">
                      {selectedShop.reach_url && (
                        <a href={selectedShop.reach_url} target="_blank" rel="noopener noreferrer"
                          className="px-5 py-2 rounded-full bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold transition-colors">
                          {t.visitShop}
                        </a>
                      )}
                      {selectedShop.instagram_url && (
                        <a href={selectedShop.instagram_url} target="_blank" rel="noopener noreferrer"
                          className="px-5 py-2 rounded-full border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm font-medium text-gray-700 dark:text-gray-300 hover:border-pink-300 hover:text-pink-600 transition-colors flex items-center gap-2">
                          <svg className="w-4 h-4 text-pink-500" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/>
                          </svg>
                          Instagram
                        </a>
                      )}
                    </div>
                  </div>
                  <p className="text-center text-sm text-gray-400 dark:text-gray-500">{t.selectModelHint}</p>
                </div>
              ) : (
                /* ── All Shops grid ── */
                <div>
                  <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white mb-1">{t.allShops}</h1>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-5">{t.shopsCategory}</p>
                  <div className="space-y-3">
                    {shops.length === 0 ? (
                      Array.from({ length: 3 }).map((_, i) => (
                        <div key={i} className="h-24 rounded-2xl bg-gray-200 dark:bg-gray-800 animate-pulse" />
                      ))
                    ) : filteredShops.map(shop => (
                      <ShopProfileCard key={shop.id} shop={shop} t={t} />
                    ))}
                  </div>
                </div>
              )
            ) : selectedModel ? (
              /* ── Price View (Products category) ── */
              <>
                <div className="mb-5">
                  <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
                    {selectedModel.model_name}
                  </h1>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{t.pageSubtitle}</p>
                </div>

                <StorageSelector
                  options={selectedModel.storage_options}
                  selected={selectedStorage}
                  onSelect={setSelectedStorage}
                />

                {(filterInStock || filterAuthorised || sortOrder === 'desc') && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {filterInStock && (
                      <button onClick={() => setFilterInStock(false)}
                        className="flex items-center gap-1.5 text-xs bg-emerald-100 dark:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300 px-3 py-1.5 rounded-full font-medium hover:bg-emerald-200 transition-colors">
                        {t.inStockOnlyChip} <span className="text-emerald-500">×</span>
                      </button>
                    )}
                    {filterAuthorised && (
                      <button onClick={() => setFilterAuthorised(false)}
                        className="flex items-center gap-1.5 text-xs bg-purple-100 dark:bg-purple-900/60 text-purple-700 dark:text-purple-300 px-3 py-1.5 rounded-full font-medium hover:bg-purple-200 transition-colors">
                        {t.authorisedOnlyChip} <span className="text-purple-500">×</span>
                      </button>
                    )}
                    {sortOrder === 'desc' && (
                      <button onClick={() => setSortOrder('asc')}
                        className="flex items-center gap-1.5 text-xs bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-3 py-1.5 rounded-full font-medium hover:bg-gray-300 transition-colors">
                        {t.priceHighLowChip} <span>×</span>
                      </button>
                    )}
                  </div>
                )}

                <div className="mt-4 space-y-3">
                  {loading ? (
                    Array.from({ length: 4 }).map((_, i) => (
                      <div key={i} className="h-36 rounded-2xl bg-gray-200 dark:bg-gray-800 animate-pulse" />
                    ))
                  ) : displayed.length === 0 ? (
                    <div className="text-center py-16">
                      <p className="text-lg font-medium text-gray-500 dark:text-gray-400">{t.noShopsMatch}</p>
                      <p className="text-sm mt-1 text-gray-400">{t.tryAdjusting}</p>
                      <button onClick={() => { setFilterInStock(false); setFilterAuthorised(false) }}
                        className="mt-4 text-sm text-blue-600 hover:text-blue-700 font-medium hover:underline">
                        {t.clearAllFilters}
                      </button>
                    </div>
                  ) : (
                    <>
                      {inStock.map(p => (
                        <ShopCard key={p.id} price={p} shop={p.shops} modelId={selectedModel.id} storage={selectedStorage} />
                      ))}
                      {!filterInStock && outOfStock.map(p => (
                        <ShopCard key={p.id} price={p} shop={p.shops} modelId={selectedModel.id} storage={selectedStorage} dimmed />
                      ))}
                    </>
                  )}
                </div>
              </>
            ) : (
              /* ── Landing page ── */
              <div className="py-2 sm:py-4 space-y-8 sm:space-y-10">

                {/* Hero */}
                <div className="text-center py-4 sm:py-6">
                  <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-gray-900 dark:text-white">
                    {t.heroTitle}
                  </h1>
                  <p className="mt-2 text-gray-500 dark:text-gray-400 text-sm max-w-xs sm:max-w-sm mx-auto">
                    {t.heroSubtitle}
                  </p>
                </div>

                {/* Guided start */}
                <div>
                  <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3">{t.getStarted}</h2>
                  <div className="grid grid-cols-2 gap-2 sm:gap-3">
                    <button
                      onClick={() => setActiveView('products')}
                      className="flex flex-col items-center gap-2 sm:gap-3 p-3 sm:p-5 bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 hover:border-blue-300 hover:shadow-[0_4px_20px_rgba(37,99,235,0.15)] transition-all group active:scale-[0.98]"
                    >
                      <span className="text-2xl sm:text-3xl">📱</span>
                      <div className="text-center">
                        <p className="font-bold text-gray-900 dark:text-white text-sm">{t.productsCategory}</p>
                        <p className="text-xs text-gray-400 mt-0.5 hidden sm:block">{t.browseModels}</p>
                      </div>
                    </button>
                    <button
                      onClick={() => setActiveView('shops')}
                      className="flex flex-col items-center gap-2 sm:gap-3 p-3 sm:p-5 bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 hover:border-blue-300 hover:shadow-[0_4px_20px_rgba(37,99,235,0.15)] transition-all group active:scale-[0.98]"
                    >
                      <span className="text-2xl sm:text-3xl">🏪</span>
                      <div className="text-center">
                        <p className="font-bold text-gray-900 dark:text-white text-sm">{t.shopsCategory}</p>
                        <p className="text-xs text-gray-400 mt-0.5 hidden sm:block">{t.browseShops}</p>
                      </div>
                    </button>
                  </div>
                </div>

                {/* Quick picks — latest models */}
                {models.length > 0 && (
                  <div>
                    <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3">{t.quickPicks}</h2>
                    <div className="space-y-2">
                      {models.slice(0, 4).map(m => (
                        <button
                          key={m.id}
                          onClick={() => { setSelectedModel(m); setActiveView('products'); if (!m.storage_options.includes(selectedStorage)) setSelectedStorage(m.storage_options[0] ?? '256 GB') }}
                          className="w-full flex items-center gap-3 px-4 py-3 bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 hover:border-blue-300 hover:shadow-[0_4px_16px_rgba(37,99,235,0.12)] transition-all text-left"
                        >
                          <span className="w-9 h-9 rounded-xl bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300 flex items-center justify-center text-lg flex-shrink-0">📱</span>
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-gray-900 dark:text-white text-sm truncate">{m.model_name}</p>
                            <p className="text-xs text-gray-400 mt-0.5">{m.storage_options.join(' · ')}</p>
                          </div>
                          <svg className="w-4 h-4 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                          </svg>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Today's best deals */}
                {bestDeals.length > 0 && (
                  <div>
                    <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3">{t.bestDeals}</h2>
                    <div className="space-y-2">
                      {bestDeals.map(p => {
                        const model = models.find(m => m.id === p.model_id)
                        return (
                          <button
                            key={p.id}
                            onClick={() => { if (model) { setSelectedModel(model); setSelectedStorage(p.storage_option); setActiveView('products') } }}
                            className="w-full flex items-center gap-3 px-4 py-3 bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 hover:border-blue-300 hover:shadow-[0_4px_16px_rgba(37,99,235,0.12)] transition-all text-left"
                          >
                            <span className="w-9 h-9 rounded-xl bg-emerald-100 dark:bg-emerald-900 text-emerald-600 dark:text-emerald-300 flex items-center justify-center text-lg flex-shrink-0">🏷️</span>
                            <div className="flex-1 min-w-0">
                              <p className="font-semibold text-gray-900 dark:text-white text-sm truncate">{model?.model_name ?? '—'} · {p.storage_option}</p>
                              <p className="text-xs text-gray-400 mt-0.5">{p.shops?.name}</p>
                            </div>
                            <span className="text-base font-bold text-emerald-600 dark:text-emerald-400 tabular-nums flex-shrink-0">
                              {p.price_kwd.toFixed(3)} KD
                            </span>
                          </button>
                        )
                      })}
                    </div>
                  </div>
                )}

              </div>
            )}

          </main>
          <Footer />
        </div>
      </div>

      <ChooseAssistant />
    </div>
  )
}
