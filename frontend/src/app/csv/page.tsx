'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Upload, Download, FileText, Info } from 'lucide-react'
import CSVImport from '@/components/CSVImport'
import CSVExport from '@/components/CSVExport'

export default function CSVManagementPage() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<'import' | 'export'>('import')

  const handleImportComplete = () => {
    // Optionally redirect to buyers page or show success message
    setTimeout(() => {
      router.push('/buyers')
    }, 2000)
  }

  return (
    <div className="px-4 py-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => router.back()}
            className="flex items-center text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back
          </button>
          <h1 className="text-3xl font-bold text-gray-900">CSV Management</h1>
          <p className="text-gray-600 mt-2">
            Import buyer leads from CSV files or export your existing data
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="border-b border-gray-200 mb-8">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('import')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'import'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <Upload className="h-4 w-4 inline mr-2" />
              Import CSV
            </button>
            <button
              onClick={() => setActiveTab('export')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'export'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <Download className="h-4 w-4 inline mr-2" />
              Export CSV
            </button>
          </nav>
        </div>

        {/* Tab Content */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          {activeTab === 'import' && (
            <div>
              <div className="mb-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-2">Import Buyer Leads</h2>
                <p className="text-gray-600">
                  Upload a CSV file to bulk import buyer leads into your system
                </p>
              </div>

              {/* Import Guidelines */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                <div className="flex items-start">
                  <Info className="h-5 w-5 text-blue-600 mt-0.5 mr-3 flex-shrink-0" />
                  <div>
                    <h3 className="text-sm font-medium text-blue-900 mb-2">Import Guidelines</h3>
                    <ul className="text-sm text-blue-800 space-y-1">
                      <li>• Maximum 200 rows per file</li>
                      <li>• File size limit: 5MB</li>
                      <li>• Required fields: full_name, email, phone, city, property_type, purpose, budget_min, budget_max, timeline, source</li>
                      <li>• BHK is required for apartments and villas</li>
                      <li>• Use the template for correct format</li>
                    </ul>
                  </div>
                </div>
              </div>

              <CSVImport onImportComplete={handleImportComplete} />
            </div>
          )}

          {activeTab === 'export' && (
            <div>
              <div className="mb-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-2">Export Buyer Leads</h2>
                <p className="text-gray-600">
                  Download your buyer leads data as a CSV file for backup or analysis
                </p>
              </div>

              {/* Export Options */}
              <div className="space-y-6">
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                  <div className="flex items-start">
                    <FileText className="h-5 w-5 text-gray-600 mt-0.5 mr-3 flex-shrink-0" />
                    <div>
                      <h3 className="text-sm font-medium text-gray-900 mb-2">Export Information</h3>
                      <ul className="text-sm text-gray-700 space-y-1">
                        <li>• Includes all buyer lead fields</li>
                        <li>• Compatible with Excel and Google Sheets</li>
                        <li>• Respects current filters if applied</li>
                        <li>• File format: CSV (UTF-8)</li>
                      </ul>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-4">
                  <CSVExport />
                  <div className="text-sm text-gray-500 flex items-center">
                    <FileText className="h-4 w-4 mr-1" />
                    Files are downloaded to your default download folder
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="mt-8 bg-gray-50 rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Quick Actions</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <button
              onClick={() => router.push('/buyers')}
              className="flex items-center p-3 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <FileText className="h-5 w-5 text-gray-600 mr-3" />
              <div className="text-left">
                <div className="text-sm font-medium text-gray-900">View All Leads</div>
                <div className="text-xs text-gray-500">Browse imported leads</div>
              </div>
            </button>
            
            <button
              onClick={() => router.push('/buyers/new')}
              className="flex items-center p-3 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Upload className="h-5 w-5 text-gray-600 mr-3" />
              <div className="text-left">
                <div className="text-sm font-medium text-gray-900">Add Single Lead</div>
                <div className="text-xs text-gray-500">Manual entry form</div>
              </div>
            </button>
            
            <button
              onClick={() => router.push('/')}
              className="flex items-center p-3 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <ArrowLeft className="h-5 w-5 text-gray-600 mr-3" />
              <div className="text-left">
                <div className="text-sm font-medium text-gray-900">Dashboard</div>
                <div className="text-xs text-gray-500">Return to home</div>
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}