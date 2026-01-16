'use client'

// Session filter component
// Allows filtering sessions by platform

import { useRouter, useSearchParams } from 'next/navigation'

export default function SessionFilter({ platforms, currentFilter, clientId }) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const handleFilterChange = (e) => {
    const platform = e.target.value
    const params = new URLSearchParams(searchParams.toString())
    
    if (platform) {
      params.set('platform', platform)
    } else {
      params.delete('platform')
    }
    
    // Reset to page 1 when filtering
    params.set('page', '1')
    
    router.push(`/dashboard/clients/${clientId}?${params.toString()}`)
  }

  if (platforms.length === 0) {
    return null
  }

  return (
    <div className="mb-6">
      <label htmlFor="platform-filter" className="block text-sm font-medium text-gray-700 mb-2">
        Filter by Platform
      </label>
      <select
        id="platform-filter"
        value={currentFilter}
        onChange={handleFilterChange}
        className="block w-full sm:w-64 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
      >
        <option value="">All Platforms</option>
        {platforms.map((platform) => (
          <option key={platform} value={platform}>
            {platform}
          </option>
        ))}
      </select>
    </div>
  )
}
