'use client'

import { useState, useEffect } from 'react'
import { adminApi } from '@/lib/api/client'
import { DashboardStats, AdminUser, AdminManga } from '@/types/admin'

/**
 * Example Admin Dashboard Component
 * Demonstrates how to use the admin API system
 */
export function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [users, setUsers] = useState<AdminUser[]>([])
  const [manga, setManga] = useState<AdminManga[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadDashboardData()
  }, [])

  const loadDashboardData = async () => {
    try {
      setLoading(true)
      setError(null)

      // Load dashboard statistics
      const dashboardResponse = await adminApi.dashboard.getStats()
      if (dashboardResponse.success) {
        setStats(dashboardResponse.data.stats)
      }

      // Load recent users
      const usersResponse = await adminApi.users.getList({
        page: 1,
        limit: 10,
        sort: 'created_at',
        order: 'desc'
      })
      if (usersResponse.success) {
        setUsers(usersResponse.data)
      }

      // Load recent manga
      const mangaResponse = await adminApi.manga.getList({
        page: 1,
        limit: 10,
        sort: 'created_at',
        order: 'desc'
      })
      if (mangaResponse.success) {
        setManga(mangaResponse.data)
      }

    } catch (err) {
      setError('Failed to load dashboard data')
      console.error('Dashboard error:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleBanUser = async (userId: number) => {
    try {
      const result = await adminApi.users.ban(userId, {
        reason: 'Violation of community guidelines',
        duration: 7,
        notify: true
      })

      if (result.success) {
        alert('User banned successfully')
        loadDashboardData() // Refresh data
      } else {
        alert('Failed to ban user: ' + result.error)
      }
    } catch (err) {
      alert('Error banning user')
      console.error('Ban error:', err)
    }
  }

  const handleApproveManga = async (mangaId: number) => {
    try {
      const result = await adminApi.manga.approve(mangaId)

      if (result.success) {
        alert('Manga approved successfully')
        loadDashboardData() // Refresh data
      } else {
        alert('Failed to approve manga: ' + result.error)
      }
    } catch (err) {
      alert('Error approving manga')
      console.error('Approve error:', err)
    }
  }

  const handleBulkMangaOperation = async (action: string, ids: number[]) => {
    try {
      const result = await adminApi.manga.bulkOperation({
        action,
        ids,
        reason: `Bulk ${action} operation`,
        notify: true
      })

      if (result.success) {
        alert(`Bulk ${action} completed: ${result.processed} processed, ${result.failed} failed`)
        loadDashboardData() // Refresh data
      } else {
        alert('Bulk operation failed: ' + result.error)
      }
    } catch (err) {
      alert('Error performing bulk operation')
      console.error('Bulk operation error:', err)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Loading admin dashboard...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-red-500">Error: {error}</div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-3xl font-bold">Admin Dashboard</h1>

      {/* Statistics Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="Total Users"
            value={stats.users.total}
            subtitle={`${stats.users.newToday} new today`}
            color="blue"
          />
          <StatCard
            title="Total Manga"
            value={stats.manga.total}
            subtitle={`${stats.manga.pending} pending approval`}
            color="green"
          />
          <StatCard
            title="Total Chapters"
            value={stats.chapters.total}
            subtitle={`${stats.chapters.newToday} new today`}
            color="purple"
          />
          <StatCard
            title="Pending Reports"
            value={stats.reports.pending}
            subtitle={`${stats.reports.newToday} new today`}
            color="red"
          />
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Users */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Recent Users</h2>
          <div className="space-y-3">
            {users.map(user => (
              <div key={user.id} className="flex items-center justify-between p-3 border rounded">
                <div>
                  <div className="font-medium">{user.username}</div>
                  <div className="text-sm text-gray-500">{user.email}</div>
                  <div className="text-xs text-gray-400">
                    Role: {user.role} | Joined: {new Date(user.created_at).toLocaleDateString()}
                  </div>
                </div>
                <div className="flex space-x-2">
                  {user.role === 'user' && (
                    <button
                      onClick={() => handleBanUser(user.id)}
                      className="px-3 py-1 bg-red-500 text-white rounded text-sm hover:bg-red-600"
                    >
                      Ban
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Manga */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Recent Manga</h2>
          <div className="space-y-3">
            {manga.map(item => (
              <div key={item.id} className="flex items-center justify-between p-3 border rounded">
                <div>
                  <div className="font-medium">{item.title}</div>
                  <div className="text-sm text-gray-500">Status: {item.status}</div>
                  <div className="text-xs text-gray-400">
                    Created: {new Date(item.created_at).toLocaleDateString()}
                  </div>
                </div>
                <div className="flex space-x-2">
                  {item.status === 'pending' && (
                    <button
                      onClick={() => handleApproveManga(item.id)}
                      className="px-3 py-1 bg-green-500 text-white rounded text-sm hover:bg-green-600"
                    >
                      Approve
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bulk Operations Example */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">Bulk Operations</h2>
        <div className="flex space-x-4">
          <button
            onClick={() => {
              const selectedIds = manga.filter(m => m.status === 'pending').map(m => m.id)
              if (selectedIds.length > 0) {
                handleBulkMangaOperation('approve', selectedIds)
              } else {
                alert('No pending manga to approve')
              }
            }}
            className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
          >
            Approve All Pending Manga
          </button>
          <button
            onClick={() => {
              const selectedIds = manga.filter(m => m.status === 'draft').map(m => m.id)
              if (selectedIds.length > 0) {
                handleBulkMangaOperation('archive', selectedIds)
              } else {
                alert('No draft manga to archive')
              }
            }}
            className="px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600"
          >
            Archive All Draft Manga
          </button>
        </div>
      </div>
    </div>
  )
}

/**
 * Statistics Card Component
 */
interface StatCardProps {
  title: string
  value: number
  subtitle: string
  color: 'blue' | 'green' | 'purple' | 'red'
}

function StatCard({ title, value, subtitle, color }: StatCardProps) {
  const colorClasses = {
    blue: 'bg-blue-500',
    green: 'bg-green-500',
    purple: 'bg-purple-500',
    red: 'bg-red-500'
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center">
        <div className={`p-3 rounded-full ${colorClasses[color]} text-white mr-4`}>
          <div className="w-6 h-6" />
        </div>
        <div>
          <div className="text-2xl font-bold">{value.toLocaleString()}</div>
          <div className="text-gray-600">{title}</div>
          <div className="text-sm text-gray-500">{subtitle}</div>
        </div>
      </div>
    </div>
  )
}

/**
 * Example usage in a Next.js page:
 * 
 * ```tsx
 * // pages/admin/dashboard.tsx or app/admin/dashboard/page.tsx
 * import { AdminDashboard } from '@/components/admin/AdminDashboard'
 * 
 * export default function AdminDashboardPage() {
 *   return <AdminDashboard />
 * }
 * ```
 */
