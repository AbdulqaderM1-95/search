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
    <div className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-gray-500 dark:text-gray-400">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25zM6.75 12h.008v.008H6.75V12zm0 3h.008v.008H6.75V15zm0 3h.008v.008H6.75V18z" />
            </svg>
          </span>
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

      {loading && (
        <div className="space-y-2">
          {[80, 60, 90, 50].map((w, i) => (
            <div key={i} className="h-3 rounded-full bg-gray-100 dark:bg-gray-800 animate-pulse" style={{ width: `${w}%` }} />
          ))}
        </div>
      )}

      {error && (
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Could not load specs. Please try again.
        </p>
      )}

      {!loading && !error && (
        <div className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap leading-relaxed">
          {text}
          {text.length === 0 && <span className="text-gray-400">Loading specs…</span>}
        </div>
      )}
    </div>
  )
}
