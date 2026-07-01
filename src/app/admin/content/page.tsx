'use client'

import React, { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Price, Shop, IphoneModel } from '@/lib/types'

type PriceRow = Price & { shops: Shop; iphone_models: IphoneModel }

export default function AdminContentPage() {
  const supabase = createClient()
  const [prices, setPrices] = useState<PriceRow[]>([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState<string | null>(null)
  const [editVal, setEditVal] = useState('')
  const [editStock, setEditStock] = useState(true)
  const [editOriginal, setEditOriginal] = useState('')
  const [editDiscountEnds, setEditDiscountEnds] = useState('')
  const [saveError, setSaveError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

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

  const startEdit = (p: PriceRow) => {
    setEditing(p.id)
    setEditVal(String(p.price_kwd))
    setEditStock(p.in_stock)
    setEditOriginal(p.original_price != null ? String(p.original_price) : '')
    setEditDiscountEnds(
      p.discount_ends_at ? new Date(p.discount_ends_at).toISOString().slice(0, 16) : ''
    )
  }

  const saveEdit = async (id: string) => {
    const price = parseFloat(editVal)
    if (isNaN(price) || price <= 0) return
    const originalPrice = editOriginal ? parseFloat(editOriginal) : null
    if (originalPrice !== null && isNaN(originalPrice)) return
    setSaveError(null)
    setSaving(true)
    const { data: { user: admin } } = await supabase.auth.getUser()
    const { error } = await supabase
      .from('prices')
      .update({
        price_kwd: price,
        in_stock: editStock,
        original_price: originalPrice,
        discount_ends_at: editDiscountEnds ? new Date(editDiscountEnds).toISOString() : null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
    setSaving(false)
    if (error) {
      setSaveError(error.message)
      return
    }
    if (admin) {
      await supabase.from('audit_log').insert({
        admin_id: admin.id,
        action: 'update_price',
        target_table: 'prices',
        target_id: id,
      })
    }
    setPrices((prev) =>
      prev.map((p) => p.id === id
        ? { ...p, price_kwd: price, in_stock: editStock, original_price: originalPrice, discount_ends_at: editDiscountEnds ? new Date(editDiscountEnds).toISOString() : null }
        : p
      )
    )
    setEditing(null)
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
      in_stock: true,
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
          {[1,2,3,4].map((i) => <div key={i} className="h-12 rounded-xl bg-gray-200 dark:bg-gray-800 animate-pulse" />)}
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
                <th className="px-4 py-3 text-left"></th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-900">
              {prices.map((p, i) => {
                const isNewShop = i === 0 || prices[i - 1].shops?.name !== p.shops?.name
                return (
                  <React.Fragment key={p.id}>
                    {isNewShop && (
                      <tr>
                        <td colSpan={7} className="px-4 py-2.5 bg-gray-50 dark:bg-gray-800 text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-widest border-t-2 border-b border-gray-200 dark:border-gray-700">
                          {p.shops?.name}
                        </td>
                      </tr>
                    )}
                    <tr className="border-t border-gray-100 dark:border-gray-800">
                      <td className="px-4 py-3 text-gray-700 dark:text-gray-300">{p.iphone_models?.model_name}</td>
                      <td className="px-4 py-3 text-gray-500">{p.storage_option}</td>
                      <td className="px-4 py-3">
                        {editing === p.id ? (
                          <input type="number" value={editVal} onChange={(e) => setEditVal(e.target.value)} step="0.001" min="0" className="w-24 px-2 py-1 rounded border border-blue-400 text-sm focus:outline-none" />
                        ) : (
                          <span className="font-semibold">{Number(p.price_kwd).toFixed(3)}</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        {editing === p.id ? (
                          <input type="number" value={editOriginal} onChange={(e) => setEditOriginal(e.target.value)} placeholder="—" step="0.001" min="0" className="w-24 px-2 py-1 rounded border border-gray-300 text-sm focus:outline-none focus:border-blue-400" />
                        ) : (
                          <span className="text-gray-500 text-sm">{p.original_price != null ? Number(p.original_price).toFixed(3) : '—'}</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        {editing === p.id ? (
                          <input type="datetime-local" value={editDiscountEnds} onChange={(e) => setEditDiscountEnds(e.target.value)} className="px-2 py-1 rounded border border-gray-300 text-xs focus:outline-none focus:border-blue-400" />
                        ) : (
                          <span className="text-gray-500 text-xs">{p.discount_ends_at ? new Date(p.discount_ends_at).toLocaleDateString() : '—'}</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        {editing === p.id ? (
                          <input type="checkbox" checked={editStock} onChange={(e) => setEditStock(e.target.checked)} className="rounded" />
                        ) : (
                          <span className={p.in_stock ? 'text-emerald-600' : 'text-gray-400'}>{p.in_stock ? 'Yes' : 'No'}</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        {editing === p.id ? (
                          <div className="flex flex-col gap-1">
                            <div className="flex gap-2">
                              <button onClick={() => saveEdit(p.id)} disabled={saving} className="text-xs text-emerald-600 font-medium hover:underline disabled:opacity-40">
                                {saving ? 'Saving…' : 'Save'}
                              </button>
                              <button onClick={() => { setEditing(null); setSaveError(null) }} className="text-xs text-gray-400 hover:underline">Cancel</button>
                            </div>
                            {saveError && <p className="text-xs text-red-600 max-w-[200px]">{saveError}</p>}
                          </div>
                        ) : (
                          <button onClick={() => startEdit(p)} className="text-xs text-blue-600 hover:underline">Edit</button>
                        )}
                      </td>
                    </tr>
                  </React.Fragment>
                )
              })}
              {prices.length === 0 && (
                <tr><td colSpan={7} className="px-4 py-8 text-center text-gray-400">No price entries yet. Add your first one.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
