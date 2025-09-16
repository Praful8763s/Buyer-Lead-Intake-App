import React from 'react'
import Link from 'next/link'
import { Edit, Eye, Trash2 } from 'lucide-react'

interface Buyer {
  id: string
  full_name: string
  email: string
  phone: string
  city: string
  property_type: string
  budget_min: number
  budget_max: number
  status: string
  created_at: string
}

interface BuyerTableProps {
  buyers: Buyer[]
  onDelete: (id: string) => void
}

export default function BuyerTable({ buyers, onDelete }: BuyerTableProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount)
  }

  const getStatusColor = (status: string) => {
    const colors = {
      new: 'bg-blue-100 text-blue-800',
      contacted: 'bg-yellow-100 text-yellow-800',
      qualified: 'bg-green-100 text-green-800',
      converted: 'bg-purple-100 text-purple-800',
      lost: 'bg-red-100 text-red-800',
    }
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800'
  }

  return (
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
                  {buyer.city}
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {formatCurrency(buyer.budget_min)} - {formatCurrency(buyer.budget_max)}
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(buyer.status)}`}>
                  {buyer.status}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                <div className="flex space-x-2">
                  <Link
                    href={`/buyers/${buyer.id}`}
                    className="text-primary-600 hover:text-primary-900"
                  >
                    <Eye className="h-4 w-4" />
                  </Link>
                  <Link
                    href={`/buyers/${buyer.id}/edit`}
                    className="text-green-600 hover:text-green-900"
                  >
                    <Edit className="h-4 w-4" />
                  </Link>
                  <button
                    onClick={() => onDelete(buyer.id)}
                    className="text-red-600 hover:text-red-900"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}