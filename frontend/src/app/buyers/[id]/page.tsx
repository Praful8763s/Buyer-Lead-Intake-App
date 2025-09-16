'use client'

import React, { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { buyersApi } from '@/lib/api'
import { Edit, ArrowLeft } from 'lucide-react'
import Link from 'next/link'

interface Buyer {
  id: string
  full_name: string
  email: string
  phone: string
  city: string
  property_type: string
  bhk?: string
  purpose: string
  budget_min: number
  budget_max: number
  timeline: string
  source: string
  status: string
  notes?: string
  tags: string[]
  created_at: string
  updated_at: string
}

export default function BuyerDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [buyer, setBuyer] = useState<Buyer | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (params.id) {
      fetchBuyer(params.id as string)
    }
  }, [params.id])

  const fetchBuyer = async (id: string) => {
    try {
      const response = await buyersApi.get(id)
      setBuyer(response.data)
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to fetch buyer')
    } finally {
      setLoading(false)
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    )
  }

  if (error || !buyer) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-red-600">{error || 'Buyer not found'}</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center">
            <Link
              href="/buyers"
              className="mr-4 p-2 text-gray-600 hover:text-gray-900"
            >
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <h1 className="text-2xl font-bold text-gray-900">
              {buyer.full_name}
            </h1>
          </div>
          <Link
            href={`/buyers/${buyer.id}/edit`}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700"
          >
            <Edit className="h-4 w-4 mr-2" />
            Edit
          </Link>
        </div>

        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">Contact Information</h2>
          </div>
          <div className="px-6 py-4 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-500">Email</label>
              <p className="mt-1 text-sm text-gray-900">{buyer.email}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-500">Phone</label>
              <p className="mt-1 text-sm text-gray-900">{buyer.phone}</p>
            </div>
          </div>
        </div>

        <div className="mt-6 bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">Property Requirements</h2>
          </div>
          <div className="px-6 py-4 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-500">City</label>
              <p className="mt-1 text-sm text-gray-900 capitalize">{buyer.city}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-500">Property Type</label>
              <p className="mt-1 text-sm text-gray-900 capitalize">{buyer.property_type}</p>
            </div>
            {buyer.bhk && (
              <div>
                <label className="block text-sm font-medium text-gray-500">BHK</label>
                <p className="mt-1 text-sm text-gray-900">{buyer.bhk}</p>
              </div>
            )}
            <div>
              <label className="block text-sm font-medium text-gray-500">Purpose</label>
              <p className="mt-1 text-sm text-gray-900 capitalize">{buyer.purpose}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-500">Budget Range</label>
              <p className="mt-1 text-sm text-gray-900">
                {formatCurrency(buyer.budget_min)} - {formatCurrency(buyer.budget_max)}
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-500">Timeline</label>
              <p className="mt-1 text-sm text-gray-900 capitalize">{buyer.timeline}</p>
            </div>
          </div>
        </div>

        <div className="mt-6 bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">Lead Information</h2>
          </div>
          <div className="px-6 py-4 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-500">Source</label>
              <p className="mt-1 text-sm text-gray-900 capitalize">{buyer.source}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-500">Status</label>
              <p className="mt-1 text-sm text-gray-900 capitalize">{buyer.status}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-500">Created</label>
              <p className="mt-1 text-sm text-gray-900">{formatDate(buyer.created_at)}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-500">Last Updated</label>
              <p className="mt-1 text-sm text-gray-900">{formatDate(buyer.updated_at)}</p>
            </div>
          </div>
          {buyer.notes && (
            <div className="px-6 py-4 border-t border-gray-200">
              <label className="block text-sm font-medium text-gray-500">Notes</label>
              <p className="mt-1 text-sm text-gray-900">{buyer.notes}</p>
            </div>
          )}
          {buyer.tags.length > 0 && (
            <div className="px-6 py-4 border-t border-gray-200">
              <label className="block text-sm font-medium text-gray-500">Tags</label>
              <div className="mt-1 flex flex-wrap gap-2">
                {buyer.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}