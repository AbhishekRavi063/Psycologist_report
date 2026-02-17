'use client'

// New client creation page
// Form to create a new client folder

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import SuccessPopup from '@/components/SuccessPopup'

export default function NewClientPage() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    age: '',
    gender: '',
    place: '',
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  const [createdClientId, setCreatedClientId] = useState(null)

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    // Validate required fields
    if (!formData.name.trim()) {
      setError('Name is required')
      setLoading(false)
      return
    }

    try {
      // Get current user session
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      
      if (userError || !user) {
        setError('You must be logged in to create a client')
        setLoading(false)
        return
      }

      // Insert new client
      const { data, error: insertError } = await supabase
        .from('clients')
        .insert([
          {
            psychologist_id: user.id,
            name: formData.name.trim(),
            email: formData.email.trim() || null,
            age: formData.age ? parseInt(formData.age, 10) : null,
            gender: formData.gender.trim() || null,
            place: formData.place.trim() || null,
          },
        ])
        .select()
        .single()

      if (insertError) {
        setError(insertError.message || 'Failed to create client')
        setLoading(false)
        return
      }

      if (data) {
        setCreatedClientId(data.id)
        setShowSuccess(true)
      }
    } catch (err) {
      setError('An unexpected error occurred')
      setLoading(false)
    }
  }

  return (
    <div>
      <div className="mb-6 sm:mb-8">
        <Link
          href="/dashboard/clients"
          className="text-sm text-green-700 hover:text-green-600 mb-4 inline-block"
        >
          ← Back to Clients
        </Link>
        <h2 className="text-xl font-bold text-gray-900 sm:text-2xl">New Client</h2>
        <p className="mt-1 text-sm text-gray-600">
          Create a new client folder
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
              htmlFor="name"
              className="block text-sm font-medium text-gray-700"
            >
              Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="name"
              id="name"
              required
              value={formData.name}
              onChange={handleChange}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-600 focus:border-green-600 sm:text-sm"
            />
          </div>

          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700"
            >
              Email
            </label>
            <input
              type="email"
              name="email"
              id="email"
              value={formData.email}
              onChange={handleChange}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-600 focus:border-green-600 sm:text-sm"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="age"
                className="block text-sm font-medium text-gray-700"
              >
                Age
              </label>
              <input
                type="number"
                name="age"
                id="age"
                min="1"
                max="150"
                value={formData.age}
                onChange={handleChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-600 focus:border-green-600 sm:text-sm"
              />
            </div>

            <div>
              <label
                htmlFor="gender"
                className="block text-sm font-medium text-gray-700"
              >
                Gender
              </label>
              <select
                name="gender"
                id="gender"
                value={formData.gender}
                onChange={handleChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-600 focus:border-green-600 sm:text-sm"
              >
                <option value="">Select...</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
                <option value="Prefer not to say">Prefer not to say</option>
              </select>
            </div>
          </div>

          <div>
            <label
              htmlFor="place"
              className="block text-sm font-medium text-gray-700"
            >
              Place
            </label>
            <input
              type="text"
              name="place"
              id="place"
              value={formData.place}
              onChange={handleChange}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-600 focus:border-green-600 sm:text-sm"
            />
          </div>

          <div className="flex justify-end space-x-3">
            <Link
              href="/dashboard/clients"
              className="px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-600"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-700 hover:bg-green-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-600 disabled:opacity-50"
            >
              {loading ? 'Creating...' : 'Create Client'}
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
          if (createdClientId) window.location.href = `/dashboard/clients/${createdClientId}`
        }}
      />
    </div>
  )
}
