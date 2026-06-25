'use client'

type Props = {
  options: string[]
  selected: string
  onSelect: (s: string) => void
}

export default function StorageSelector({ options, selected, onSelect }: Props) {
  return (
    <div className="flex gap-2 mt-3 overflow-x-auto pb-1 scrollbar-none">
      {options.map((opt) => (
        <button
          key={opt}
          onClick={() => onSelect(opt)}
          className={`flex-shrink-0 px-3 py-1 rounded-lg text-sm border transition-colors ${
            selected === opt
              ? 'bg-gray-900 dark:bg-white text-white dark:text-gray-900 border-gray-900 dark:border-white'
              : 'bg-white dark:bg-gray-900 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-gray-700 hover:border-gray-400'
          }`}
        >
          {opt}
        </button>
      ))}
    </div>
  )
}
