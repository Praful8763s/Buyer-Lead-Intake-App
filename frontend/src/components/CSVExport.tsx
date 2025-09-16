'use client'

import React, { useState } from 'react'
import { Download, FileText, Filter } from 'lucide-react'
import { buyersApi } from '@/lib/api'

interface CSVExportProps {
  filters?: any
  totalCount?: number
}

export default function CSVExport({ filters, totalCount }: CSVExportProps) {
  const [exporting, setExporting] = useState(false)
  const [exportType, setExportType] = useState<'all' | 'filtered'>('all')

  const handleExport = async (type: 'all' | 'filtered' = exportType) => {
    setExporting(true)
    try {
      const params = type === 'filtered' ? filters : {}
      const response = await buyersApi.export(params)

      // Create blob and download
      const blob = new Blob([response.data], { type: 'text/csv' })
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url

      const timestamp = new Date().toISOString().split('T')[0]
      const filename = type === 'filtered'
        ? `buyers-filtered-${timestamp}.csv`
        : `buyers-all-${timestamp}.csv`

      link.download = filename
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)
    } catch (error: any) {
      console.error('Export failed:', error)
      alert('Export failed: ' + (error.message || 'Unknown error'))
    } finally {
      setExporting(false)
    }
  }

  const hasFilters = filters && Object.values(filters).some(value => value)

  return (
    <div className="flex flex-col sm:flex-row gap-2">
      {/* Quick Export Button */}
      <button
        onClick={() => handleExport('all')}
        disabled={exporting}
        className="btn-secondary flex items-center justify-center disabled:opacity-50"
      >
        {exporting ? (
          <>
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600 mr-2"></div>
            Exporting...
          </>
        ) : (
          <>
            <Download className="h-4 w-4 mr-2" />
            Export All
          </>
        )}
      </button>

      {/* Filtered Export (if filters are applied) */}
      {hasFilters && (
        <button
          onClick={() => handleExport('filtered')}
          disabled={exporting}
          className="btn-primary flex items-center justify-center disabled:opacity-50"
        >
          <Filter className="h-4 w-4 mr-2" />
          Export Filtered ({totalCount || 0})
        </button>
      )}

      {/* Export Options Dropdown for larger screens */}
      <div className="hidden lg:block relative">
        <div className="flex items-center space-x-2 text-sm text-gray-600">
          <FileText className="h-4 w-4" />
          <span>CSV format with all fields</span>
        </div>
      </div>
    </div>
  )
}