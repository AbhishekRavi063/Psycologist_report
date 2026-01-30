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
    <div className="flex items-center gap-2">
      <label htmlFor="platform-filter" className="text-sm font-medium text-slate-600 whitespace-nowrap">
        Platform
      </label>
      <select
        id="platform-filter"
        value={currentFilter}
        onChange={handleFilterChange}
        className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 shadow-sm focus:border-green-600 focus:outline-none focus:ring-1 focus:ring-green-600 min-w-[140px]"
      >
        <option value="">All</option>
        {platforms.map((platform) => (
          <option key={platform} value={platform}>
            {platform}
          </option>
        ))}
      </select>
    </div>
  )
}
