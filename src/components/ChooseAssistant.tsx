'use client'

import { useState, useEffect, useRef } from 'react'
import { useLang } from '@/lib/lang-context'

type Step = 'budget' | 'use' | 'storage' | 'result'

export default function ChooseAssistant() {
  const { t } = useLang()
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
      setLoadingStep((prev) => Math.min(prev + 1, 3))
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
        className="fixed bottom-6 right-5 z-40 flex items-center gap-2.5 bg-blue-600 hover:bg-blue-700 active:scale-95 text-white text-sm font-semibold px-5 py-3.5 rounded-full shadow-[0_4px_20px_rgba(37,99,235,0.4)] hover:shadow-[0_6px_24px_rgba(37,99,235,0.5)] transition-all duration-200"
      >
        {/* Sparkle/wand icon */}
        <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z" />
        </svg>
        {t.helpMeChoose}
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
          <div className="max-w-lg mx-auto px-6 pb-10 pt-4">

            {/* Handle */}
            <div className="w-10 h-1 rounded-full bg-gray-200 dark:bg-gray-700 mx-auto mb-6" />

            {/* Header */}
            <div className="flex items-start justify-between mb-5">
              <div>
                <h2 className="text-lg font-bold text-gray-900 dark:text-white">{t.helpMeChoose}</h2>
                <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
                  {step === 'budget' && t.step1Label}
                  {step === 'use' && t.step2Label}
                  {step === 'storage' && t.step3Label}
                  {step === 'result' && t.resultLabel}
                </p>
              </div>
              <button
                onClick={close}
                className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Progress bar */}
            {step !== 'result' && (
              <div className="h-1 w-full bg-gray-100 dark:bg-gray-800 rounded-full mb-6 overflow-hidden">
                <div
                  className="h-full bg-blue-600 rounded-full transition-all duration-500"
                  style={{ width: step === 'budget' ? '33%' : step === 'use' ? '66%' : '100%' }}
                />
              </div>
            )}

            {/* Step 1 — Budget */}
            {step === 'budget' && (
              <div className="space-y-2.5">
                <p className="text-sm font-semibold text-gray-800 dark:text-gray-200 mb-4">{t.whatBudget}</p>
                {[
                  { label: t.budgetUnder150, value: 150 },
                  { label: t.budget150to200, value: 200 },
                  { label: t.budget200to250, value: 250 },
                  { label: t.budgetNoLimit, value: 9999 },
                ].map((b) => (
                  <button
                    key={b.value}
                    onClick={() => { setBudget(b.value); setStep('use') }}
                    className="w-full text-left px-4 py-4 rounded-2xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 hover:border-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950 dark:hover:border-blue-600 transition-all text-sm font-medium text-gray-800 dark:text-gray-200 active:scale-[0.98]"
                  >
                    {b.label}
                  </button>
                ))}
              </div>
            )}

            {/* Step 2 — Use case */}
            {step === 'use' && (
              <div className="space-y-2.5">
                <p className="text-sm font-semibold text-gray-800 dark:text-gray-200 mb-4">{t.whatUse}</p>
                {[
                  { label: t.usePhotos, icon: '📷', value: 'photos' },
                  { label: t.useSocial, icon: '📱', value: 'social' },
                  { label: t.useWork, icon: '💼', value: 'work' },
                  { label: t.useGaming, icon: '🎮', value: 'gaming' },
                ].map((u) => (
                  <button
                    key={u.value}
                    onClick={() => { setUseCase(u.value); setStep('storage') }}
                    className="w-full text-left px-4 py-4 rounded-2xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 hover:border-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950 dark:hover:border-blue-600 transition-all flex items-center gap-3.5 active:scale-[0.98]"
                  >
                    <span className="text-2xl">{u.icon}</span>
                    <span className="text-sm font-medium text-gray-800 dark:text-gray-200">{u.label}</span>
                  </button>
                ))}
                <button
                  onClick={() => setStep('budget')}
                  className="flex items-center gap-1 text-xs text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 mt-2 pt-1 transition-colors"
                >
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
                  </svg>
                  {t.back}
                </button>
              </div>
            )}

            {/* Step 3 — Storage */}
            {step === 'storage' && (
              <div className="space-y-2.5">
                <p className="text-sm font-semibold text-gray-800 dark:text-gray-200 mb-4">{t.howMuchStorage}</p>
                {[
                  { label: t.storageLight, sub: t.storageLightSub, value: 'light' },
                  { label: t.storageModerate, sub: t.storageModerateSub, value: 'moderate' },
                  { label: t.storageHeavy, sub: t.storageHeavySub, value: 'heavy' },
                ].map((s) => (
                  <button
                    key={s.value}
                    onClick={() => { setStorageNeed(s.value); submit(s.value) }}
                    className="w-full text-left px-4 py-4 rounded-2xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 hover:border-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950 dark:hover:border-blue-600 transition-all active:scale-[0.98]"
                  >
                    <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">{s.label}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 leading-relaxed">{s.sub}</p>
                  </button>
                ))}
                <button
                  onClick={() => setStep('use')}
                  className="flex items-center gap-1 text-xs text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 mt-2 pt-1 transition-colors"
                >
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
                  </svg>
                  {t.back}
                </button>
              </div>
            )}

            {/* Result */}
            {step === 'result' && (
              <div>
                {loading && (
                  <div className="py-4 space-y-4">
                    {[
                      { icon: '🔍', text: t.loadingPrices },
                      { icon: '🏪', text: t.loadingShops },
                      { icon: '💡', text: t.loadingMatching },
                      { icon: '✨', text: t.loadingAlmost },
                    ].map((s, i) => (
                      <div
                        key={i}
                        className={`flex items-center gap-3 transition-all duration-500 ${
                          i <= loadingStep ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'
                        }`}
                      >
                        <span className="text-xl flex-shrink-0">{s.icon}</span>
                        <span className={`text-sm leading-snug ${i === loadingStep ? 'text-gray-900 dark:text-white font-semibold' : 'text-gray-400 dark:text-gray-500'}`}>
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
                  <div className="text-sm text-red-600 dark:text-red-400 py-3 px-4 bg-red-50 dark:bg-red-950/30 rounded-xl border border-red-100 dark:border-red-900">
                    {error}
                  </div>
                )}

                {!loading && !error && result && (
                  <div className="text-sm text-gray-800 dark:text-gray-200 whitespace-pre-wrap leading-7">
                    {result}
                  </div>
                )}

                <div className="mt-8 flex gap-3">
                  <button
                    onClick={reset}
                    className="flex-1 py-3.5 rounded-2xl border border-gray-200 dark:border-gray-700 text-sm font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                  >
                    {t.startOver}
                  </button>
                  <button
                    onClick={close}
                    className="flex-1 py-3.5 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold transition-colors shadow-sm"
                  >
                    {t.browsePrices}
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
