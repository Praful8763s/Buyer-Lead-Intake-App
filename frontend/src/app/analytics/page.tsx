'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { 
  ArrowLeft, 
  TrendingUp, 
  TrendingDown, 
  BarChart3, 
  PieChart, 
  Calendar,
  Target,
  Users,
  MapPin,
  Home,
  IndianRupee,
  Clock,
  RefreshCw,
  Filter
} from 'lucide-react'
import { buyersApi } from '@/lib/api'

interface AnalyticsData {
  date_range: {
    start_date: string
    end_date: string
    days: number
  }
  total_leads: number
  daily_leads: Record<string, number>
  source_performance: Record<string, {
    name: string
    leads: number
    converted: number
    conversion_rate: number
  }>
  city_performance: Record<string, {
    name: string
    leads: number
    avg_budget: number
    percentage: number
  }>
  property_analysis: Record<string, {
    name: string
    leads: number
    bhk_distribution: Record<string, { name: string; count: number }>
    percentage: number
  }>
  budget_analysis: Record<string, number>
  timeline_urgency: Record<string, {
    name: string
    leads: number
    urgency_score: number
    percentage: number
  }>
}

interface TrendsData {
  monthly_trends: Record<string, {
    total_leads: number
    new: number
    contacted: number
    qualified: number
    converted: number
    lost: number
  }>
  weekly_trends: Record<string, {
    leads: number
    conversion_rate: number
  }>
}

interface ConversionData {
  funnel_stages: {
    total_leads: number
    contacted: number
    qualified: number
    converted: number
  }
  funnel_rates: {
    contact_rate: number
    qualification_rate: number
    conversion_rate: number
  }
  source_conversion: Record<string, {
    name: string
    total_leads: number
    converted: number
    conversion_rate: number
  }>
  avg_conversion_time: Record<string, number>
}

