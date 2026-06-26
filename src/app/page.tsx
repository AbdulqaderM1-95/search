'use client'

import { useEffect, useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { IphoneModel, Price, Shop } from '@/lib/types'
import ModelSelector from '@/components/ModelSelector'
import StorageSelector from '@/components/StorageSelector'
import ShopCard from '@/components/ShopCard'
import Header from '@/components/Header'

type PriceWithShop = Price & { shops: Shop }

export default function HomePage() {
  const supabase = createClient()

  const [models, setModels] = useState<IphoneModel[]>([])
  const [selectedModel, setSelectedModel] = useState<IphoneModel | null>(null)
  const [selectedStorage, setSelectedStorage] = useState('256 GB')
  const [prices, setPrices] = useState<PriceWithShop[]>([])
  const [loading, setLoading] = useState(true)
  const [toast, setToast] = useState<string | null>(null)

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

  useEffect(() => {
    loadPrices()
  }, [loadPrices])

  const inStock = prices.filter((p) => p.in_stock)
  const outOfStock = prices.filter((p) => !p.in_stock)

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <Header />

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
            onSelect={(s) => setSelectedStorage(s)}
          />
        )}

        <div className="mt-4 space-y-3">
          {loading ? (
            Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-32 rounded-2xl bg-gray-200 dark:bg-gray-800 animate-pulse" />
            ))
          ) : (
            <>
              {inStock.map((p) => (
                <ShopCard
                  key={p.id}
                  price={p}
                  shop={p.shops}
                  modelId={selectedModel?.id ?? ''}
                  storage={selectedStorage}
                />
              ))}
              {outOfStock.map((p) => (
                <ShopCard
                  key={p.id}
                  price={p}
                  shop={p.shops}
                  modelId={selectedModel?.id ?? ''}
                  storage={selectedStorage}
                  dimmed
                />
              ))}
            </>
          )}
        </div>
      </main>

      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 rounded-full bg-gray-900 text-white text-sm px-4 py-2 shadow-lg z-50 animate-bounce">
          {toast}
        </div>
      )}
    </div>
  )
}
