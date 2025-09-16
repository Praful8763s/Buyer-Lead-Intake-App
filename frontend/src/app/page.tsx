'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { 
  PlusIcon, 
  UsersIcon, 
  DownloadIcon, 
  UploadIcon, 
  TrendingUpIcon,
  CalendarIcon,
  MapPinIcon,
  HomeIcon,
  IndianRupeeIcon,
  BarChart3Icon,
  RefreshCwIcon
} from 'lucide-react'
import { buyersApi } from '@/lib/api'

interface DashboardStats {
  total_leads: number
  recent_leads: number
  conversion_rate: number
  avg_budget_min: number
  avg_budget_max: number
  status_counts: Record<string, { name: string; count: number }>
  city_counts: Record<string, { name: string; count: number }>
  property_counts: Record<string, { name: string; count: number }>
  budget_ranges: Record<string, number>
  timeline_counts: Record<string, { name: string; count: number }>
}

export default function HomePage() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    try {
      setLoading(true)
      const response = await buyersApi.getStats()
      setStats(response.data)
      setError(null)
    } catch (err: any) {
      setError(err.message || 'Failed to load dashboard statistics')
      console.error('Error fetching stats:', err)
    } finally {
      setLoading(false)
    }
  }

  const formatCurrency = (amount: number) => {
    if (amount >= 10000000) {
      return `₹${(amount / 10000000).toFixed(1)}Cr`
    } else if (amount >= 100000) {
      return `₹${(amount / 100000).toFixed(1)}L`
    } else {
      return `₹${amount.toLocaleString('en-IN')}`
    }
  }

  const getStatusColor = (status: string) => {
    const colors = {
      new: 'bg-blue-500',
      contacted: 'bg-yellow-500',
      qualified: 'bg-green-500',
      converted: 'bg-purple-500',
      lost: 'bg-red-500',
    }
    return colors[status as keyof typeof colors] || 'bg-gray-500'
  }

  return (
    <div className="px-4 py-8">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Buyer Lead Management
        </h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          Efficiently capture, manage, and analyze your real estate buyer leads
        </p>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        <Link href="/buyers/new" className="group">
          <div className="bg-white p-6 rounded-lg shadow-sm border hover:shadow-md transition-shadow">
            <div className="flex items-center justify-center w-12 h-12 bg-primary-100 rounded-lg mb-4">
              <PlusIcon className="w-6 h-6 text-primary-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Create Lead</h3>
            <p className="text-gray-600">Add new buyer leads with detailed information</p>
          </div>
        </Link>

        <Link href="/buyers" className="group">
          <div className="bg-white p-6 rounded-lg shadow-sm border hover:shadow-md transition-shadow">
            <div className="flex items-center justify-center w-12 h-12 bg-green-100 rounded-lg mb-4">
              <UsersIcon className="w-6 h-6 text-green-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">View Leads</h3>
            <p className="text-gray-600">Browse, search, and filter all buyer leads</p>
          </div>
        </Link>

        <Link href="/csv" className="group">
          <div className="bg-white p-6 rounded-lg shadow-sm border hover:shadow-md transition-shadow">
            <div className="flex items-center justify-center w-12 h-12 bg-blue-100 rounded-lg mb-4">
              <UploadIcon className="w-6 h-6 text-blue-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">CSV Management</h3>
            <p className="text-gray-600">Import and export leads via CSV files</p>
          </div>
        </Link>

        <Link href="/analytics" className="group">
          <div className="bg-white p-6 rounded-lg shadow-sm border hover:shadow-md transition-shadow">
            <div className="flex items-center justify-center w-12 h-12 bg-purple-100 rounded-lg mb-4">
              <DownloadIcon className="w-6 h-6 text-purple-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Analytics</h3>
            <p className="text-gray-600">View detailed reports and insights</p>
          </div>
        </Link>
      </div>

      {/* Dashboard Statistics */}
      {loading ? (
        <div className="bg-white rounded-lg shadow-sm border p-8">
          <div className="flex items-center justify-center">
            <RefreshCwIcon className="w-6 h-6 animate-spin text-gray-400 mr-2" />
            <span className="text-gray-600">Loading dashboard...</span>
          </div>
        </div>
      ) : error ? (
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <div className="text-red-800">
            <strong>Error loading dashboard:</strong> {error}
          </div>
          <button
            onClick={fetchStats}
            className="mt-3 btn-secondary text-sm"
          >
            Try Again
          </button>
        </div>
      ) : stats ? (
        <div className="space-y-8">
          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <UsersIcon className="h-8 w-8 text-blue-600" />
                </div>
                <div className="ml-4">
                  <div className="text-2xl font-bold text-gray-900">{stats.total_leads}</div>
                  <div className="text-sm text-gray-600">Total Leads</div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <CalendarIcon className="h-8 w-8 text-green-600" />
                </div>
                <div className="ml-4">
                  <div className="text-2xl font-bold text-gray-900">{stats.recent_leads}</div>
                  <div className="text-sm text-gray-600">This Week</div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <TrendingUpIcon className="h-8 w-8 text-purple-600" />
                </div>
                <div className="ml-4">
                  <div className="text-2xl font-bold text-gray-900">{stats.conversion_rate}%</div>
                  <div className="text-sm text-gray-600">Conversion Rate</div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <IndianRupeeIcon className="h-8 w-8 text-orange-600" />
                </div>
                <div className="ml-4">
                  <div className="text-lg font-bold text-gray-900">
                    {formatCurrency(stats.avg_budget_min)} - {formatCurrency(stats.avg_budget_max)}
                  </div>
                  <div className="text-sm text-gray-600">Avg Budget</div>
                </div>
              </div>
            </div>
          </div>

          {/* Status Breakdown */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <BarChart3Icon className="h-5 w-5 mr-2" />
                Lead Status
              </h3>
              <div className="space-y-3">
                {Object.entries(stats.status_counts).map(([key, status]) => (
                  <div key={key} className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className={`w-3 h-3 rounded-full mr-3 ${getStatusColor(key)}`}></div>
                      <span className="text-sm text-gray-700">{status.name}</span>
                    </div>
                    <span className="text-sm font-medium text-gray-900">{status.count}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <MapPinIcon className="h-5 w-5 mr-2" />
                Top Cities
              </h3>
              <div className="space-y-3">
                {Object.entries(stats.city_counts)
                  .sort(([,a], [,b]) => (b as any).count - (a as any).count)
                  .slice(0, 5)
                  .map(([key, city]) => (
                    <div key={key} className="flex items-center justify-between">
                      <span className="text-sm text-gray-700">{(city as any).name}</span>
                      <div className="flex items-center">
                        <div className="w-20 bg-gray-200 rounded-full h-2 mr-3">
                          <div 
                            className="bg-blue-600 h-2 rounded-full" 
                            style={{ width: `${((city as any).count / stats.total_leads) * 100}%` }}
                          ></div>
                        </div>
                        <span className="text-sm font-medium text-gray-900 w-8">{(city as any).count}</span>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          </div>

          {/* Property Types & Budget Ranges */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <HomeIcon className="h-5 w-5 mr-2" />
                Property Types
              </h3>
              <div className="space-y-3">
                {Object.entries(stats.property_counts).map(([key, property]) => (
                  <div key={key} className="flex items-center justify-between">
                    <span className="text-sm text-gray-700 capitalize">{(property as any).name}</span>
                    <span className="text-sm font-medium text-gray-900">{(property as any).count}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <IndianRupeeIcon className="h-5 w-5 mr-2" />
                Budget Ranges
              </h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-700">Under ₹50L</span>
                  <span className="text-sm font-medium text-gray-900">{stats.budget_ranges.under_50L}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-700">₹50L - ₹1Cr</span>
                  <span className="text-sm font-medium text-gray-900">{stats.budget_ranges['50L_1Cr']}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-700">₹1Cr - ₹2Cr</span>
                  <span className="text-sm font-medium text-gray-900">{stats.budget_ranges['1Cr_2Cr']}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-700">Above ₹2Cr</span>
                  <span className="text-sm font-medium text-gray-900">{stats.budget_ranges.above_2Cr}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Timeline Analysis */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <CalendarIcon className="h-5 w-5 mr-2" />
              Purchase Timeline
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
              {Object.entries(stats.timeline_counts).map(([key, timeline]) => (
                <div key={key} className="text-center">
                  <div className="text-2xl font-bold text-gray-900">{(timeline as any).count}</div>
                  <div className="text-xs text-gray-600">{(timeline as any).name}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-sm border p-8 text-center">
          <p className="text-gray-600">No data available</p>
        </div>
      )}
    </div>
  )
}