'use client'

// Client detail page
// Shows client information and list of sessions

import { useState, useEffect, Suspense } from 'react'
import { useParams, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import SessionList from '@/components/SessionList'
import SessionFilter from '@/components/SessionFilter'

function ClientDetailPageContent() {
  const params = useParams()
  const searchParams = useSearchParams()
  const clientId = params.clientId

  const [user, setUser] = useState(null)
  const [client, setClient] = useState(null)
  const [sessions, setSessions] = useState([])
  const [platforms, setPlatforms] = useState([])
  const [loading, setLoading] = useState(true)
  const [count, setCount] = useState(0)

  const page = parseInt(searchParams?.get('page') || '1', 10)
  const platformFilter = searchParams?.get('platform') || ''
  const itemsPerPage = 10
  const offset = (page - 1) * itemsPerPage

  useEffect(() => {
    const loadData = async () => {
      try {
        // Get current user
        const { data: { user: currentUser } } = await supabase.auth.getUser()
        
        if (!currentUser) {
          setLoading(false)
          return
        }

        setUser(currentUser)

        // Fetch client details
        const { data: clientData, error: clientError } = await supabase
          .from('clients')
          .select('*')
          .eq('id', clientId)
          .eq('psychologist_id', currentUser.id)
          .single()

        if (clientError || !clientData) {
          setLoading(false)
          return
        }

        setClient(clientData)

        // Build sessions query
        let sessionsQuery = supabase
          .from('sessions')
          .select('*', { count: 'exact' })
          .eq('client_id', clientId)
          .order('session_date', { ascending: false })
          .order('session_time', { ascending: false })

        // Apply platform filter
        if (platformFilter) {
          sessionsQuery = sessionsQuery.eq('platform', platformFilter)
        }

        // Get total count
        const { count: totalCount } = await sessionsQuery

        // Apply pagination
        const { data: sessionsData, error: sessionsError } = await sessionsQuery
          .range(offset, offset + itemsPerPage - 1)

        if (sessionsError) {
          console.error('Error fetching sessions:', sessionsError)
        } else {
          setSessions(sessionsData || [])
          setCount(totalCount || 0)
        }

        // Get all unique platforms for filter dropdown
        const { data: allSessions } = await supabase
          .from('sessions')
          .select('platform')
          .eq('client_id', clientId)

        if (allSessions) {
          const uniquePlatforms = [...new Set(allSessions.map(s => s.platform))].sort()
          setPlatforms(uniquePlatforms)
        }
      } catch (error) {
        console.error('Error loading client data:', error)
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [clientId, page, platformFilter, offset, itemsPerPage])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-gray-600">Loading...</p>
      </div>
    )
  }

  if (!client) {
    return (
      <div className="bg-white shadow rounded-lg p-8 text-center">
        <h3 className="text-lg font-medium text-gray-900">Client not found</h3>
        <p className="mt-2 text-sm text-gray-500">
          The client you're looking for doesn't exist or you don't have access to it.
        </p>
        <Link
          href="/dashboard/clients"
          className="mt-4 inline-block text-sm text-indigo-600 hover:text-indigo-500"
        >
          ← Back to Clients
        </Link>
      </div>
    )
  }

  const totalPages = Math.ceil(count / itemsPerPage)

  return (
    <div>
      <div className="mb-8">
        <Link
          href="/dashboard/clients"
          className="text-sm text-indigo-600 hover:text-indigo-500 mb-4 inline-block"
        >
          ← Back to Clients
        </Link>
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">{client.name}</h2>
            <div className="mt-2 text-sm text-gray-600">
              {client.email && <span className="mr-4">Email: {client.email}</span>}
              {client.age && <span className="mr-4">Age: {client.age}</span>}
              {client.gender && <span className="mr-4">Gender: {client.gender}</span>}
              {client.place && <span>Place: {client.place}</span>}
            </div>
          </div>
          <Link
            href={`/dashboard/clients/${clientId}/sessions/new`}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            + New Session
          </Link>
        </div>
      </div>

      <SessionFilter platforms={platforms} currentFilter={platformFilter} clientId={clientId} />

      <SessionList
        sessions={sessions}
        clientId={clientId}
        currentPage={page}
        totalPages={totalPages}
        platformFilter={platformFilter}
      />
    </div>
  )
}

export default function ClientDetailPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center py-12">
        <p className="text-gray-600">Loading...</p>
      </div>
    }>
      <ClientDetailPageContent />
    </Suspense>
  )
}
