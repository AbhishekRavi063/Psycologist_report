'use client'

// Main dashboard page
// Shows overview and quick links to clients

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'

export default function DashboardPage() {
  const [user, setUser] = useState(null)
  const [clientsCount, setClientsCount] = useState(0)
  const [sessionsCount, setSessionsCount] = useState(0)
  const [loading, setLoading] = useState(true)

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

        // Get total clients count
        const { count: clients } = await supabase
          .from('clients')
          .select('*', { count: 'exact', head: true })
          .eq('psychologist_id', currentUser.id)

        setClientsCount(clients || 0)

        // Get total sessions count
        const { data: clientList } = await supabase
          .from('clients')
          .select('id')
          .eq('psychologist_id', currentUser.id)

        let totalSessions = 0
        if (clientList && clientList.length > 0) {
          const clientIds = clientList.map(c => c.id)
          const { count } = await supabase
            .from('sessions')
            .select('*', { count: 'exact', head: true })
            .in('client_id', clientIds)
          totalSessions = count || 0
        }
        setSessionsCount(totalSessions)
      } catch (error) {
        console.error('Error loading dashboard data:', error)
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-gray-600">Loading...</p>
      </div>
    )
  }

  return (
    <div>
      <div className="mb-6 sm:mb-8">
        <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Welcome back!</h2>
        <p className="mt-1 text-xs sm:text-sm text-gray-600">
          Manage your clients and sessions
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 mb-6 sm:mb-8">
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg
                  className="h-6 w-6 text-gray-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"
                  />
                </svg>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Total Clients
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {clientsCount}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg
                  className="h-6 w-6 text-gray-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Total Sessions
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {sessionsCount}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap gap-4">
        <Link
          href="/dashboard/clients/new"
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          + New Client
        </Link>
        <Link
          href="/dashboard/clients"
          className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          View All Clients
        </Link>
      </div>
    </div>
  )
}
