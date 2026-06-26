'use client'

import type { IphoneModel } from '@/lib/types'
import { MODEL_SPECS, SPEC_LABELS } from '@/lib/specs'

type Props = {
  model: IphoneModel
  storage: string
  onDismiss: () => void
}

export default function AIRecommendation({ model, storage, onDismiss }: Props) {
  const specs = MODEL_SPECS[model.model_name]

  if (!specs) return null

  return (
    <div className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <svg className="w-4 h-4 text-gray-500 dark:text-gray-400" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25zM6.75 12h.008v.008H6.75V12zm0 3h.008v.008H6.75V15zm0 3h.008v.008H6.75V18z" />
          </svg>
          <span className="text-sm font-semibold text-gray-900 dark:text-white">
            {model.model_name} · {storage} Specs
          </span>
        </div>
        <button
          onClick={onDismiss}
          className="text-xs text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
        >
          Dismiss
        </button>
      </div>

      <div className="space-y-2">
        {SPEC_LABELS.map(({ key, icon, label }) => (
          <div key={key} className="flex gap-2 text-sm">
            <span className="w-28 shrink-0 text-gray-500 dark:text-gray-400 flex items-start gap-1.5">
              <span>{icon}</span>
              <span>{label}</span>
            </span>
            <span className="text-gray-800 dark:text-gray-200 leading-snug">{specs[key]}</span>
          </div>
        ))}
        <div className="flex gap-2 text-sm">
          <span className="w-28 shrink-0 text-gray-500 dark:text-gray-400 flex items-start gap-1.5">
            <span>💾</span>
            <span>Storage</span>
          </span>
          <span className="text-gray-800 dark:text-gray-200">{storage} RAM 8 GB</span>
        </div>
      </div>

      <p className="mt-3 text-xs text-gray-400">
        Source: Apple — verify at{' '}
        <a
          href="https://www.apple.com/kw/shop/buy-iphone"
          target="_blank"
          rel="noopener noreferrer"
          className="underline hover:text-gray-600 dark:hover:text-gray-300"
        >
          apple.com/kw
        </a>
      </p>
    </div>
  )
}
