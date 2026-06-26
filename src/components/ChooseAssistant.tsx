'use client'

import { useState, useEffect, useRef } from 'react'

const LOADING_STEPS = [
  { icon: '🔍', text: 'Checking live Kuwait prices…' },
  { icon: '🏪', text: 'Comparing shops & stock…' },
  { icon: '💡', text: 'Matching to your needs…' },
  { icon: '✨', text: 'Almost there…' },
]

type Step = 'budget' | 'use' | 'storage' | 'result'

const BUDGETS = [
  { label: 'Under 150 KWD', value: 150 },
  { label: '150 – 200 KWD', value: 200 },
  { label: '200 – 250 KWD', value: 250 },
  { label: 'No limit', value: 9999 },
]

const USE_CASES = [
  { label: 'Photos & Camera', icon: '📷', value: 'photos' },
  { label: 'Social & Video', icon: '📱', value: 'social' },
  { label: 'Work & Productivity', icon: '💼', value: 'work' },
  { label: 'Gaming', icon: '🎮', value: 'gaming' },
]

const STORAGE_NEEDS = [
  { label: 'Light', sub: 'I use cloud and stream everything', value: 'light' },
  { label: 'Moderate', sub: 'Some photos, offline apps', value: 'moderate' },
  { label: 'Heavy', sub: 'Lots of videos and photos', value: 'heavy' },
]

