'use client'

// Client search component
// Allows searching clients by name

import { useRouter, useSearchParams } from 'next/navigation'
import { useState, useEffect } from 'react'

export default function ClientSearch({ initialSearch = '' }) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [search, setSearch] = useState(initialSearch)

  useEffect(() => {
    setSearch(initialSearch)
  }, [initialSearch])

  const handleSubmit = (e) => {
    e.preventDefault()
    const params = new URLSearchParams(searchParams.toString())
    
    if (search.trim()) {
      params.set('search', search.trim())
    } else {
      params.delete('search')
    }
    
    // Reset to page 1 when searching
    params.set('page', '1')
    
    router.push(`/dashboard/clients?${params.toString()}`)
  }

  const handleClear = () => {
    setSearch('')
    const params = new URLSearchParams(searchParams.toString())
    params.delete('search')
    params.set('page', '1')
    router.push(`/dashboard/clients?${params.toString()}`)
  }

  return (
    <form onSubmit={handleSubmit} className="mb-6">
      <div className="flex gap-2">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search clients by name..."
          className="flex-1 px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
        />
        <button
          type="submit"
          className="px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          Search
        </button>
        {search && (
          <button
            type="button"
            onClick={handleClear}
            className="px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Clear
          </button>
        )}
      </div>
    </form>
  )
}
