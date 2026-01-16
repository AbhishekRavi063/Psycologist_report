// Session list component
// Displays sessions in a file-like view with pagination

import { useState } from 'react'
import Link from 'next/link'

export default function SessionList({ sessions, clientId, currentPage, totalPages, platformFilter }) {
  const [selectedSession, setSelectedSession] = useState(null)
  if (!sessions || sessions.length === 0) {
    return (
      <div className="bg-white shadow rounded-lg p-8 text-center">
        <svg
          className="mx-auto h-12 w-12 text-gray-400"
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
        <h3 className="mt-2 text-sm font-medium text-gray-900">No sessions</h3>
        <p className="mt-1 text-sm text-gray-500">
          {platformFilter ? 'No sessions found for this platform.' : 'Get started by creating a new session.'}
        </p>
      </div>
    )
  }

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A'
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  const formatTime = (timeString) => {
    if (!timeString) return ''
    // Time format is HH:MM:SS, convert to HH:MM
    // Only show time if it's not the default midnight time
    const [hours, minutes] = timeString.split(':')
    if (hours === '00' && minutes === '00') return ''
    return `${hours}:${minutes}`
  }

  return (
    <div>
      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <ul className="divide-y divide-gray-200">
          {sessions.map((session) => (
            <li key={session.id}>
              <div className="px-4 py-4 sm:px-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center flex-1 min-w-0">
                    <svg
                      className="h-6 w-6 text-gray-400 mr-3 flex-shrink-0"
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
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center flex-wrap gap-2">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {formatDate(session.session_date)}
                          {formatTime(session.session_time) && ` at ${formatTime(session.session_time)}`}
                        </p>
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                          {session.platform}
                        </span>
                      </div>
                      {session.summary && (
                        <p className="mt-1 text-sm text-gray-500 line-clamp-2">
                          {session.summary}
                        </p>
                      )}
                      {session.conditions && (
                        <p className="mt-1 text-xs text-gray-400 line-clamp-1">
                          Conditions: {session.conditions}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="ml-4 flex-shrink-0">
                    <button
                      onClick={() => setSelectedSession(session)}
                      className="inline-flex items-center px-3 py-1.5 border border-gray-300 text-xs sm:text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                      View
                    </button>
                  </div>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>

      {/* Session Detail Modal */}
      {selectedSession && (
        <div className="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            {/* Background overlay */}
            <div 
              className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" 
              onClick={() => setSelectedSession(null)}
            ></div>

            {/* Modal panel */}
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="flex items-start justify-between mb-4">
                  <h3 className="text-lg font-medium text-gray-900" id="modal-title">
                    Session Details
                  </h3>
                  <button
                    onClick={() => setSelectedSession(null)}
                    className="text-gray-400 hover:text-gray-500 focus:outline-none"
                  >
                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Date & Time</label>
                    <p className="mt-1 text-sm text-gray-900">
                      {formatDate(selectedSession.session_date)}
                      {formatTime(selectedSession.session_time) && ` at ${formatTime(selectedSession.session_time)}`}
                    </p>
                  </div>

                  <div>
                    <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Platform</label>
                    <p className="mt-1 text-sm text-gray-900">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                        {selectedSession.platform}
                      </span>
                    </p>
                  </div>

                  {selectedSession.summary && (
                    <div>
                      <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Summary</label>
                      <p className="mt-1 text-sm text-gray-900 whitespace-pre-wrap">
                        {selectedSession.summary}
                      </p>
                    </div>
                  )}

                  {selectedSession.conditions && (
                    <div>
                      <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Conditions</label>
                      <p className="mt-1 text-sm text-gray-900 whitespace-pre-wrap">
                        {selectedSession.conditions}
                      </p>
                    </div>
                  )}

                  {!selectedSession.summary && !selectedSession.conditions && (
                    <p className="text-sm text-gray-500 italic">No additional details available for this session.</p>
                  )}
                </div>
              </div>

              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  type="button"
                  onClick={() => setSelectedSession(null)}
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:ml-3 sm:w-auto sm:text-sm"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-xs sm:text-sm text-gray-700 text-center sm:text-left">
            Showing page {currentPage} of {totalPages} ({sessions.length} {sessions.length === 1 ? 'session' : 'sessions'})
          </div>
          <div className="flex gap-1 sm:gap-2 items-center flex-wrap justify-center">
            {currentPage > 1 && (
              <Link
                href={`/dashboard/clients/${clientId}?page=${currentPage - 1}${platformFilter ? `&platform=${encodeURIComponent(platformFilter)}` : ''}`}
                className="px-3 sm:px-4 py-2 border border-gray-300 text-xs sm:text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
              >
                ← Prev
              </Link>
            )}
            
            {/* Page numbers */}
            <div className="flex gap-1">
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let pageNum
                if (totalPages <= 5) {
                  pageNum = i + 1
                } else if (currentPage <= 3) {
                  pageNum = i + 1
                } else if (currentPage >= totalPages - 2) {
                  pageNum = totalPages - 4 + i
                } else {
                  pageNum = currentPage - 2 + i
                }
                
                if (pageNum === currentPage) {
                  return (
                    <span
                      key={pageNum}
                      className="px-2 sm:px-3 py-2 text-xs sm:text-sm font-medium text-indigo-600 bg-indigo-50 border border-indigo-300 rounded-md"
                    >
                      {pageNum}
                    </span>
                  )
                }
                
                return (
                  <Link
                    key={pageNum}
                    href={`/dashboard/clients/${clientId}?page=${pageNum}${platformFilter ? `&platform=${encodeURIComponent(platformFilter)}` : ''}`}
                    className="px-2 sm:px-3 py-2 text-xs sm:text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                  >
                    {pageNum}
                  </Link>
                )
              })}
            </div>
            
            {currentPage < totalPages && (
              <Link
                href={`/dashboard/clients/${clientId}?page=${currentPage + 1}${platformFilter ? `&platform=${encodeURIComponent(platformFilter)}` : ''}`}
                className="px-3 sm:px-4 py-2 border border-gray-300 text-xs sm:text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
              >
                Next →
              </Link>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
