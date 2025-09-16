'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import BuyerForm from '@/components/forms/BuyerForm'
import { buyersApi } from '@/lib/api'
import { BuyerFormData } from '@/lib/validation'
import ProtectedRoute from '@/components/ProtectedRoute'

export default function NewBuyerPage() {
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = async (data: BuyerFormData) => {
    setIsLoading(true)
    try {
      await buyersApi.create(data)
      router.push('/buyers')
    } catch (error: any) {
      console.error('Error creating buyer:', error)
      
      // Show detailed error message
      let errorMessage = 'Failed to create buyer lead'
      if (error.response?.data) {
        if (typeof error.response.data === 'string') {
          errorMessage = error.response.data
        } else if (error.response.data.message) {
          errorMessage = error.response.data.message
        } else if (error.response.data.detail) {
          errorMessage = error.response.data.detail
        } else {
          // Handle validation errors
          const errors = Object.entries(error.response.data)
            .map(([field, messages]) => `${field}: ${Array.isArray(messages) ? messages.join(', ') : messages}`)
            .join('\n')
          errorMessage = errors || errorMessage
        }
      } else if (error.message) {
        errorMessage = error.message
      }
      
      alert(`Error: ${errorMessage}`)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Create New Lead</h1>
          <p className="text-gray-600 mt-2">
            Add a new buyer lead to your database
          </p>
        </div>

        <div className="bg-white shadow-sm rounded-lg p-6">
          <BuyerForm onSubmit={handleSubmit} isLoading={isLoading} />
        </div>
      </div>
    </div>
  )
}