'use client'

// Clients list page
// Shows all clients with search and pagination

import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import ClientSearch from '@/components/ClientSearch'
import ClientList from '@/components/ClientList'

export default function ClientsPage() {
  const searchParams = useSearchParams()
  const [user, setUser] = useState(null)
  const [clients, setClients] = useState([])
  const [loading, setLoading] = useState(true)
  const [count, setCount] = useState(0)

  const page = parseInt(searchParams?.get('page') || '1', 10)
  const search = searchParams?.get('search') || ''
  const itemsPerPage = 10
  const offset = (page - 1) * itemsPerPage

  useEffect(() => {
    const loadClients = async () => {
      try {
        // Get current user
        const { data: { user: currentUser } } = await supabase.auth.getUser()
        
        if (!currentUser) {
          setLoading(false)
          return
        }

        setUser(currentUser)

        // Build query
        let query = supabase
          .from('clients')
          .select('*', { count: 'exact' })
          .eq('psychologist_id', currentUser.id)
          .order('created_at', { ascending: false })

        // Apply search filter
        if (search) {
          query = query.ilike('name', `%${search}%`)
        }

        // Get total count
        const { count: totalCount } = await query

        // Apply pagination
        const { data: clientsData, error } = await query
          .range(offset, offset + itemsPerPage - 1)

        if (error) {
          console.error('Error fetching clients:', error)
        } else {
          setClients(clientsData || [])
          setCount(totalCount || 0)
        }
      } catch (error) {
        console.error('Error loading clients:', error)
      } finally {
        setLoading(false)
      }
    }

    loadClients()
  }, [page, search, offset, itemsPerPage])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-gray-600">Loading...</p>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-gray-600">Please log in to view clients</p>
      </div>
    )
  }

  const totalPages = Math.ceil(count / itemsPerPage)

  return (
    <div>
      <div className="mb-6 sm:mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Clients</h2>
          <p className="mt-1 text-xs sm:text-sm text-gray-600">
            Manage your client folders
          </p>
        </div>
        <Link
          href="/dashboard/clients/new"
          className="w-full sm:w-auto inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          + New Client
        </Link>
      </div>

      <ClientSearch initialSearch={search} />

      <ClientList
        clients={clients}
        currentPage={page}
        totalPages={totalPages}
        search={search}
      />
    </div>
  )
}
