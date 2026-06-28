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
          className={`flex-shrink-0 px-4 py-1.5 rounded-full text-sm border transition-colors ${
            selected === opt
              ? 'bg-blue-50 dark:bg-blue-950 border-blue-400 dark:border-blue-500 text-blue-700 dark:text-blue-300 font-medium'
              : 'bg-white dark:bg-gray-900 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-600'
          }`}
        >
          {opt}
        </button>
      ))}
    </div>
  )
}
