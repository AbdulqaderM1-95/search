'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Header from '@/components/Header'
import type { SavedAlert } from '@/lib/types'

type AlertWithDetails = Omit<SavedAlert, 'current_price'> & {
  shops: { name: string; reach_url: string | null }
  iphone_models: { model_name: string }
  current_price: number | null
}

export default function WatchlistPage() {
  const router = useRouter()
  const supabase = createClient()
  const [alerts, setAlerts] = useState<AlertWithDetails[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) { router.push('/auth/login'); return }
      loadAlerts(data.user.id)
    })
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const loadAlerts = async (userId: string) => {
    const { data } = await supabase
      .from('saved_alerts')
      .select('*, shops(name, reach_url), iphone_models(model_name)')
      .eq('user_id', userId)
      .order('saved_at', { ascending: false })

    if (!data) { setLoading(false); return }

    const enriched = await Promise.all(
      (data as AlertWithDetails[]).map(async (alert) => {
        const { data: priceRow } = await supabase
          .from('prices')
          .select('price_kwd')
          .eq('shop_id', alert.shop_id)
          .eq('model_id', alert.model_id)
          .eq('storage_option', alert.storage_option)
          .maybeSingle()
        return { ...alert, current_price: priceRow ? Number(priceRow.price_kwd) : null }
      })
    )

    setAlerts(enriched)
    setLoading(false)
  }

  const removeAlert = async (id: string) => {
    await supabase.from('saved_alerts').delete().eq('id', id)
    setAlerts((prev) => prev.filter((a) => a.id !== id))
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <Header />
      <main className="max-w-2xl mx-auto px-4 py-6">
        <h1 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Price alerts</h1>

        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-24 rounded-2xl bg-gray-200 dark:bg-gray-800 animate-pulse" />
            ))}
          </div>
        ) : alerts.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <p className="text-4xl mb-3">🔔</p>
            <p className="font-medium text-gray-600 dark:text-gray-400">No alerts yet</p>
            <p className="text-sm mt-1">Tap the bell on any shop card to track a price.</p>
            <Link href="/" className="mt-4 inline-block text-sm text-blue-600 hover:underline">Browse prices</Link>
          </div>
        ) : (
          <div className="space-y-3">
            {alerts.map((alert) => {
              const dropped = alert.current_price !== null && alert.current_price < alert.price_at_save
              return (
                <div
                  key={alert.id}
                  className={`rounded-2xl border bg-white dark:bg-gray-900 p-4 ${
                    dropped ? 'border-emerald-300 dark:border-emerald-700' : 'border-gray-100 dark:border-gray-800'
                  }`}
                >
                  {dropped && (
                    <div className="mb-2 text-xs font-medium text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                      <span>▼</span> Price dropped!
                    </div>
                  )}
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-semibold text-gray-900 dark:text-white">{alert.shops?.name}</p>
                      <p className="text-xs text-gray-500 mt-0.5">
                        {alert.iphone_models?.model_name} · {alert.storage_option}
                      </p>
                      <div className="mt-2 flex items-center gap-3 text-sm">
                        <span className="text-gray-500">Saved at <strong>{Number(alert.price_at_save).toFixed(3)} KWD</strong></span>
                        {alert.current_price !== null && (
                          <span className={dropped ? 'text-emerald-600 font-semibold' : 'text-gray-700 dark:text-gray-300'}>
                            Now {alert.current_price.toFixed(3)} KWD
                          </span>
                        )}
                      </div>
                    </div>
                    <button
                      onClick={() => removeAlert(alert.id)}
                      className="p-1.5 text-gray-400 hover:text-red-500 transition-colors"
                      title="Remove alert"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </main>
    </div>
  )
}
