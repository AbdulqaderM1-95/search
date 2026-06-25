'use client'

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts'
import type { PriceHistory } from '@/lib/types'

type Props = { history: PriceHistory[] }

export default function PriceHistoryChart({ history }: Props) {
  if (history.length < 3) {
    return (
      <div className="h-48 flex items-center justify-center rounded-xl bg-gray-50 dark:bg-gray-800 text-gray-400 text-sm">
        Not enough history yet
      </div>
    )
  }

  const prices = history.map((h) => Number(h.price_kwd))
  const minPrice = Math.min(...prices)
  const maxPrice = Math.max(...prices)

  const data = history.map((h) => ({
    date: new Date(h.recorded_at).toLocaleDateString('en-KW', { month: 'short', day: 'numeric' }),
    price: Number(h.price_kwd),
  }))

  return (
    <div>
      <ResponsiveContainer width="100%" height={180}>
        <LineChart data={data} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
          <XAxis
            dataKey="date"
            tick={{ fontSize: 11, fill: '#9ca3af' }}
            tickLine={false}
            axisLine={false}
            interval="preserveStartEnd"
          />
          <YAxis
            tick={{ fontSize: 11, fill: '#9ca3af' }}
            tickLine={false}
            axisLine={false}
            domain={['auto', 'auto']}
            tickFormatter={(v) => `${v}`}
          />
          <Tooltip
            contentStyle={{
              background: 'white',
              border: '1px solid #e5e7eb',
              borderRadius: 8,
              fontSize: 12,
            }}
            formatter={(v: number) => [`${v.toFixed(3)} KWD`, 'Price']}
          />
          <ReferenceLine y={minPrice} stroke="#10b981" strokeDasharray="3 3" label={{ value: `Low ${minPrice.toFixed(3)}`, fill: '#10b981', fontSize: 10 }} />
          <ReferenceLine y={maxPrice} stroke="#f59e0b" strokeDasharray="3 3" label={{ value: `High ${maxPrice.toFixed(3)}`, fill: '#f59e0b', fontSize: 10 }} />
          <Line
            type="monotone"
            dataKey="price"
            stroke="#3b82f6"
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 4, fill: '#3b82f6' }}
          />
        </LineChart>
      </ResponsiveContainer>
      <div className="mt-2 flex gap-4 text-xs text-gray-500">
        <span className="text-emerald-600">▼ Low: {minPrice.toFixed(3)} KWD</span>
        <span className="text-amber-600">▲ High: {maxPrice.toFixed(3)} KWD</span>
      </div>
    </div>
  )
}
