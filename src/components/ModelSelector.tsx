'use client'

import type { IphoneModel } from '@/lib/types'

type Props = {
  models: IphoneModel[]
  selected: IphoneModel | null
  onSelect: (m: IphoneModel) => void
}

export default function ModelSelector({ models, selected, onSelect }: Props) {
  if (models.length === 0) {
    return (
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
        {['iPhone 17', 'iPhone 17 Pro', 'iPhone 17 Pro Max'].map((name) => (
          <div key={name} className="h-9 w-36 flex-shrink-0 rounded-full bg-gray-200 dark:bg-gray-800 animate-pulse" />
        ))}
      </div>
    )
  }

  return (
    <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
      {models.map((m) => (
        <button
          key={m.id}
          onClick={() => onSelect(m)}
          className={`flex-shrink-0 px-4 py-1.5 rounded-full text-sm font-medium border transition-colors ${
            selected?.id === m.id
              ? 'bg-blue-600 text-white border-blue-600'
              : 'bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-700 hover:border-blue-400'
          }`}
        >
          {m.model_name}
        </button>
      ))}
    </div>
  )
}
