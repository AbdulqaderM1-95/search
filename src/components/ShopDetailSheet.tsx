'use client'

import { useEffect, useState, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { PriceHistory, Shop } from '@/lib/types'
import PriceHistoryChart from './PriceHistoryChart'

const MODELS = ['iPhone 17', 'iPhone 17 Pro', 'iPhone 17 Pro Max']

type Props = {
  shop: Shop
  modelId: string
  modelName: string
  storage: string
  currentPrice: number
  onClose: () => void
}

export default function ShopDetailSheet({ shop, modelId, modelName, storage, currentPrice, onClose }: Props) {
  const supabase = createClient()
  const [history, setHistory] = useState<PriceHistory[]>([])
  const [loading, setLoading] = useState(true)

  // Compare state
  const [compareModel, setCompareModel] = useState('')
  const [comparing, setComparing] = useState(false)
  const [compareResult, setCompareResult] = useState('')
  const [compareError, setCompareError] = useState<string | null>(null)
  const abortRef = useRef<AbortController | null>(null)

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

  // Cleanup stream on unmount
  useEffect(() => () => { abortRef.current?.abort() }, [])

  const otherModels = MODELS.filter(m => m !== modelName)

  const runCompare = async (model2: string) => {
    setCompareModel(model2)
    setComparing(true)
    setCompareResult('')
    setCompareError(null)
    abortRef.current?.abort()
    abortRef.current = new AbortController()

    try {
      const res = await fetch('/api/ai-compare', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ model1: modelName, model2, storage }),
        signal: abortRef.current.signal,
      })

      if (!res.ok || !res.body) {
        const data = await res.json().catch(() => ({}))
        setCompareError(data.error ?? 'Something went wrong. Please try again.')
        setComparing(false)
        return
      }

      const reader = res.body.getReader()
      const decoder = new TextDecoder()
      setComparing(false)

      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        const chunk = decoder.decode(value, { stream: true })
        for (const line of chunk.split('\n')) {
          if (!line.startsWith('data: ')) continue
          const data = line.slice(6).trim()
          if (data === '[DONE]') break
          try {
            const json = JSON.parse(data)
            const delta = json.choices?.[0]?.delta?.content
            if (delta) setCompareResult(prev => prev + delta)
          } catch {}
        }
      }
    } catch (e: unknown) {
      if (e instanceof Error && e.name === 'AbortError') return
      setCompareError('Connection error. Please try again.')
      setComparing(false)
    }
  }

  const resetCompare = () => {
    abortRef.current?.abort()
    setCompareModel('')
    setCompareResult('')
    setCompareError(null)
    setComparing(false)
  }

  const onBackdrop = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) onClose()
  }

  return (
    <div
      className="fixed inset-0 bg-black/40 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
      onClick={onBackdrop}
    >
      <div className="bg-white dark:bg-gray-900 rounded-t-3xl sm:rounded-2xl w-full sm:max-w-lg shadow-xl max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* Header */}
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

          {/* Current price */}
          <div className="mb-4 flex items-baseline gap-2">
            <span className="text-3xl font-bold text-gray-900 dark:text-white">
              {Number(currentPrice).toFixed(3)}
            </span>
            <span className="text-sm text-gray-500">KWD current</span>
          </div>

          {/* Chart */}
          {loading ? (
            <div className="h-48 rounded-xl bg-gray-100 dark:bg-gray-800 animate-pulse" />
          ) : (
            <PriceHistoryChart history={history} />
          )}

          {/* Divider */}
          <div className="border-t border-gray-100 dark:border-gray-800 my-5" />

          {/* AI Compare section */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <svg className="w-4 h-4 text-blue-600 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z" />
              </svg>
              <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">
                Compare {modelName} with…
              </p>
            </div>

            {/* Model picker buttons */}
            {!compareModel && (
              <div className="flex flex-col gap-2">
                {otherModels.map(m => (
                  <button
                    key={m}
                    onClick={() => runCompare(m)}
                    className="w-full text-left px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 hover:border-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950 dark:hover:border-blue-600 transition-all text-sm font-medium text-gray-800 dark:text-gray-200 active:scale-[0.98]"
                  >
                    {m}
                  </button>
                ))}
              </div>
            )}

            {/* Loading */}
            {comparing && (
              <div className="flex items-center gap-3 py-3 text-sm text-gray-500">
                <div className="w-4 h-4 rounded-full border-2 border-blue-600 border-t-transparent animate-spin shrink-0" />
                Comparing live Kuwait prices…
              </div>
            )}

            {/* Error */}
            {compareError && (
              <div className="text-sm text-red-600 dark:text-red-400 py-3 px-4 bg-red-50 dark:bg-red-950/30 rounded-xl border border-red-100 dark:border-red-900">
                {compareError}
              </div>
            )}

            {/* Result */}
            {!comparing && compareResult && (
              <div className="rounded-xl bg-blue-50 dark:bg-blue-950/30 border border-blue-100 dark:border-blue-900 p-4">
                <p className="text-xs font-semibold text-blue-600 dark:text-blue-400 mb-2 uppercase tracking-wide">
                  {modelName} vs {compareModel}
                </p>
                <p className="text-sm text-gray-800 dark:text-gray-200 whitespace-pre-wrap leading-7">
                  {compareResult}
                </p>
                <button
                  onClick={resetCompare}
                  className="mt-3 text-xs text-blue-600 dark:text-blue-400 hover:underline"
                >
                  Compare with another model
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
