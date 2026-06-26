'use client'

import { useEffect, useState } from 'react'
import type { IphoneModel } from '@/lib/types'

type Props = {
  model: IphoneModel
  storage: string
  onDismiss: () => void
}

export default function AIRecommendation({ model, storage, onDismiss }: Props) {
  const [text, setText] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  useEffect(() => {
    let cancelled = false
    setText('')
    setLoading(true)
    setError(false)

    fetch('/api/ai-recommendation', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        modelName: model.model_name,
        storage,
      }),
    })
      .then(async (res) => {
        if (!res.ok || !res.body) { setError(true); setLoading(false); return }
        const reader = res.body.getReader()
        const decoder = new TextDecoder()
        setLoading(false)
        while (true) {
          const { done, value } = await reader.read()
          if (done || cancelled) break
          const chunk = decoder.decode(value, { stream: true })
          const lines = chunk.split('\n')
          for (const line of lines) {
            if (!line.startsWith('data: ')) continue
            const data = line.slice(6).trim()
            if (data === '[DONE]') break
            try {
              const json = JSON.parse(data)
              const delta = json.choices?.[0]?.delta?.content
              if (delta && !cancelled) setText((prev) => prev + delta)
            } catch {}
          }
        }
      })
      .catch(() => { if (!cancelled) { setError(true); setLoading(false) } })

    return () => { cancelled = true }
  }, [model.id, storage]) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="rounded-2xl border border-blue-100 dark:border-blue-900 bg-blue-50/50 dark:bg-blue-950/30 p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-blue-600 dark:text-blue-400">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
            </svg>
          </span>
          <span className="text-sm font-semibold text-blue-900 dark:text-blue-200">AI Analysis</span>
        </div>
        <button
          onClick={onDismiss}
          className="text-xs text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
        >
          Dismiss
        </button>
      </div>

      {loading && (
        <div className="space-y-2">
          {[80, 60, 90, 50].map((w, i) => (
            <div key={i} className={`h-3 rounded-full bg-blue-200 dark:bg-blue-900 animate-pulse`} style={{ width: `${w}%` }} />
          ))}
        </div>
      )}

      {error && (
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Could not generate recommendation. Please try again.
        </p>
      )}

      {!loading && !error && (
        <div className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap leading-relaxed">
          {text}
          {text.length === 0 && <span className="text-gray-400">Generating...</span>}
        </div>
      )}
    </div>
  )
}