export default function AnalyticsPage() {
  const router = useRouter()
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null)
  const [trends, setTrends] = useState<TrendsData | null>(null)
  const [conversion, setConversion] = useState<ConversionData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [dateRange, setDateRange] = useState(30)
  const [activeTab, setActiveTab] = useState<'overview' | 'trends' | 'conversion'>('overview')

  useEffect(() => {
    fetchAllData()
  }, [dateRange])

  const fetchAllData = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const [analyticsRes, trendsRes, conversionRes] = await Promise.all([
        buyersApi.getAnalytics(dateRange),
        buyersApi.getTrends(),
        buyersApi.getConversion(dateRange)
      ])
      
      setAnalytics(analyticsRes.data)
      setTrends(trendsRes.data)
      setConversion(conversionRes.data)
    } catch (err: any) {
      setError(err.message || 'Failed to load analytics data')
      console.error('Error fetching analytics:', err)
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

  const getPerformanceColor = (rate: number) => {
    if (rate >= 20) return 'text-green-600'
    if (rate >= 10) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getPerformanceIcon = (rate: number) => {
    if (rate >= 10) return <TrendingUp className="h-4 w-4" />
    return <TrendingDown className="h-4 w-4" />
  }

  if (loading) {
    return (
      <div className="px-4 py-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center h-64">
            <RefreshCw className="w-8 h-8 animate-spin text-gray-400 mr-3" />
            <span className="text-gray-600">Loading analytics...</span>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="px-4 py-8">
        <div className="max-w-7xl mx-auto">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <div className="text-red-800">
              <strong>Error loading analytics:</strong> {error}
            </div>
            <button
              onClick={fetchAllData}
              className="mt-3 btn-secondary text-sm"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="px-4 py-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => router.back()}
            className="flex items-center text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back
          </button>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Analytics Dashboard</h1>
              <p className="text-gray-600 mt-2">
                Comprehensive insights into your buyer leads performance
              </p>
            </div>
            <div className="mt-4 sm:mt-0 flex items-center space-x-4">
              <select
                value={dateRange}
                onChange={(e) => setDateRange(Number(e.target.value))}
                className="input-field text-sm"
              >
                <option value={7}>Last 7 days</option>
                <option value={30}>Last 30 days</option>
                <option value={90}>Last 90 days</option>
                <option value={365}>Last year</option>
              </select>
              <button
                onClick={fetchAllData}
                className="btn-secondary flex items-center text-sm"
              >
                <RefreshCw className="h-4 w-4 mr-1" />
                Refresh
              </button>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="border-b border-gray-200 mb-8">
          <nav className="-mb-px flex space-x-8">
            {[
              { key: 'overview', label: 'Overview', icon: BarChart3 },
              { key: 'trends', label: 'Trends', icon: TrendingUp },
              { key: 'conversion', label: 'Conversion', icon: Target }
            ].map(({ key, label, icon: Icon }) => (
              <button
                key={key}
                onClick={() => setActiveTab(key as any)}
                className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center ${
                  activeTab === key
                    ? 'border-primary-500 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Icon className="h-4 w-4 mr-2" />
                {label}
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        {activeTab === 'overview' && analytics && (
          <div className="space-y-8">
            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white rounded-lg shadow-sm border p-6">
                <div className="flex items-center">
                  <Users className="h-8 w-8 text-blue-600" />
                  <div className="ml-4">
                    <div className="text-2xl font-bold text-gray-900">{analytics.total_leads}</div>
                    <div className="text-sm text-gray-600">Total Leads</div>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm border p-6">
                <div className="flex items-center">
                  <Calendar className="h-8 w-8 text-green-600" />
                  <div className="ml-4">
                    <div className="text-2xl font-bold text-gray-900">
                      {Math.round(analytics.total_leads / analytics.date_range.days)}
                    </div>
                    <div className="text-sm text-gray-600">Daily Average</div>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm border p-6">
                <div className="flex items-center">
                  <Target className="h-8 w-8 text-purple-600" />
                  <div className="ml-4">
                    <div className="text-2xl font-bold text-gray-900">
                      {Object.values(analytics.source_performance).reduce((acc, source) => acc + source.converted, 0)}
                    </div>
                    <div className="text-sm text-gray-600">Converted</div>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm border p-6">
                <div className="flex items-center">
                  <IndianRupee className="h-8 w-8 text-orange-600" />
                  <div className="ml-4">
                    <div className="text-lg font-bold text-gray-900">
                      {formatCurrency(
                        Object.values(analytics.city_performance).reduce((acc, city) => acc + city.avg_budget, 0) /
                        Object.values(analytics.city_performance).filter(city => city.avg_budget > 0).length || 0
                      )}
                    </div>
                    <div className="text-sm text-gray-600">Avg Budget</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Source Performance */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
                <BarChart3 className="h-5 w-5 mr-2" />
                Source Performance
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {Object.entries(analytics.source_performance).map(([key, source]) => (
                  <div key={key} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium text-gray-900">{source.name}</h4>
                      <div className={`flex items-center ${getPerformanceColor(source.conversion_rate)}`}>
                        {getPerformanceIcon(source.conversion_rate)}
                        <span className="ml-1 text-sm font-medium">{source.conversion_rate}%</span>
                      </div>
                    </div>
                    <div className="space-y-1 text-sm text-gray-600">
                      <div className="flex justify-between">
                        <span>Total Leads:</span>
                        <span className="font-medium">{source.leads}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Converted:</span>
                        <span className="font-medium">{source.converted}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* City & Property Analysis */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="bg-white rounded-lg shadow-sm border p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
                  <MapPin className="h-5 w-5 mr-2" />
                  City Performance
                </h3>
                <div className="space-y-4">
                  {Object.entries(analytics.city_performance)
                    .sort(([,a], [,b]) => b.leads - a.leads)
                    .map(([key, city]) => (
                      <div key={key} className="flex items-center justify-between">
                        <div>
                          <div className="font-medium text-gray-900">{city.name}</div>
                          <div className="text-sm text-gray-600">
                            {city.leads} leads • Avg: {formatCurrency(city.avg_budget)}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-medium text-gray-900">{city.percentage}%</div>
                          <div className="w-20 bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-blue-600 h-2 rounded-full" 
                              style={{ width: `${city.percentage}%` }}
                            ></div>
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm border p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
                  <Home className="h-5 w-5 mr-2" />
                  Property Types
                </h3>
                <div className="space-y-4">
                  {Object.entries(analytics.property_analysis).map(([key, property]) => (
                    <div key={key} className="border-b border-gray-100 pb-4 last:border-b-0">
                      <div className="flex items-center justify-between mb-2">
                        <div className="font-medium text-gray-900">{property.name}</div>
                        <div className="text-sm text-gray-600">
                          {property.leads} leads ({property.percentage}%)
                        </div>
                      </div>
                      {Object.keys(property.bhk_distribution).length > 0 && (
                        <div className="grid grid-cols-3 gap-2 text-xs">
                          {Object.entries(property.bhk_distribution).map(([bhkKey, bhk]) => (
                            <div key={bhkKey} className="text-center bg-gray-50 rounded p-1">
                              <div className="font-medium">{bhk.count}</div>
                              <div className="text-gray-600">{bhk.name}</div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Budget & Timeline Analysis */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="bg-white rounded-lg shadow-sm border p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
                  <IndianRupee className="h-5 w-5 mr-2" />
                  Budget Distribution
                </h3>
                <div className="space-y-3">
                  {[
                    { key: 'under_25L', label: 'Under ₹25L' },
                    { key: '25L_50L', label: '₹25L - ₹50L' },
                    { key: '50L_75L', label: '₹50L - ₹75L' },
                    { key: '75L_1Cr', label: '₹75L - ₹1Cr' },
                    { key: '1Cr_2Cr', label: '₹1Cr - ₹2Cr' },
                    { key: 'above_2Cr', label: 'Above ₹2Cr' }
                  ].map(({ key, label }) => (
                    <div key={key} className="flex items-center justify-between">
                      <span className="text-sm text-gray-700">{label}</span>
                      <div className="flex items-center">
                        <div className="w-24 bg-gray-200 rounded-full h-2 mr-3">
                          <div 
                            className="bg-green-600 h-2 rounded-full" 
                            style={{ 
                              width: `${(analytics.budget_analysis[key] / analytics.total_leads * 100)}%` 
                            }}
                          ></div>
                        </div>
                        <span className="text-sm font-medium text-gray-900 w-8">
                          {analytics.budget_analysis[key]}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm border p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
                  <Clock className="h-5 w-5 mr-2" />
                  Timeline Urgency
                </h3>
                <div className="space-y-3">
                  {Object.entries(analytics.timeline_urgency)
                    .sort(([,a], [,b]) => b.urgency_score - a.urgency_score)
                    .map(([key, timeline]) => (
                      <div key={key} className="flex items-center justify-between">
                        <div className="flex items-center">
                          <div className={`w-2 h-2 rounded-full mr-3 ${
                            timeline.urgency_score >= 4 ? 'bg-red-500' :
                            timeline.urgency_score >= 3 ? 'bg-yellow-500' :
                            'bg-green-500'
                          }`}></div>
                          <span className="text-sm text-gray-700">{timeline.name}</span>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-medium text-gray-900">{timeline.leads}</div>
                          <div className="text-xs text-gray-500">{timeline.percentage}%</div>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'trends' && trends && (
          <div className="space-y-8">
            {/* Monthly Trends */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">Monthly Trends</h3>
              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-2 text-sm font-medium text-gray-600">Month</th>
                      <th className="text-right py-2 text-sm font-medium text-gray-600">Total</th>
                      <th className="text-right py-2 text-sm font-medium text-gray-600">New</th>
                      <th className="text-right py-2 text-sm font-medium text-gray-600">Contacted</th>
                      <th className="text-right py-2 text-sm font-medium text-gray-600">Qualified</th>
                      <th className="text-right py-2 text-sm font-medium text-gray-600">Converted</th>
                      <th className="text-right py-2 text-sm font-medium text-gray-600">Lost</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Object.entries(trends.monthly_trends)
                      .sort(([a], [b]) => b.localeCompare(a))
                      .slice(0, 6)
                      .map(([month, data]) => (
                        <tr key={month} className="border-b border-gray-100">
                          <td className="py-2 text-sm text-gray-900">{month}</td>
                          <td className="py-2 text-sm text-gray-900 text-right font-medium">{data.total_leads}</td>
                          <td className="py-2 text-sm text-gray-600 text-right">{data.new}</td>
                          <td className="py-2 text-sm text-gray-600 text-right">{data.contacted}</td>
                          <td className="py-2 text-sm text-gray-600 text-right">{data.qualified}</td>
                          <td className="py-2 text-sm text-green-600 text-right font-medium">{data.converted}</td>
                          <td className="py-2 text-sm text-red-600 text-right">{data.lost}</td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Weekly Performance */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">Weekly Performance</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {Object.entries(trends.weekly_trends).map(([week, data]) => (
                  <div key={week} className="text-center border rounded-lg p-4">
                    <div className="text-2xl font-bold text-gray-900">{data.leads}</div>
                    <div className="text-sm text-gray-600 mb-2">{week}</div>
                    <div className={`text-sm font-medium ${getPerformanceColor(data.conversion_rate)}`}>
                      {data.conversion_rate}% conversion
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'conversion' && conversion && (
          <div className="space-y-8">
            {/* Conversion Funnel */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">Conversion Funnel</h3>
              <div className="space-y-4">
                {[
                  { key: 'total_leads', label: 'Total Leads', rate: 100 },
                  { key: 'contacted', label: 'Contacted', rate: conversion.funnel_rates.contact_rate },
                  { key: 'qualified', label: 'Qualified', rate: conversion.funnel_rates.qualification_rate },
                  { key: 'converted', label: 'Converted', rate: conversion.funnel_rates.conversion_rate }
                ].map(({ key, label, rate }) => (
                  <div key={key} className="flex items-center">
                    <div className="w-32 text-sm text-gray-700">{label}</div>
                    <div className="flex-1 mx-4">
                      <div className="bg-gray-200 rounded-full h-8 relative">
                        <div 
                          className="bg-gradient-to-r from-blue-500 to-purple-600 h-8 rounded-full flex items-center justify-center text-white text-sm font-medium"
                          style={{ width: `${rate}%` }}
                        >
                          {rate}%
                        </div>
                      </div>
                    </div>
                    <div className="w-16 text-right text-sm font-medium text-gray-900">
                      {conversion.funnel_stages[key as keyof typeof conversion.funnel_stages]}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Source Conversion */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">Conversion by Source</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {Object.entries(conversion.source_conversion).map(([key, source]) => (
                  <div key={key} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-medium text-gray-900">{source.name}</h4>
                      <div className={`text-sm font-medium ${getPerformanceColor(source.conversion_rate)}`}>
                        {source.conversion_rate}%
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Total:</span>
                        <span className="font-medium">{source.total_leads}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Converted:</span>
                        <span className="font-medium text-green-600">{source.converted}</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-green-600 h-2 rounded-full" 
                          style={{ width: `${source.conversion_rate}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Average Conversion Time */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">Average Conversion Time</h3>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                {Object.entries(conversion.avg_conversion_time).map(([timeline, days]) => (
                  <div key={timeline} className="text-center border rounded-lg p-4">
                    <div className="text-2xl font-bold text-gray-900">{days}</div>
                    <div className="text-sm text-gray-600 mb-1">days</div>
                    <div className="text-xs text-gray-500 capitalize">
                      {timeline.replace('_', ' ')}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}