export default function ChooseAssistant() {
  const [open, setOpen] = useState(false)
  const [step, setStep] = useState<Step>('budget')
  const [budget, setBudget] = useState<number | null>(null)
  const [useCase, setUseCase] = useState<string | null>(null)
  const [storageNeed, setStorageNeed] = useState<string | null>(null)
  const [result, setResult] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [loadingStep, setLoadingStep] = useState(0)
  const stepTimer = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => () => stopStepAnimation(), [])

  const startStepAnimation = () => {
    setLoadingStep(0)
    stepTimer.current = setInterval(() => {
      setLoadingStep((prev) => Math.min(prev + 1, LOADING_STEPS.length - 1))
    }, 1800)
  }

  const stopStepAnimation = () => {
    if (stepTimer.current) { clearInterval(stepTimer.current); stepTimer.current = null }
  }

  const reset = () => {
    stopStepAnimation()
    setStep('budget')
    setBudget(null)
    setUseCase(null)
    setStorageNeed(null)
    setResult('')
    setError(null)
    setLoading(false)
    setLoadingStep(0)
  }

  const close = () => { setOpen(false); reset() }

  const submit = async (finalStorageNeed: string) => {
    setStep('result')
    setLoading(true)
    setError(null)
    setResult('')
    startStepAnimation()

    try {
      const res = await fetch('/api/ai-choose', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ maxBudget: budget, useCase, storageNeed: finalStorageNeed }),
      })

      if (!res.ok || !res.body) {
        const data = await res.json().catch(() => ({}))
        stopStepAnimation()
        setError(data.error ?? 'Something went wrong. Please try again.')
        setLoading(false)
        return
      }

      const reader = res.body.getReader()
      const decoder = new TextDecoder()
      stopStepAnimation()
      setLoading(false)

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
            if (delta) setResult((prev) => prev + delta)
          } catch {}
        }
      }
    } catch {
      stopStepAnimation()
      setError('Connection error. Please try again.')
      setLoading(false)
    }
  }

  return (
    <>
      {/* Floating button */}
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-6 right-4 z-40 flex items-center gap-2 bg-blue-600 hover:bg-blue-700 active:scale-95 text-white text-sm font-semibold px-4 py-3 rounded-full shadow-lg transition-all"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9 5.25h.008v.008H12v-.008z" />
        </svg>
        Help me choose
      </button>

      {/* Backdrop */}
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm"
          onClick={close}
        />
      )}

      {/* Sheet */}
      {open && (
        <div className="fixed bottom-0 left-0 right-0 z-50 bg-white dark:bg-gray-900 rounded-t-3xl shadow-2xl max-h-[90vh] overflow-y-auto">
          <div className="max-w-lg mx-auto px-5 pb-8 pt-4">

            {/* Handle */}
            <div className="w-10 h-1 rounded-full bg-gray-200 dark:bg-gray-700 mx-auto mb-5" />

            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-lg font-bold text-gray-900 dark:text-white">Help me choose</h2>
                <p className="text-xs text-gray-500 mt-0.5">
                  {step === 'budget' && 'Step 1 of 3 — Budget'}
                  {step === 'use' && 'Step 2 of 3 — Main use'}
                  {step === 'storage' && 'Step 3 of 3 — Storage'}
                  {step === 'result' && 'Your personalised pick'}
                </p>
              </div>
              <button onClick={close} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 p-1">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Progress bar */}
            {step !== 'result' && (
              <div className="h-1 w-full bg-gray-100 dark:bg-gray-800 rounded-full mb-6 overflow-hidden">
                <div
                  className="h-full bg-blue-600 rounded-full transition-all duration-300"
                  style={{ width: step === 'budget' ? '33%' : step === 'use' ? '66%' : '100%' }}
                />
              </div>
            )}

            {/* Step 1 — Budget */}
            {step === 'budget' && (
              <div className="space-y-2">
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">What is your budget?</p>
                {BUDGETS.map((b) => (
                  <button
                    key={b.value}
                    onClick={() => { setBudget(b.value); setStep('use') }}
                    className="w-full text-left px-4 py-3.5 rounded-2xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-950 transition-colors text-sm font-medium text-gray-800 dark:text-gray-200"
                  >
                    {b.label}
                  </button>
                ))}
              </div>
            )}

            {/* Step 2 — Use case */}
            {step === 'use' && (
              <div className="space-y-2">
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">What do you mainly use your phone for?</p>
                {USE_CASES.map((u) => (
                  <button
                    key={u.value}
                    onClick={() => { setUseCase(u.value); setStep('storage') }}
                    className="w-full text-left px-4 py-3.5 rounded-2xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-950 transition-colors flex items-center gap-3"
                  >
                    <span className="text-xl">{u.icon}</span>
                    <span className="text-sm font-medium text-gray-800 dark:text-gray-200">{u.label}</span>
                  </button>
                ))}
                <button onClick={() => setStep('budget')} className="text-xs text-gray-400 hover:text-gray-600 mt-1 pt-1">
                  ← Back
                </button>
              </div>
            )}

            {/* Step 3 — Storage */}
            {step === 'storage' && (
              <div className="space-y-2">
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">How much do you store on your phone?</p>
                {STORAGE_NEEDS.map((s) => (
                  <button
                    key={s.value}
                    onClick={() => { setStorageNeed(s.value); submit(s.value) }}
                    className="w-full text-left px-4 py-3.5 rounded-2xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-950 transition-colors"
                  >
                    <p className="text-sm font-medium text-gray-800 dark:text-gray-200">{s.label}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{s.sub}</p>
                  </button>
                ))}
                <button onClick={() => setStep('use')} className="text-xs text-gray-400 hover:text-gray-600 mt-1 pt-1">
                  ← Back
                </button>
              </div>
            )}

            {/* Result */}
            {step === 'result' && (
              <div>
                {loading && (
                  <div className="py-4 space-y-3">
                    {LOADING_STEPS.map((s, i) => (
                      <div
                        key={i}
                        className={`flex items-center gap-3 transition-all duration-500 ${
                          i <= loadingStep ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'
                        }`}
                      >
                        <span className="text-lg">{s.icon}</span>
                        <span className={`text-sm ${i === loadingStep ? 'text-gray-900 dark:text-white font-medium' : 'text-gray-400'}`}>
                          {s.text}
                        </span>
                        {i < loadingStep && (
                          <svg className="w-4 h-4 text-emerald-500 ml-auto shrink-0" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                          </svg>
                        )}
                        {i === loadingStep && (
                          <div className="ml-auto w-4 h-4 rounded-full border-2 border-blue-600 border-t-transparent animate-spin shrink-0" />
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {error && (
                  <div className="text-sm text-red-600 py-2">{error}</div>
                )}

                {!loading && !error && result && (
                  <div className="text-sm text-gray-800 dark:text-gray-200 whitespace-pre-wrap leading-relaxed">
                    {result}
                  </div>
                )}

                <div className="mt-6 flex gap-3">
                  <button
                    onClick={reset}
                    className="flex-1 py-3 rounded-2xl border border-gray-200 dark:border-gray-700 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                  >
                    Start over
                  </button>
                  <button
                    onClick={close}
                    className="flex-1 py-3 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium transition-colors"
                  >
                    Browse prices
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  )
}
