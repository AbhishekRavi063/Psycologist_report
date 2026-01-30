'use client'

// Clients list page
// Shows all clients with search and pagination

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import ClientSearch from '@/components/ClientSearch'
import ClientList from '@/components/ClientList'

function ClientsPageContent() {
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
    <div className="space-y-6">
      {/* Header card */}
      <div className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-slate-200/60">
        <div className="h-1 w-full bg-gradient-to-r from-green-600 via-green-700 to-green-800" />
        <div className="px-4 py-6 sm:px-8 sm:py-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
                Clients
              </h1>
              <p className="mt-1 text-sm text-slate-600">
                Manage your client folders
              </p>
            </div>
            <Link
              href="/dashboard/clients/new"
              className="inline-flex w-full sm:w-auto shrink-0 items-center justify-center gap-2 rounded-xl bg-green-700 px-5 py-3 sm:py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-600 focus:ring-offset-2 transition-colors touch-manipulation"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
              </svg>
              New Client
            </Link>
          </div>
        </div>
      </div>

      {/* Client list card */}
      <div className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-slate-200/60">
        <div className="border-b border-slate-200/80 bg-slate-50/50 px-4 py-4 sm:px-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-wrap items-center gap-2 sm:gap-3 min-w-0">
              <h2 className="text-base sm:text-lg font-semibold text-slate-900">
                All clients
              </h2>
              <span className="inline-flex items-center rounded-full bg-green-100 px-3 py-0.5 text-sm font-semibold text-green-800">
                {count} {count === 1 ? 'client' : 'clients'}
              </span>
            </div>
            <ClientSearch initialSearch={search} />
          </div>
        </div>
        <div className="min-w-0 px-4 pb-6 sm:px-8 sm:pb-8">
          <ClientList
            clients={clients}
            currentPage={page}
            totalPages={totalPages}
            totalCount={count}
            itemsPerPage={itemsPerPage}
            search={search}
            embedded
            onClientDeleted={(clientId) => {
              setClients((prev) => prev.filter((c) => c.id !== clientId));
              setCount((prev) => Math.max(0, prev - 1));
            }}
          />
        </div>
      </div>
    </div>
  )
}

export default function ClientsPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center py-12">
        <p className="text-gray-600">Loading...</p>
      </div>
    }>
      <ClientsPageContent />
    </Suspense>
  )
}
