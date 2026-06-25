'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { PriceHistory, Shop } from '@/lib/types'
import PriceHistoryChart from './PriceHistoryChart'

type Props = {
  shop: Shop
  modelId: string
  storage: string
  currentPrice: number
  onClose: () => void
}

export default function ShopDetailSheet({ shop, modelId, storage, currentPrice, onClose }: Props) {
  const supabase = createClient()
  const [history, setHistory] = useState<PriceHistory[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const cutoff = new Date()
    cutoff.setDate(cutoff.getDate() - 30)

    supabase
      .from('price_history')
      .select('*')
      .eq('shop_id', shop.id)
      .eq('model_id', modelId)
      .eq('storage_option', storage)
      .gte('recorded_at', cutoff.toISOString())
      .order('recorded_at', { ascending: true })
      .then(({ data }) => {
        setHistory((data as PriceHistory[]) ?? [])
        setLoading(false)
      })
  }, [shop.id, modelId, storage]) // eslint-disable-line react-hooks/exhaustive-deps

  // Close on backdrop click
  const onBackdrop = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) onClose()
  }

  return (
    <div
      className="fixed inset-0 bg-black/40 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
      onClick={onBackdrop}
    >
      <div className="bg-white dark:bg-gray-900 rounded-t-3xl sm:rounded-2xl w-full sm:max-w-lg p-6 shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="font-semibold text-gray-900 dark:text-white">{shop.name}</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">{storage} · 30-day price history</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="mb-4 flex items-baseline gap-2">
          <span className="text-3xl font-bold text-gray-900 dark:text-white">
            {Number(currentPrice).toFixed(3)}
          </span>
          <span className="text-sm text-gray-500">KWD current</span>
        </div>

        {loading ? (
          <div className="h-48 rounded-xl bg-gray-100 dark:bg-gray-800 animate-pulse" />
        ) : (
          <PriceHistoryChart history={history} />
        )}
      </div>
    </div>
  )
}
