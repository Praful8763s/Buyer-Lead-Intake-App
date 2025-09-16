'use client'

import React, { useState } from 'react'
import { Upload, Download, FileText, CheckCircle, XCircle, AlertCircle } from 'lucide-react'
import { buyersApi } from '@/lib/api'

interface ImportResult {
  total_rows: number
  valid_rows: number
  invalid_rows: number
  errors: Array<{
    row: number
    error: string
    data: any
  }>
  created_buyers: string[]
}

interface CSVImportProps {
  onImportComplete: () => void
}

export default function CSVImport({ onImportComplete }: CSVImportProps) {
  const [file, setFile] = useState<File | null>(null)
  const [importing, setImporting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<ImportResult | null>(null)
  const [showErrors, setShowErrors] = useState(false)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile) {
      if (!selectedFile.name.toLowerCase().endsWith('.csv')) {
        setError('Please select a CSV file')
        return
      }
      if (selectedFile.size > 5 * 1024 * 1024) { // 5MB limit
        setError('File size too large. Maximum 5MB allowed.')
        return
      }
      setFile(selectedFile)
      setError(null)
      setResult(null)
    }
  }

  const handleImport = async () => {
    if (!file) return

    setImporting(true)
    setError(null)
    setResult(null)

    try {
      const response = await buyersApi.import(file)
      const importResult = response.data
      
      if (importResult.error) {
        setError(importResult.error)
      } else {
        setResult(importResult)
        if (importResult.valid_rows > 0) {
          onImportComplete()
        }
      }
    } catch (err: any) {
      setError(err.response?.data?.error || err.message || 'Import failed')
    } finally {
      setImporting(false)
    }
  }

  const downloadTemplate = async () => {
    try {
      const response = await buyersApi.downloadTemplate()
      const blob = new Blob([response.data], { type: 'text/csv' })
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = 'buyer_leads_template.csv'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)
    } catch (err) {
      console.error('Failed to download template:', err)
    }
  }

  const resetImport = () => {
    setFile(null)
    setError(null)
    setResult(null)
    setShowErrors(false)
    const fileInput = document.getElementById('csv-file') as HTMLInputElement
    if (fileInput) fileInput.value = ''
  }

  return (
    <div className="space-y-6">
      {/* Template Download */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center mb-3 sm:mb-0">
            <FileText className="h-5 w-5 text-blue-600 mr-2" />
            <div>
              <h3 className="text-sm font-medium text-blue-900">Need a template?</h3>
              <p className="text-sm text-blue-700">Download our CSV template with sample data</p>
            </div>
          </div>
          <button
            onClick={downloadTemplate}
            className="btn-secondary flex items-center text-sm"
          >
            <Download className="h-4 w-4 mr-1" />
            Download Template
          </button>
        </div>
      </div>

      {/* File Upload */}
      <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 hover:border-gray-400 transition-colors">
        <div className="text-center">
          <Upload className="mx-auto h-12 w-12 text-gray-400" />
          <div className="mt-4">
            <label htmlFor="csv-file" className="cursor-pointer">
              <span className="mt-2 block text-sm font-medium text-gray-900">
                {file ? 'Change CSV File' : 'Select CSV File'}
              </span>
              <input
                id="csv-file"
                type="file"
                accept=".csv"
                onChange={handleFileChange}
                className="hidden"
              />
            </label>
            <p className="mt-1 text-xs text-gray-500">
              Maximum 200 rows, 5MB file size limit
            </p>
          </div>

          {file && (
            <div className="mt-4 p-3 bg-gray-50 rounded-md">
              <p className="text-sm text-gray-700 font-medium">
                📄 {file.name}
              </p>
              <p className="text-xs text-gray-500">
                {(file.size / 1024).toFixed(1)} KB
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Action Buttons */}
      {file && !result && (
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={handleImport}
            disabled={importing}
            className="btn-primary flex items-center justify-center disabled:opacity-50"
          >
            {importing ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Importing...
              </>
            ) : (
              <>
                <Upload className="h-4 w-4 mr-2" />
                Import CSV
              </>
            )}
          </button>
          <button
            onClick={resetImport}
            className="btn-secondary"
            disabled={importing}
          >
            Cancel
          </button>
        </div>
      )}

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-start">
            <XCircle className="h-5 w-5 text-red-600 mt-0.5 mr-3 flex-shrink-0" />
            <div>
              <h3 className="text-sm font-medium text-red-900">Import Failed</h3>
              <p className="text-sm text-red-700 mt-1">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Success/Results Display */}
      {result && (
        <div className="space-y-4">
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-start">
              <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 mr-3 flex-shrink-0" />
              <div className="flex-1">
                <h3 className="text-sm font-medium text-green-900">Import Completed</h3>
                <div className="mt-2 text-sm text-green-700">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <span className="font-medium">Total Rows:</span> {result.total_rows}
                    </div>
                    <div>
                      <span className="font-medium text-green-800">Imported:</span> {result.valid_rows}
                    </div>
                    <div>
                      <span className="font-medium text-red-800">Failed:</span> {result.invalid_rows}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Error Details */}
          {result.invalid_rows > 0 && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-start justify-between">
                <div className="flex items-start">
                  <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5 mr-3 flex-shrink-0" />
                  <div>
                    <h3 className="text-sm font-medium text-yellow-900">
                      {result.invalid_rows} rows had errors
                    </h3>
                    <p className="text-sm text-yellow-700 mt-1">
                      These rows were skipped during import
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setShowErrors(!showErrors)}
                  className="text-sm text-yellow-800 hover:text-yellow-900 font-medium"
                >
                  {showErrors ? 'Hide' : 'Show'} Details
                </button>
              </div>

              {showErrors && (
                <div className="mt-4 max-h-60 overflow-y-auto">
                  <div className="space-y-2">
                    {result.errors.map((error, index) => (
                      <div key={index} className="bg-white p-3 rounded border text-xs">
                        <div className="font-medium text-red-800">Row {error.row}:</div>
                        <div className="text-red-700 mt-1">{error.error}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Reset Button */}
          <button
            onClick={resetImport}
            className="btn-secondary w-full sm:w-auto"
          >
            Import Another File
          </button>
        </div>
      )}
    </div>
  )
}