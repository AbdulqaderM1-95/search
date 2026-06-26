'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Shop } from '@/lib/types'

type Profile = {
  id: string
  role: string
  disabled: boolean
  created_at: string
  shop_profiles?: { shop_id: string }[]
}

export default function AdminUsersPage() {
  const supabase = createClient()
  const [users, setUsers] = useState<Profile[]>([])
  const [shops, setShops] = useState<Shop[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState<'all' | 'admin' | 'user' | 'shop_owner'>('all')
  const [assigningId, setAssigningId] = useState<string | null>(null)
  const [assignShopId, setAssignShopId] = useState('')

  useEffect(() => { load() }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const load = async () => {
    const [{ data: profileData }, { data: shopData }] = await Promise.all([
      supabase
        .from('profiles')
        .select('*, shop_profiles(shop_id)')
        .order('created_at', { ascending: false }),
      supabase.from('shops').select('*').order('name'),
    ])
    setUsers((profileData as Profile[]) ?? [])
    setShops((shopData as Shop[]) ?? [])
    setLoading(false)
  }

  const toggleDisabled = async (user: Profile) => {
    const { data: { user: admin } } = await supabase.auth.getUser()
    const action = user.disabled ? 'reactivate_user' : 'disable_user'
    await supabase.from('profiles').update({ disabled: !user.disabled }).eq('id', user.id)
    if (admin) {
      await supabase.from('audit_log').insert({
        admin_id: admin.id,
        action,
        target_table: 'profiles',
        target_id: user.id,
      })
    }
    setUsers((prev) =>
      prev.map((u) => u.id === user.id ? { ...u, disabled: !u.disabled } : u)
    )
  }

  const startAssign = (user: Profile) => {
    setAssigningId(user.id)
    setAssignShopId(user.shop_profiles?.[0]?.shop_id ?? '')
  }

  const saveShopOwner = async (userId: string) => {
    if (!assignShopId) return
    await supabase.from('profiles').update({ role: 'shop_owner' }).eq('id', userId)
    await supabase
      .from('shop_profiles')
      .upsert({ user_id: userId, shop_id: assignShopId }, { onConflict: 'user_id' })
    setUsers((prev) =>
      prev.map((u) =>
        u.id === userId
          ? { ...u, role: 'shop_owner', shop_profiles: [{ shop_id: assignShopId }] }
          : u
      )
    )
    setAssigningId(null)
  }

  const removeShopOwner = async (userId: string) => {
    await supabase.from('profiles').update({ role: 'user' }).eq('id', userId)
    await supabase.from('shop_profiles').delete().eq('user_id', userId)
    setUsers((prev) =>
      prev.map((u) =>
        u.id === userId ? { ...u, role: 'user', shop_profiles: [] } : u
      )
    )
  }

  const filtered = users.filter((u) => {
    if (filter !== 'all' && u.role !== filter) return false
    if (search && !u.id.toLowerCase().includes(search.toLowerCase())) return false
    return true
  })

  const roleColor = (role: string) => {
    if (role === 'admin') return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
    if (role === 'shop_owner') return 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200'
    return 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300'
  }

  return (
    <div>
      <h1 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Users</h1>

      <div className="flex gap-3 mb-4">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by user ID…"
          className="flex-1 px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value as typeof filter)}
          className="px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-sm focus:outline-none"
        >
          <option value="all">All roles</option>
          <option value="user">Users</option>
          <option value="admin">Admins</option>
          <option value="shop_owner">Shop owners</option>
        </select>
      </div>

      {loading ? (
        <div className="space-y-2">
          {[1, 2, 3].map((i) => <div key={i} className="h-14 rounded-xl bg-gray-200 dark:bg-gray-800 animate-pulse" />)}
        </div>
      ) : (
        <div className="rounded-2xl border border-gray-100 dark:border-gray-800 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 dark:bg-gray-900 text-gray-500 text-xs uppercase tracking-wide">
              <tr>
                <th className="px-4 py-3 text-left">User ID</th>
                <th className="px-4 py-3 text-left">Role</th>
                <th className="px-4 py-3 text-left">Shop</th>
                <th className="px-4 py-3 text-left">Joined</th>
                <th className="px-4 py-3 text-left">Status</th>
                <th className="px-4 py-3 text-left">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800 bg-white dark:bg-gray-900">
              {filtered.map((u) => {
                const shopId = u.shop_profiles?.[0]?.shop_id
                const shopName = shops.find((s) => s.id === shopId)?.name
                return (
                  <tr key={u.id}>
                    <td className="px-4 py-3 font-mono text-xs text-gray-500 dark:text-gray-400 max-w-[160px] truncate">{u.id}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${roleColor(u.role)}`}>
                        {u.role}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-500">
                      {assigningId === u.id ? (
                        <div className="flex items-center gap-2">
                          <select
                            value={assignShopId}
                            onChange={(e) => setAssignShopId(e.target.value)}
                            className="px-2 py-1 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-xs focus:outline-none focus:border-blue-400"
                          >
                            <option value="">Select shop…</option>
                            {shops.map((s) => (
                              <option key={s.id} value={s.id}>{s.name}</option>
                            ))}
                          </select>
                          <button
                            onClick={() => saveShopOwner(u.id)}
                            disabled={!assignShopId}
                            className="text-xs text-emerald-600 font-medium hover:underline disabled:opacity-40"
                          >
                            Save
                          </button>
                          <button
                            onClick={() => setAssigningId(null)}
                            className="text-xs text-gray-400 hover:underline"
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        shopName ?? '—'
                      )}
                    </td>
                    <td className="px-4 py-3 text-gray-500 text-xs">{new Date(u.created_at).toLocaleDateString()}</td>
                    <td className="px-4 py-3">
                      {u.disabled ? (
                        <span className="text-xs text-red-600 font-medium">Disabled</span>
                      ) : (
                        <span className="text-xs text-emerald-600 font-medium">Active</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3 flex-wrap">
                        <button
                          onClick={() => toggleDisabled(u)}
                          className="text-xs text-gray-500 hover:text-gray-900 dark:hover:text-white underline"
                        >
                          {u.disabled ? 'Reactivate' : 'Disable'}
                        </button>
                        {u.role !== 'admin' && (
                          u.role === 'shop_owner' ? (
                            <button
                              onClick={() => removeShopOwner(u.id)}
                              className="text-xs text-red-500 hover:underline"
                            >
                              Remove shop owner
                            </button>
                          ) : (
                            <button
                              onClick={() => startAssign(u)}
                              className="text-xs text-amber-600 hover:underline"
                            >
                              Make shop owner
                            </button>
                          )
                        )}
                      </div>
                    </td>
                  </tr>
                )
              })}
              {filtered.length === 0 && (
                <tr><td colSpan={6} className="px-4 py-8 text-center text-gray-400">No users found</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
