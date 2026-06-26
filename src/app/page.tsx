'use client'

import { useEffect, useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { IphoneModel, Price, Shop } from '@/lib/types'
import ModelSelector from '@/components/ModelSelector'
import StorageSelector from '@/components/StorageSelector'
import ShopCard from '@/components/ShopCard'
import Header from '@/components/Header'
import ChooseAssistant from '@/components/ChooseAssistant'
import Sidebar from '@/components/Sidebar'

type PriceWithShop = Price & { shops: Shop }

export default function HomePage() {
  const supabase = createClient()

  const [models, setModels] = useState<IphoneModel[]>([])
  const [selectedModel, setSelectedModel] = useState<IphoneModel | null>(null)
  const [selectedStorage, setSelectedStorage] = useState('256 GB')
  const [prices, setPrices] = useState<PriceWithShop[]>([])
  const [loading, setLoading] = useState(true)

  // Sidebar state
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [selectedShopId, setSelectedShopId] = useState<string | null>(null)
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc')
  const [filterInStock, setFilterInStock] = useState(false)
  const [filterAuthorised, setFilterAuthorised] = useState(false)

  useEffect(() => {
    supabase
      .from('iphone_models')
      .select('*')
      .order('model_name')
      .then(({ data }) => {
        if (data && data.length > 0) {
          setModels(data)
          const pro = data.find((m: IphoneModel) => m.model_name === 'iPhone 17 Pro') ?? data[0]
          setSelectedModel(pro)
        }
        setLoading(false)
      })
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

  // Apply sidebar filters and sort
  let displayed = [...prices]
  if (selectedShopId) displayed = displayed.filter(p => p.shop_id === selectedShopId)
  if (filterInStock) displayed = displayed.filter(p => p.in_stock)
  if (filterAuthorised) displayed = displayed.filter(p => p.shops?.is_authorised_reseller)
  if (sortOrder === 'desc') displayed = displayed.sort((a, b) => b.price_kwd - a.price_kwd)

  const inStock = displayed.filter(p => p.in_stock)
  const outOfStock = displayed.filter(p => !p.in_stock)

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex">

      <Sidebar
        mobileOpen={mobileMenuOpen}
        onMobileClose={() => setMobileMenuOpen(false)}
        selectedShopId={selectedShopId}
        onSelectShop={setSelectedShopId}
        sortOrder={sortOrder}
        onSortChange={setSortOrder}
        filterInStock={filterInStock}
        onFilterInStock={setFilterInStock}
        filterAuthorised={filterAuthorised}
        onFilterAuthorised={setFilterAuthorised}
      />

      <div className="flex-1 min-w-0">
        <Header onMenuClick={() => setMobileMenuOpen(true)} />

        <main className="max-w-2xl mx-auto px-4 pb-16 pt-4">
          <ModelSelector
            models={models}
            selected={selectedModel}
            onSelect={(m) => {
              setSelectedModel(m)
              if (!m.storage_options.includes(selectedStorage)) {
                setSelectedStorage(m.storage_options[0] ?? '256 GB')
              }
            }}
          />

          {selectedModel && (
            <StorageSelector
              options={selectedModel.storage_options}
              selected={selectedStorage}
              onSelect={setSelectedStorage}
            />
          )}

          {/* Active filter chips */}
          {(selectedShopId || filterInStock || filterAuthorised || sortOrder === 'desc') && (
            <div className="mt-3 flex flex-wrap gap-2">
              {selectedShopId && (
                <button
                  onClick={() => setSelectedShopId(null)}
                  className="flex items-center gap-1 text-xs bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 px-2.5 py-1 rounded-full"
                >
                  {prices.find(p => p.shop_id === selectedShopId)?.shops?.name ?? 'Shop'}
                  <span>×</span>
                </button>
              )}
              {filterInStock && (
                <button
                  onClick={() => setFilterInStock(false)}
                  className="flex items-center gap-1 text-xs bg-emerald-100 dark:bg-emerald-900 text-emerald-700 dark:text-emerald-300 px-2.5 py-1 rounded-full"
                >
                  In stock only <span>×</span>
                </button>
              )}
              {filterAuthorised && (
                <button
                  onClick={() => setFilterAuthorised(false)}
                  className="flex items-center gap-1 text-xs bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300 px-2.5 py-1 rounded-full"
                >
                  Authorised only <span>×</span>
                </button>
              )}
              {sortOrder === 'desc' && (
                <button
                  onClick={() => setSortOrder('asc')}
                  className="flex items-center gap-1 text-xs bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-2.5 py-1 rounded-full"
                >
                  Price: High → Low <span>×</span>
                </button>
              )}
            </div>
          )}

          <div className="mt-4 space-y-3">
            {loading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-32 rounded-2xl bg-gray-200 dark:bg-gray-800 animate-pulse" />
              ))
            ) : displayed.length === 0 ? (
              <div className="text-center py-12 text-gray-400">
                <p className="text-lg">No shops match your filters</p>
                <button
                  onClick={() => { setSelectedShopId(null); setFilterInStock(false); setFilterAuthorised(false) }}
                  className="mt-2 text-sm text-blue-600 hover:underline"
                >
                  Clear filters
                </button>
              </div>
            ) : (
              <>
                {inStock.map(p => (
                  <ShopCard key={p.id} price={p} shop={p.shops} modelId={selectedModel?.id ?? ''} storage={selectedStorage} />
                ))}
                {!filterInStock && outOfStock.map(p => (
                  <ShopCard key={p.id} price={p} shop={p.shops} modelId={selectedModel?.id ?? ''} storage={selectedStorage} dimmed />
                ))}
              </>
            )}
          </div>
        </main>
      </div>

      <ChooseAssistant />
    </div>
  )
}
