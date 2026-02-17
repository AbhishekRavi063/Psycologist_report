'use client'

// New session creation page
// Form to create a new session file inside a client folder

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import SuccessPopup from '@/components/SuccessPopup'

export default function NewSessionPage() {
  const router = useRouter()
  const params = useParams()
  const clientId = params.clientId

  const [formData, setFormData] = useState({
    platform: '',
    customPlatform: '',
    session_date: '',
    summary: '',
    conditions: '',
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  const [existingPlatforms, setExistingPlatforms] = useState([])
  const [showCustomPlatform, setShowCustomPlatform] = useState(false)

  useEffect(() => {
    // Fetch existing platforms for this client
    const fetchPlatforms = async () => {
      const { data } = await supabase
        .from('sessions')
        .select('platform')
        .eq('client_id', clientId)

      if (data) {
        const platforms = [...new Set(data.map(s => s.platform))].sort()
        setExistingPlatforms(platforms)
      }
    }

    fetchPlatforms()
  }, [clientId])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))

    // Show custom platform input if "Other" is selected
    if (name === 'platform' && value === 'Other') {
      setShowCustomPlatform(true)
    } else if (name === 'platform') {
      setShowCustomPlatform(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    // Validate required fields
    if (!formData.platform) {
      setError('Platform is required')
      setLoading(false)
      return
    }

    if (formData.platform === 'Other' && !formData.customPlatform.trim()) {
      setError('Please specify the custom platform name')
      setLoading(false)
      return
    }

    if (!formData.session_date) {
      setError('Session date is required')
      setLoading(false)
      return
    }

    try {
      // Determine the platform to use
      const platform = formData.platform === 'Other' 
        ? formData.customPlatform.trim() 
        : formData.platform

      // Insert new session
      const { data, error: insertError } = await supabase
        .from('sessions')
        .insert([
          {
            client_id: clientId,
            platform: platform,
            session_date: formData.session_date,
            session_time: '00:00:00', // Default time since not required
            summary: formData.summary.trim() || null,
            conditions: formData.conditions.trim() || null,
          },
        ])
        .select()
        .single()

      if (insertError) {
        setError(insertError.message || 'Failed to create session')
        setLoading(false)
        return
      }

      if (data) {
        setShowSuccess(true)
      }
    } catch (err) {
      setError('An unexpected error occurred')
      setLoading(false)
    }
  }

  // Get today's date in YYYY-MM-DD format for the date input
  const today = new Date().toISOString().split('T')[0]

  return (
    <div>
      <div className="mb-6 sm:mb-8">
        <Link
          href={`/dashboard/clients/${clientId}`}
          className="text-sm text-green-700 hover:text-green-600 mb-4 inline-block"
        >
          ← Back to Client
        </Link>
        <h2 className="text-xl font-bold text-gray-900 sm:text-2xl">New Session</h2>
        <p className="mt-1 text-sm text-gray-600">
          Add a new session file
        </p>
      </div>

      <div className="relative">
        <div className="absolute right-0 bottom-full flex flex-col justify-end">
          <img src="/line.png" alt="" className="block max-h-80 sm:max-h-96 w-auto object-contain" />
        </div>
        <div className="bg-white shadow rounded-lg p-4 sm:p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-400 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}

          <div>
            <label
              htmlFor="platform"
              className="block text-sm font-medium text-gray-700"
            >
              Platform <span className="text-red-500">*</span>
            </label>
            <select
              name="platform"
              id="platform"
              required
              value={formData.platform}
              onChange={handleChange}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-600 focus:border-green-600 sm:text-sm"
            >
              <option value="">Select platform...</option>
              <option value="koott">koott</option>
              <option value="littlecare">littlecare</option>
              {existingPlatforms
                .filter(p => p !== 'koott' && p !== 'littlecare')
                .map((platform) => (
                  <option key={platform} value={platform}>
                    {platform}
                  </option>
                ))}
              <option value="Other">Other (specify)</option>
            </select>
          </div>

          {showCustomPlatform && (
            <div>
              <label
                htmlFor="customPlatform"
                className="block text-sm font-medium text-gray-700"
              >
                Custom Platform Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="customPlatform"
                id="customPlatform"
                required={showCustomPlatform}
                value={formData.customPlatform}
                onChange={handleChange}
                placeholder="Enter platform name"
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-600 focus:border-green-600 sm:text-sm"
              />
            </div>
          )}

          <div>
            <label
              htmlFor="session_date"
              className="block text-sm font-medium text-gray-700"
            >
              Session Date <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              name="session_date"
              id="session_date"
              required
              max={today}
              value={formData.session_date}
              onChange={handleChange}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-600 focus:border-green-600 sm:text-sm"
            />
          </div>

          <div>
            <label
              htmlFor="summary"
              className="block text-sm font-medium text-gray-700"
            >
              Summary
            </label>
            <textarea
              name="summary"
              id="summary"
              rows={4}
              value={formData.summary}
              onChange={handleChange}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-600 focus:border-green-600 sm:text-sm"
              placeholder="Session summary..."
            />
          </div>

          <div>
            <label
              htmlFor="conditions"
              className="block text-sm font-medium text-gray-700"
            >
              Conditions
            </label>
            <textarea
              name="conditions"
              id="conditions"
              rows={3}
              value={formData.conditions}
              onChange={handleChange}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-600 focus:border-green-600 sm:text-sm"
              placeholder="Conditions or notes..."
            />
          </div>

          <div className="flex justify-end space-x-3">
            <Link
              href={`/dashboard/clients/${clientId}`}
              className="px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-600"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-700 hover:bg-green-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-600 disabled:opacity-50"
            >
              {loading ? 'Creating...' : 'Create Session'}
            </button>
          </div>
          <div className="-mt-px flex justify-end">
            <img src="/button%20above.png" alt="" className="h-20 w-auto object-contain sm:h-28" />
          </div>
        </form>
        </div>
      </div>

      <SuccessPopup
        open={showSuccess}
        onClose={() => {
          setShowSuccess(false)
          window.location.href = `/dashboard/clients/${clientId}`
        }}
      />
    </div>
  )
}
