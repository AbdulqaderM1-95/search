'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

type Stats = {
  totalUsers: number
  activeAlerts: number
  shops: number
  priceEntries: number
}

export default function AdminDashboard() {
  const supabase = createClient()
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      supabase.from('profiles').select('id', { count: 'exact', head: true }),
      supabase.from('saved_alerts').select('id', { count: 'exact', head: true }),
      supabase.from('shops').select('id', { count: 'exact', head: true }),
      supabase.from('prices').select('id', { count: 'exact', head: true }),
    ]).then(([users, alerts, shops, prices]) => {
      setStats({
        totalUsers: users.count ?? 0,
        activeAlerts: alerts.count ?? 0,
        shops: shops.count ?? 0,
        priceEntries: prices.count ?? 0,
      })
      setLoading(false)
    })
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const StatCard = ({ label, value }: { label: string; value: number | string }) => (
    <div className="rounded-2xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 p-5">
      <p className="text-sm text-gray-500 dark:text-gray-400">{label}</p>
      <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">
        {loading ? <span className="inline-block h-8 w-20 rounded bg-gray-200 dark:bg-gray-700 animate-pulse" /> : value}
      </p>
    </div>
  )

  return (
    <div>
      <h1 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Dashboard</h1>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        <StatCard label="Total users" value={stats?.totalUsers ?? 0} />
        <StatCard label="Active alerts" value={stats?.activeAlerts ?? 0} />
        <StatCard label="Shops" value={stats?.shops ?? 0} />
        <StatCard label="Price entries" value={stats?.priceEntries ?? 0} />
      </div>

      <div className="rounded-2xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 p-5">
        <h2 className="font-semibold text-gray-900 dark:text-white mb-3">Quick links</h2>
        <ul className="space-y-2 text-sm text-blue-600">
          <li><a href="/admin/users" className="hover:underline">Manage users →</a></li>
          <li><a href="/admin/content" className="hover:underline">Manage prices & shops →</a></li>
          <li><a href="/admin/analytics" className="hover:underline">View analytics →</a></li>
        </ul>
      </div>
    </div>
  )
}
