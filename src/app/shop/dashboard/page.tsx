'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Price, Shop, IphoneModel } from '@/lib/types'

type PriceRow = Price & { shops: Shop; iphone_models: IphoneModel }

export default function ShopDashboardPage() {
  const supabase = createClient()
  const [shop, setShop] = useState<Shop | null>(null)
  const [prices, setPrices] = useState<PriceRow[]>([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState<string | null>(null)
  const [editPrice, setEditPrice] = useState('')
  const [editStock, setEditStock] = useState(true)
  const [editOriginal, setEditOriginal] = useState('')
  const [editDiscountEnds, setEditDiscountEnds] = useState('')
  const [saving, setSaving] = useState(false)
  const [toast, setToast] = useState<string | null>(null)

  useEffect(() => { load() }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const showToast = (msg: string) => {
    setToast(msg)
    setTimeout(() => setToast(null), 3000)
  }

  const load = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    // Load this user's shop assignment
    const { data: sp } = await supabase
      .from('shop_profiles')
      .select('shop_id, shops(*)')
      .eq('user_id', user.id)
      .single()

    if (!sp) { setLoading(false); return }

    setShop(sp.shops as unknown as Shop)

    const { data } = await supabase
      .from('prices')
      .select('*, shops(*), iphone_models(*)')
      .eq('shop_id', sp.shop_id)
      .order('iphone_models(model_name)', { ascending: true })

    setPrices((data as PriceRow[]) ?? [])
    setLoading(false)
  }

  const startEdit = (p: PriceRow) => {
    setEditing(p.id)
    setEditPrice(String(p.price_kwd))
    setEditStock(p.in_stock)
    setEditOriginal(p.original_price != null ? String(p.original_price) : '')
    setEditDiscountEnds(
      p.discount_ends_at ? new Date(p.discount_ends_at).toISOString().slice(0, 16) : ''
    )
  }

  const saveEdit = async (id: string) => {
    const price = parseFloat(editPrice)
    if (isNaN(price) || price <= 0) { showToast('Enter a valid price'); return }
    const originalPrice = editOriginal ? parseFloat(editOriginal) : null
    if (originalPrice !== null && (isNaN(originalPrice) || originalPrice <= price)) {
      showToast('Original price must be greater than the current price')
      return
    }
    setSaving(true)
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
    if (error) { showToast('Failed to save — ' + error.message); return }
    setPrices((prev) =>
      prev.map((p) =>
        p.id === id
          ? {
              ...p,
              price_kwd: price,
              in_stock: editStock,
              original_price: originalPrice,
              discount_ends_at: editDiscountEnds ? new Date(editDiscountEnds).toISOString() : null,
            }
          : p
      )
    )
    setEditing(null)
    showToast('Price updated')
  }

  const clearDiscount = async (id: string) => {
    await supabase
      .from('prices')
      .update({ original_price: null, discount_ends_at: null })
      .eq('id', id)
    setPrices((prev) =>
      prev.map((p) => p.id === id ? { ...p, original_price: null, discount_ends_at: null } : p)
    )
    showToast('Discount removed')
  }

  if (loading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => <div key={i} className="h-16 rounded-xl bg-gray-200 dark:bg-gray-800 animate-pulse" />)}
      </div>
    )
  }

  if (!shop) {
    return (
      <div className="text-center py-16 text-gray-500">
        <p className="text-lg font-medium">No shop assigned</p>
        <p className="text-sm mt-2">Ask an admin to assign you to a shop.</p>
      </div>
    )
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{shop.name}</h1>
        <p className="text-sm text-gray-500 mt-1">
          Manage your prices below. Changes go live immediately.
        </p>
      </div>

      <div className="rounded-2xl border border-gray-100 dark:border-gray-800 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 dark:bg-gray-900 text-gray-500 text-xs uppercase tracking-wide">
            <tr>
              <th className="px-4 py-3 text-left">Model</th>
              <th className="px-4 py-3 text-left">Storage</th>
              <th className="px-4 py-3 text-left">Price (KWD)</th>
              <th className="px-4 py-3 text-left">Original price</th>
              <th className="px-4 py-3 text-left">Discount ends</th>
              <th className="px-4 py-3 text-left">In stock</th>
              <th className="px-4 py-3 text-left"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-gray-800 bg-white dark:bg-gray-900">
            {prices.map((p) => {
              const hasDiscount = p.original_price != null && p.original_price > p.price_kwd
              const discountPct = hasDiscount
                ? Math.round((1 - p.price_kwd / p.original_price!) * 100)
                : 0
              return (
                <tr key={p.id}>
                  <td className="px-4 py-3 font-medium text-gray-900 dark:text-white">
                    {p.iphone_models?.model_name}
                  </td>
                  <td className="px-4 py-3 text-gray-500">{p.storage_option}</td>

                  {/* Price */}
                  <td className="px-4 py-3">
                    {editing === p.id ? (
                      <input
                        type="number"
                        value={editPrice}
                        onChange={(e) => setEditPrice(e.target.value)}
                        step="0.001"
                        min="0"
                        className="w-24 px-2 py-1 rounded border border-blue-400 text-sm focus:outline-none"
                        autoFocus
                      />
                    ) : (
                      <span className={`font-semibold ${hasDiscount ? 'text-red-600' : ''}`}>
                        {Number(p.price_kwd).toFixed(3)}
                      </span>
                    )}
                  </td>

                  {/* Original price */}
                  <td className="px-4 py-3">
                    {editing === p.id ? (
                      <input
                        type="number"
                        value={editOriginal}
                        onChange={(e) => setEditOriginal(e.target.value)}
                        placeholder="Leave blank to remove"
                        step="0.001"
                        min="0"
                        className="w-32 px-2 py-1 rounded border border-gray-300 text-sm focus:outline-none focus:border-blue-400"
                      />
                    ) : (
                      <span className="text-gray-500 text-sm">
                        {hasDiscount ? (
                          <span>
                            <span className="line-through">{Number(p.original_price).toFixed(3)}</span>
                            <span className="ml-1.5 text-xs font-bold text-red-600 bg-red-50 dark:bg-red-900/20 px-1.5 py-0.5 rounded">
                              -{discountPct}%
                            </span>
                          </span>
                        ) : '—'}
                      </span>
                    )}
                  </td>

                  {/* Discount ends */}
                  <td className="px-4 py-3">
                    {editing === p.id ? (
                      <input
                        type="datetime-local"
                        value={editDiscountEnds}
                        onChange={(e) => setEditDiscountEnds(e.target.value)}
                        className="px-2 py-1 rounded border border-gray-300 text-xs focus:outline-none focus:border-blue-400"
                      />
                    ) : (
                      <span className="text-xs text-gray-500">
                        {p.discount_ends_at ? new Date(p.discount_ends_at).toLocaleDateString() : '—'}
                      </span>
                    )}
                  </td>

                  {/* In stock */}
                  <td className="px-4 py-3">
                    {editing === p.id ? (
                      <input
                        type="checkbox"
                        checked={editStock}
                        onChange={(e) => setEditStock(e.target.checked)}
                        className="rounded"
                      />
                    ) : (
                      <span className={p.in_stock ? 'text-emerald-600 text-xs font-medium' : 'text-gray-400 text-xs'}>
                        {p.in_stock ? 'Yes' : 'No'}
                      </span>
                    )}
                  </td>

                  {/* Actions */}
                  <td className="px-4 py-3">
                    {editing === p.id ? (
                      <div className="flex gap-2">
                        <button
                          onClick={() => saveEdit(p.id)}
                          disabled={saving}
                          className="text-xs text-emerald-600 font-medium hover:underline disabled:opacity-40"
                        >
                          {saving ? 'Saving…' : 'Save'}
                        </button>
                        <button onClick={() => setEditing(null)} className="text-xs text-gray-400 hover:underline">
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <div className="flex gap-2">
                        <button onClick={() => startEdit(p)} className="text-xs text-blue-600 hover:underline">
                          Edit
                        </button>
                        {hasDiscount && (
                          <button onClick={() => clearDiscount(p.id)} className="text-xs text-red-500 hover:underline">
                            Clear discount
                          </button>
                        )}
                      </div>
                    )}
                  </td>
                </tr>
              )
            })}
            {prices.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-gray-400">
                  No prices found for your shop.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 rounded-full bg-gray-900 text-white text-sm px-4 py-2 shadow-lg z-50">
          {toast}
        </div>
      )}
    </div>
  )
}
