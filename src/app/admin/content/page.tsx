'use client'

import React, { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Price, Shop, IphoneModel } from '@/lib/types'

type PriceRow = Price & { shops: Shop; iphone_models: IphoneModel }

// Inline number cell — looks like text, edits on click, saves on blur/Enter
function NumCell({
  value, required = false, onSave,
}: { value: number | null; required?: boolean; onSave: (v: number | null) => void }) {
  const [draft, setDraft] = useState(value != null ? String(value) : '')

  const commit = () => {
    if (draft.trim() === '') {
      if (required) { setDraft(value != null ? String(value) : ''); return }
      onSave(null); return
    }
    const n = parseFloat(draft)
    if (isNaN(n) || n < 0) { setDraft(value != null ? String(value) : ''); return }
    onSave(n)
  }

  return (
    <input
      type="number"
      value={draft}
      step="0.001"
      min="0"
      placeholder="—"
      onChange={e => setDraft(e.target.value)}
      onBlur={commit}
      onKeyDown={e => e.key === 'Enter' && e.currentTarget.blur()}
      className="w-24 bg-transparent hover:bg-gray-100 dark:hover:bg-gray-700 focus:bg-white dark:focus:bg-gray-800 focus:ring-1 focus:ring-blue-400 rounded px-1.5 py-0.5 outline-none text-sm cursor-pointer focus:cursor-text transition-colors"
    />
  )
}

// Inline datetime cell
function DateCell({ value, onSave }: { value: string | null; onSave: (v: string | null) => void }) {
  const [draft, setDraft] = useState(value ? new Date(value).toISOString().slice(0, 16) : '')

  const commit = () => onSave(draft ? new Date(draft).toISOString() : null)

  return (
    <input
      type="datetime-local"
      value={draft}
      onChange={e => setDraft(e.target.value)}
      onBlur={commit}
      onKeyDown={e => e.key === 'Enter' && e.currentTarget.blur()}
      className="w-40 bg-transparent hover:bg-gray-100 dark:hover:bg-gray-700 focus:bg-white dark:focus:bg-gray-800 focus:ring-1 focus:ring-blue-400 rounded px-1.5 py-0.5 outline-none text-xs cursor-pointer focus:cursor-text transition-colors"
    />
  )
}

export default function AdminContentPage() {
  const supabase = createClient()
  const [prices, setPrices] = useState<PriceRow[]>([])
  const [loading, setLoading] = useState(true)
  const [savingId, setSavingId] = useState<string | null>(null)

  useEffect(() => { load() }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const load = async () => {
    const { data } = await supabase
      .from('prices')
      .select('*, shops(*), iphone_models(*)')
    const sorted = ((data as PriceRow[]) ?? []).sort((a, b) => {
      const shopA = a.shops?.name ?? ''
      const shopB = b.shops?.name ?? ''
      if (shopA !== shopB) return shopA.localeCompare(shopB)
      const modelA = a.iphone_models?.model_name ?? ''
      const modelB = b.iphone_models?.model_name ?? ''
      if (modelA !== modelB) return modelA.localeCompare(modelB)
      return (a.storage_option ?? '').localeCompare(b.storage_option ?? '')
    })
    setPrices(sorted)
    setLoading(false)
  }

  const saveField = async (id: string, fields: Partial<Price>) => {
    setSavingId(id)
    const { data: { user: admin } } = await supabase.auth.getUser()
    await supabase
      .from('prices')
      .update({ ...fields, updated_at: new Date().toISOString() })
      .eq('id', id)
    if (admin && 'price_kwd' in fields) {
      await supabase.from('audit_log').insert({
        admin_id: admin.id,
        action: 'update_price',
        target_table: 'prices',
        target_id: id,
      })
    }
    setPrices(prev => prev.map(p => p.id === id ? { ...p, ...fields } : p))
    setSavingId(null)
  }

  const addPrice = async () => {
    const { data: models } = await supabase.from('iphone_models').select('id').limit(1)
    const { data: shops } = await supabase.from('shops').select('id').limit(1)
    if (!models?.[0] || !shops?.[0]) return
    await supabase.from('prices').insert({
      shop_id: shops[0].id,
      model_id: models[0].id,
      storage_option: '256 GB',
      price_kwd: 0,
      in_stock: false,
    })
    load()
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-bold text-gray-900 dark:text-white">Prices & shops</h1>
        <button
          onClick={addPrice}
          className="text-sm bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl transition-colors"
        >
          + Add price row
        </button>
      </div>

      {loading ? (
        <div className="space-y-2">
          {[1, 2, 3, 4].map(i => <div key={i} className="h-12 rounded-xl bg-gray-200 dark:bg-gray-800 animate-pulse" />)}
        </div>
      ) : (
        <div className="rounded-2xl border border-gray-100 dark:border-gray-800 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 dark:bg-gray-900 text-gray-500 text-xs uppercase tracking-wide">
              <tr>
                <th className="px-4 py-3 text-left">Model</th>
                <th className="px-4 py-3 text-left">Storage</th>
                <th className="px-4 py-3 text-left">Price (KWD)</th>
                <th className="px-4 py-3 text-left">Orig. Price</th>
                <th className="px-4 py-3 text-left">Discount ends</th>
                <th className="px-4 py-3 text-left">In stock</th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-900">
              {prices.map((p, i) => {
                const isNewShop = i === 0 || prices[i - 1].shops?.name !== p.shops?.name
                return (
                  <React.Fragment key={p.id}>
                    {isNewShop && (
                      <tr>
                        <td colSpan={6} className="px-4 py-2.5 bg-gray-50 dark:bg-gray-800 text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-widest border-t-2 border-b border-gray-200 dark:border-gray-700">
                          {p.shops?.name}
                          {savingId === p.id && <span className="ml-2 text-blue-400 font-normal normal-case tracking-normal">saving…</span>}
                        </td>
                      </tr>
                    )}
                    <tr className={`border-t border-gray-100 dark:border-gray-800 ${savingId === p.id ? 'opacity-60' : ''}`}>
                      <td className="px-4 py-2.5 text-gray-700 dark:text-gray-300">{p.iphone_models?.model_name}</td>
                      <td className="px-4 py-2.5 text-gray-500">{p.storage_option}</td>
                      <td className="px-4 py-2.5">
                        <NumCell
                          key={`price-${p.id}-${p.price_kwd}`}
                          value={Number(p.price_kwd)}
                          required
                          onSave={v => v != null && v > 0 && saveField(p.id, { price_kwd: v })}
                        />
                      </td>
                      <td className="px-4 py-2.5">
                        <NumCell
                          key={`orig-${p.id}-${p.original_price}`}
                          value={p.original_price != null ? Number(p.original_price) : null}
                          onSave={v => saveField(p.id, { original_price: v })}
                        />
                      </td>
                      <td className="px-4 py-2.5">
                        <DateCell
                          key={`date-${p.id}-${p.discount_ends_at}`}
                          value={p.discount_ends_at}
                          onSave={v => saveField(p.id, { discount_ends_at: v })}
                        />
                      </td>
                      <td className="px-4 py-2.5">
                        <input
                          type="checkbox"
                          checked={p.in_stock}
                          onChange={e => saveField(p.id, { in_stock: e.target.checked })}
                          className="w-4 h-4 rounded accent-blue-600 cursor-pointer"
                        />
                      </td>
                    </tr>
                  </React.Fragment>
                )
              })}
              {prices.length === 0 && (
                <tr><td colSpan={6} className="px-4 py-8 text-center text-gray-400">No price entries yet. Add your first one.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
