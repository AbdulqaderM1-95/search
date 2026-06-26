'use client'

import { useEffect, useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { IphoneModel, Price, Shop } from '@/lib/types'
import ModelSelector from '@/components/ModelSelector'
import StorageSelector from '@/components/StorageSelector'
import ShopCard from '@/components/ShopCard'
import AIRecommendation from '@/components/AIRecommendation'
import Header from '@/components/Header'

type PriceWithShop = Price & { shops: Shop }

export default function HomePage() {
  const supabase = createClient()

  const [models, setModels] = useState<IphoneModel[]>([])
  const [selectedModel, setSelectedModel] = useState<IphoneModel | null>(null)
  const [selectedStorage, setSelectedStorage] = useState('256 GB')
  const [prices, setPrices] = useState<PriceWithShop[]>([])
  const [loading, setLoading] = useState(true)
  const [liveStatus, setLiveStatus] = useState<'connected' | 'disconnected'>('connected')
  const [toast, setToast] = useState<string | null>(null)
  const [aiDismissed, setAiDismissed] = useState(false)

  // Load models on mount
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
      })
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // Load prices when model/storage changes
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

  // Supabase Realtime subscription
  useEffect(() => {
    if (!selectedModel) return

    const channel = supabase
      .channel('prices-live')
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'prices' },
        (payload) => {
          const updated = payload.new as Price
          if (
            updated.model_id === selectedModel.id &&
            updated.storage_option === selectedStorage
          ) {
            setPrices((prev) =>
              prev.map((p) =>
                p.id === updated.id ? { ...p, ...updated } : p
              )
            )
            setToast('Price just updated')
            setTimeout(() => setToast(null), 3000)
          }
        }
      )
      .subscribe((status) => {
        setLiveStatus(status === 'SUBSCRIBED' ? 'connected' : 'disconnected')
      })

    return () => { supabase.removeChannel(channel) }
  }, [selectedModel, selectedStorage]) // eslint-disable-line react-hooks/exhaustive-deps

  const inStock = prices.filter((p) => p.in_stock)
  const outOfStock = prices.filter((p) => !p.in_stock)

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <Header />

      <main className="max-w-2xl mx-auto px-4 pb-16 pt-4">
        {/* Live indicator */}
        {liveStatus === 'disconnected' && (
          <div className="mb-3 flex items-center gap-2 rounded-lg bg-amber-50 border border-amber-200 px-3 py-2 text-sm text-amber-800">
            <span className="h-2 w-2 rounded-full bg-amber-400" />
            Live prices unavailable — showing last known prices
          </div>
        )}

        {/* Model selector */}
        <ModelSelector
          models={models}
          selected={selectedModel}
          onSelect={(m) => {
            setSelectedModel(m)
            setAiDismissed(false)
            if (!m.storage_options.includes(selectedStorage)) {
              setSelectedStorage(m.storage_options[0] ?? '256 GB')
            }
          }}
        />

        {/* Storage selector */}
        {selectedModel && (
          <StorageSelector
            options={selectedModel.storage_options}
            selected={selectedStorage}
            onSelect={(s) => { setSelectedStorage(s); setAiDismissed(false) }}
          />
        )}

        {/* Shop cards */}
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

        {/* AI Recommendation */}
        {!loading && !aiDismissed && selectedModel && prices.length > 0 && (
          <div className="mt-6">
            <AIRecommendation
              model={selectedModel}
              storage={selectedStorage}
              onDismiss={() => setAiDismissed(true)}
            />
          </div>
        )}
      </main>

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 rounded-full bg-gray-900 text-white text-sm px-4 py-2 shadow-lg z-50 animate-bounce">
          {toast}
        </div>
      )}
    </div>
  )
}
