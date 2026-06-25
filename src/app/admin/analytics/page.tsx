'use client'

import { useEffect, useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
} from 'recharts'

type Analytics = {
  totalUsers: number
  newUsers7d: number
  activeAlerts: number
  signupsByDay: { date: string; count: number }[]
}

export default function AdminAnalyticsPage() {
  const supabase = createClient()
  const [data, setData] = useState<Analytics | null>(null)
  const [loading, setLoading] = useState(true)
  const [lastRefresh, setLastRefresh] = useState(new Date())

  const load = useCallback(async () => {
    setLoading(true)
    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

    const [total, recent, alerts] = await Promise.all([
      supabase.from('profiles').select('id', { count: 'exact', head: true }),
      supabase.from('profiles').select('created_at').gte('created_at', sevenDaysAgo.toISOString()),
      supabase.from('saved_alerts').select('id', { count: 'exact', head: true }),
    ])

    const byDay: Record<string, number> = {}
    for (let i = 6; i >= 0; i--) {
      const d = new Date()
      d.setDate(d.getDate() - i)
      byDay[d.toLocaleDateString('en-GB', { month: 'short', day: 'numeric' })] = 0
    }
    for (const row of recent.data ?? []) {
      const key = new Date(row.created_at).toLocaleDateString('en-GB', { month: 'short', day: 'numeric' })
      if (key in byDay) byDay[key]++
    }

    setData({
      totalUsers: total.count ?? 0,
      newUsers7d: recent.data?.length ?? 0,
      activeAlerts: alerts.count ?? 0,
      signupsByDay: Object.entries(byDay).map(([date, count]) => ({ date, count })),
    })
    setLastRefresh(new Date())
    setLoading(false)
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    load()
    const interval = setInterval(load, 5 * 60 * 1000)
    return () => clearInterval(interval)
  }, [load])

  const Stat = ({ label, value }: { label: string; value: string | number }) => (
    <div className="rounded-2xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 p-5">
      <p className="text-sm text-gray-500 dark:text-gray-400">{label}</p>
      <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">{value}</p>
    </div>
  )

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold text-gray-900 dark:text-white">Analytics</h1>
        <div className="flex items-center gap-3 text-sm text-gray-400">
          <span>Updated {lastRefresh.toLocaleTimeString()}</span>
          <button onClick={load} className="text-blue-600 hover:underline">Refresh</button>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-6">
        <Stat label="Total users" value={loading ? '—' : data?.totalUsers ?? 0} />
        <Stat label="New users (7d)" value={loading ? '—' : data?.newUsers7d ?? 0} />
        <Stat label="Active alerts" value={loading ? '—' : data?.activeAlerts ?? 0} />
      </div>

      <div className="rounded-2xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 p-5">
        <h2 className="font-semibold text-gray-900 dark:text-white mb-4">Signups — last 7 days</h2>
        {loading ? (
          <div className="h-48 rounded-xl bg-gray-100 dark:bg-gray-800 animate-pulse" />
        ) : (
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={data?.signupsByDay ?? []} margin={{ top: 4, right: 8, left: -16, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
              <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#9ca3af' }} tickLine={false} axisLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#9ca3af' }} tickLine={false} axisLine={false} allowDecimals={false} />
              <Tooltip
                contentStyle={{ background: 'white', border: '1px solid #e5e7eb', borderRadius: 8, fontSize: 12 }}
                formatter={(v: number) => [v, 'Signups']}
              />
              <Line type="monotone" dataKey="count" stroke="#3b82f6" strokeWidth={2} dot={{ r: 3, fill: '#3b82f6' }} />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  )
}
