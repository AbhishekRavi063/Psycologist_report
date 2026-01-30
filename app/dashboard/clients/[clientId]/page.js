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
          className="mt-4 inline-block text-sm text-green-700 hover:text-green-600"
        >
          ← Back to Clients
        </Link>
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
          <Link
            href="/dashboard/clients"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-green-700 transition-colors mb-4 sm:mb-6"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
            Back to Clients
          </Link>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
                {client.name}
              </h1>
              <div className="mt-3 flex flex-wrap gap-2">
                {client.email && (
                  <span className="inline-flex items-center gap-1.5 rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-700">
                    <svg className="h-3.5 w-3.5 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    {client.email}
                  </span>
                )}
                {client.age != null && client.age !== '' && (
                  <span className="inline-flex items-center rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-700">
                    {client.age} yrs
                  </span>
                )}
                {client.gender && (
                  <span className="inline-flex items-center rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-700">
                    {client.gender}
                  </span>
                )}
                {client.place && (
                  <span className="inline-flex items-center gap-1.5 rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-700">
                    <svg className="h-3.5 w-3.5 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    {client.place}
                  </span>
                )}
              </div>
            </div>
            <Link
              href={`/dashboard/clients/${clientId}/sessions/new`}
              className="inline-flex w-full sm:w-auto shrink-0 items-center justify-center gap-2 rounded-xl bg-green-700 px-5 py-3 sm:py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-600 focus:ring-offset-2 transition-colors touch-manipulation"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
              </svg>
              New Session
            </Link>
          </div>
        </div>
      </div>

      {/* Sessions section */}
      <div className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-slate-200/60">
        <div className="border-b border-slate-200/80 bg-slate-50/50 px-4 py-4 sm:px-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between min-w-0">
            <div className="flex items-center gap-3">
              <h2 className="text-lg font-semibold text-slate-900">
                Sessions
              </h2>
              <span className="inline-flex items-center rounded-full bg-green-100 px-3 py-0.5 text-sm font-semibold text-green-800">
                {count} {count === 1 ? 'session' : 'sessions'}
              </span>
            </div>
            <SessionFilter platforms={platforms} currentFilter={platformFilter} clientId={clientId} />
          </div>
        </div>
        <div className="p-0">
          <SessionList
        sessions={sessions}
        clientId={clientId}
        currentPage={page}
        totalPages={totalPages}
        totalCount={count}
        itemsPerPage={itemsPerPage}
        platformFilter={platformFilter}
        onSessionDeleted={(sessionId) => {
          setSessions((prev) => prev.filter((s) => s.id !== sessionId));
          setCount((prev) => Math.max(0, prev - 1));
        }}
      />
        </div>
      </div>
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
