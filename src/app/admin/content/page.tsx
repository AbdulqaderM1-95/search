'use client'

import { useEffect, useState } from 'react'
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

  useEffect(() => { load() }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const load = async () => {
    const { data } = await supabase
      .from('prices')
      .select('*, shops(*), iphone_models(*)')
      .order('updated_at', { ascending: false })
    setPrices((data as PriceRow[]) ?? [])
    setLoading(false)
  }

  const startEdit = (p: PriceRow) => {
    setEditing(p.id)
    setEditVal(String(p.price_kwd))
    setEditStock(p.in_stock)
  }

  const saveEdit = async (id: string) => {
    const price = parseFloat(editVal)
    if (isNaN(price) || price <= 0) return
    const { data: { user: admin } } = await supabase.auth.getUser()
    await supabase
      .from('prices')
      .update({ price_kwd: price, in_stock: editStock, updated_at: new Date().toISOString() })
      .eq('id', id)
    if (admin) {
      await supabase.from('audit_log').insert({
        admin_id: admin.id,
        action: 'update_price',
        target_table: 'prices',
        target_id: id,
      })
    }
    setPrices((prev) =>
      prev.map((p) => p.id === id ? { ...p, price_kwd: price, in_stock: editStock } : p)
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
                <th className="px-4 py-3 text-left">Shop</th>
                <th className="px-4 py-3 text-left">Model</th>
                <th className="px-4 py-3 text-left">Storage</th>
                <th className="px-4 py-3 text-left">Price (KWD)</th>
                <th className="px-4 py-3 text-left">In stock</th>
                <th className="px-4 py-3 text-left">Updated</th>
                <th className="px-4 py-3 text-left"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800 bg-white dark:bg-gray-900">
              {prices.map((p) => (
                <tr key={p.id}>
                  <td className="px-4 py-3 font-medium text-gray-900 dark:text-white">{p.shops?.name}</td>
                  <td className="px-4 py-3 text-gray-500 text-xs">{p.iphone_models?.model_name}</td>
                  <td className="px-4 py-3 text-gray-500">{p.storage_option}</td>
                  <td className="px-4 py-3">
                    {editing === p.id ? (
                      <input
                        type="number"
                        value={editVal}
                        onChange={(e) => setEditVal(e.target.value)}
                        step="0.001"
                        min="0"
                        className="w-24 px-2 py-1 rounded border border-blue-400 text-sm focus:outline-none"
                      />
                    ) : (
                      <span className="font-semibold">{Number(p.price_kwd).toFixed(3)}</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    {editing === p.id ? (
                      <input
                        type="checkbox"
                        checked={editStock}
                        onChange={(e) => setEditStock(e.target.checked)}
                        className="rounded"
                      />
                    ) : (
                      <span className={p.in_stock ? 'text-emerald-600' : 'text-gray-400'}>
                        {p.in_stock ? 'Yes' : 'No'}
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-400">{new Date(p.updated_at).toLocaleString()}</td>
                  <td className="px-4 py-3">
                    {editing === p.id ? (
                      <div className="flex gap-2">
                        <button onClick={() => saveEdit(p.id)} className="text-xs text-emerald-600 font-medium hover:underline">Save</button>
                        <button onClick={() => setEditing(null)} className="text-xs text-gray-400 hover:underline">Cancel</button>
                      </div>
                    ) : (
                      <button onClick={() => startEdit(p)} className="text-xs text-blue-600 hover:underline">Edit</button>
                    )}
                  </td>
                </tr>
              ))}
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
