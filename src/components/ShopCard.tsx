'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/client'
import type { Price, Shop } from '@/lib/types'
import ShopDetailSheet from './ShopDetailSheet'
import { useLang } from '@/lib/lang-context'

type Props = {
  price: Price
  shop: Shop
  modelId: string
  storage: string
  dimmed?: boolean
}

const SHOP_COLORS: Record<string, string> = {
  X: 'bg-blue-600',
  B: 'bg-purple-600',
  E: 'bg-green-600',
  'B ': 'bg-red-600',
}

function ShopLogo({ shop }: { shop: Shop }) {
  const [imgError, setImgError] = useState(false)
  const initial = shop.name[0].toUpperCase()
  const colorClass = SHOP_COLORS[initial] ?? 'bg-gray-600'

  if (shop.logo_url && !imgError) {
    return (
      <Image
        src={shop.logo_url}
        alt={shop.name}
        width={48}
        height={48}
        className="w-12 h-12 rounded-xl object-contain bg-white border border-gray-100 flex-shrink-0"
        onError={() => setImgError(true)}
      />
    )
  }
  return (
    <div className={`w-12 h-12 rounded-xl ${colorClass} flex items-center justify-center text-white text-xl font-bold flex-shrink-0`}>
      {initial}
    </div>
  )
}

export default function ShopCard({ price, shop, modelId, storage, dimmed }: Props) {
  const supabase = createClient()
  const { t } = useLang()
  const [detailOpen, setDetailOpen] = useState(false)
  const [watched, setWatched] = useState(false)
  const [userId, setUserId] = useState<string | null>(null)
  const [authLoading, setAuthLoading] = useState(true)

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUserId(data.user?.id ?? null)
      setAuthLoading(false)
    })
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!userId) return
    supabase
      .from('saved_alerts')
      .select('id')
      .eq('user_id', userId)
      .eq('shop_id', shop.id)
      .eq('model_id', modelId)
      .eq('storage_option', storage)
      .maybeSingle()
      .then(({ data }) => setWatched(!!data))
  }, [userId, shop.id, modelId, storage]) // eslint-disable-line react-hooks/exhaustive-deps

  const toggleWatch = async (e: React.MouseEvent) => {
    e.stopPropagation()
    if (!userId) {
      window.location.href = '/auth/login'
      return
    }
    if (watched) {
      await supabase
        .from('saved_alerts')
        .delete()
        .eq('user_id', userId)
        .eq('shop_id', shop.id)
        .eq('model_id', modelId)
        .eq('storage_option', storage)
      setWatched(false)
    } else {
      await supabase.from('saved_alerts').insert({
        user_id: userId,
        shop_id: shop.id,
        model_id: modelId,
        storage_option: storage,
        price_at_save: price.price_kwd,
      })
      setWatched(true)
    }
  }

  return (
    <>
      <div
        onClick={() => setDetailOpen(true)}
        className={`group relative rounded-2xl border bg-white dark:bg-gray-900 p-4 cursor-pointer transition-all duration-200 ${
          dimmed
            ? 'opacity-50 border-gray-100 dark:border-gray-800'
            : 'border-gray-200 dark:border-gray-800 hover:border-blue-200 dark:hover:border-blue-800 hover:shadow-[0_4px_24px_rgba(37,99,235,0.09)] active:scale-[0.99]'
        }`}
      >
        <div className="flex items-start gap-3">
          <ShopLogo shop={shop} />

          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              {/* Left: shop name + badge */}
              <div className="min-w-0">
                <p className="font-semibold text-gray-900 dark:text-white text-sm leading-tight">{shop.name}</p>
                {shop.is_authorised_reseller && (
                  <span className="inline-flex items-center gap-1 text-xs text-blue-600 dark:text-blue-400 font-medium mt-0.5">
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {t.authorisedReseller}
                  </span>
                )}
              </div>

              {/* Right: price block */}
              <div className="text-right flex-shrink-0">
                {price.in_stock ? (
                  <>
                    {(() => {
                      const hasDiscount =
                        price.original_price != null &&
                        price.original_price > price.price_kwd
                      const discountPct = hasDiscount
                        ? Math.round((1 - price.price_kwd / price.original_price!) * 100)
                        : 0
                      return (
                        <>
                          {hasDiscount && (
                            <div className="flex items-center justify-end gap-1.5 mb-0.5">
                              <span className="text-xs font-bold bg-red-500 text-white px-1.5 py-0.5 rounded-full">
                                -{discountPct}%
                              </span>
                              <span className="text-xs line-through text-gray-400">
                                {Number(price.original_price).toFixed(3)}
                              </span>
                            </div>
                          )}
                          <p className={`text-2xl font-bold tabular-nums leading-none ${hasDiscount ? 'text-red-600' : 'text-gray-900 dark:text-white'}`}>
                            {Number(price.price_kwd).toFixed(3)}
                          </p>
                          <p className="text-xs text-gray-400 font-medium mt-0.5">KWD</p>
                          {hasDiscount && price.discount_ends_at && (
                            <p className="text-xs text-red-500 mt-0.5">
                              {t.saleEnds} {new Date(price.discount_ends_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                            </p>
                          )}
                        </>
                      )
                    })()}
                  </>
                ) : (
                  <span className="text-sm text-gray-400 font-medium">{t.notAvailable}</span>
                )}
              </div>
            </div>

            {/* Stock status + meta */}
            <div className="mt-2 flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400">
              {price.in_stock ? (
                <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-medium">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                  {t.inStock}
                </span>
              ) : (
                <span className="flex items-center gap-1 text-gray-400 font-medium">
                  <span className="h-1.5 w-1.5 rounded-full bg-gray-400" />
                  {t.outOfStock}
                </span>
              )}
              {shop.area && <span>{shop.area}</span>}
              {shop.phone && <span>{shop.phone}</span>}
            </div>
          </div>
        </div>

        {/* Action row */}
        <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-800 flex items-center gap-2">
          {shop.reach_url && (
            <a
              href={shop.reach_url}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="flex-1 text-center text-xs font-semibold py-2 px-3 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:bg-blue-50 hover:border-blue-300 hover:text-blue-700 dark:hover:bg-blue-950 dark:hover:text-blue-300 transition-colors"
            >
              {t.visitShop}
            </a>
          )}
          {shop.instagram_url && (
            <a
              href={shop.instagram_url}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="p-2 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:bg-pink-50 hover:border-pink-200 dark:hover:bg-pink-950/30 transition-colors"
              title={shop.instagram_handle ?? 'Instagram'}
            >
              <svg className="w-4 h-4 text-pink-500" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/>
              </svg>
            </a>
          )}
          {!authLoading && (
            <button
              onClick={toggleWatch}
              title={watched ? 'Remove alert' : 'Set price alert'}
              className={`p-2 rounded-xl border transition-colors ${
                watched
                  ? 'bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800 text-blue-600'
                  : 'bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-400 hover:text-blue-500 hover:border-blue-200 hover:bg-blue-50 dark:hover:bg-blue-950/30'
              }`}
            >
              <svg className="w-4 h-4" fill={watched ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
            </button>
          )}
        </div>
      </div>

      {detailOpen && (
        <ShopDetailSheet
          shop={shop}
          modelId={modelId}
          storage={storage}
          currentPrice={price.price_kwd}
          onClose={() => setDetailOpen(false)}
        />
      )}
    </>
  )
}
