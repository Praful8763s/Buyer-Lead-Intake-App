'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { PlusIcon, SearchIcon } from 'lucide-react'
import { buyersApi } from '@/lib/api'
import { useDebounce } from '@/hooks/useDebounce'


interface Buyer {
  id: string
  full_name: string
  email: string
  phone: string
  city: string
  property_type: string
  budget_min: number
  budget_max: number
  timeline: string
  status: string
  updated_at: string
}

export default function BuyersPage() {
  const [buyers, setBuyers] = useState<Buyer[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filters, setFilters] = useState({
    city: '',
    propertyType: '',
    status: '',
    timeline: '',
  })
  const [pagination, setPagination] = useState({
    page: 1,
    totalPages: 1,
    count: 0,
  })

  const debouncedSearch = useDebounce(search, 500)

  const fetchBuyers = async () => {
    setLoading(true)
    try {
      const params = {
        search: debouncedSearch,
        page: pagination.page,
        ...Object.fromEntries(
          Object.entries(filters).filter(([_, value]) => value)
        ),
      }
      
      const response = await buyersApi.list(params)
      setBuyers(response.data.results)
      setPagination({
        page: pagination.page,
        totalPages: Math.ceil(response.data.count / 10),
        count: response.data.count,
      })
    } catch (error) {
      console.error('Error fetching buyers:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchBuyers()
  }, [debouncedSearch, filters, pagination.page])

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN')
  }

  return (
    <div className="px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Buyer Leads</h1>
          <p className="text-gray-600 mt-2">
            Manage and track your buyer leads
          </p>
        </div>
        <Link href="/buyers/new" className="btn-primary flex items-center">
          <PlusIcon className="w-4 h-4 mr-2" />
          New Lead
        </Link>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div className="relative">
            <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search by name, email, phone..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 input-field"
            />
          </div>
          
          <select
            value={filters.city}
            onChange={(e) => setFilters({ ...filters, city: e.target.value })}
            className="input-field"
          >
            <option value="">All Cities</option>
            <option value="mumbai">Mumbai</option>
            <option value="delhi">Delhi</option>
            <option value="bangalore">Bangalore</option>
            <option value="pune">Pune</option>
            <option value="hyderabad">Hyderabad</option>
          </select>
          
          <select
            value={filters.propertyType}
            onChange={(e) => setFilters({ ...filters, propertyType: e.target.value })}
            className="input-field"
          >
            <option value="">All Property Types</option>
            <option value="apartment">Apartment</option>
            <option value="villa">Villa</option>
            <option value="plot">Plot</option>
            <option value="commercial">Commercial</option>
          </select>
          
          <select
            value={filters.status}
            onChange={(e) => setFilters({ ...filters, status: e.target.value })}
            className="input-field"
          >
            <option value="">All Status</option>
            <option value="new">New</option>
            <option value="contacted">Contacted</option>
            <option value="qualified">Qualified</option>
            <option value="converted">Converted</option>
            <option value="lost">Lost</option>
          </select>
          
          <select
            value={filters.timeline}
            onChange={(e) => setFilters({ ...filters, timeline: e.target.value })}
            className="input-field"
          >
            <option value="">All Timelines</option>
            <option value="immediate">Immediate</option>
            <option value="1month">Within 1 Month</option>
            <option value="3months">Within 3 Months</option>
            <option value="6months">Within 6 Months</option>
            <option value="1year">Within 1 Year</option>
          </select>
        </div>
      </div>

      {/* Results */}
      <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
        {loading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
            <p className="text-gray-600 mt-2">Loading leads...</p>
          </div>
        ) : buyers.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-gray-600">No leads found matching your criteria.</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Contact
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Property
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Budget
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Updated
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {buyers.map((buyer) => (
                    <tr key={buyer.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {buyer.full_name}
                        </div>
                        <div className="text-sm text-gray-500">
                          {buyer.city}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{buyer.email}</div>
                        <div className="text-sm text-gray-500">{buyer.phone}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900 capitalize">
                          {buyer.property_type}
                        </div>
                        <div className="text-sm text-gray-500 capitalize">
                          {buyer.timeline}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatCurrency(buyer.budget_min)} - {formatCurrency(buyer.budget_max)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          buyer.status === 'new' ? 'bg-blue-100 text-blue-800' :
                          buyer.status === 'contacted' ? 'bg-yellow-100 text-yellow-800' :
                          buyer.status === 'qualified' ? 'bg-green-100 text-green-800' :
                          buyer.status === 'converted' ? 'bg-purple-100 text-purple-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {buyer.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(buyer.updated_at)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <Link
                          href={`/buyers/${buyer.id}`}
                          className="text-primary-600 hover:text-primary-900 mr-4"
                        >
                          View
                        </Link>
                        <Link
                          href={`/buyers/${buyer.id}/edit`}
                          className="text-primary-600 hover:text-primary-900"
                        >
                          Edit
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <div className="px-6 py-3 border-t border-gray-200 flex items-center justify-between">
                <div className="text-sm text-gray-700">
                  Showing {buyers.length} of {pagination.count} results
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => setPagination({ ...pagination, page: pagination.page - 1 })}
                    disabled={pagination.page === 1}
                    className="btn-secondary disabled:opacity-50"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => setPagination({ ...pagination, page: pagination.page + 1 })}
                    disabled={pagination.page === pagination.totalPages}
                    className="btn-secondary disabled:opacity-50"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}