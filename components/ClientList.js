// Client list component
// Displays clients in a folder-like view with pagination

import Link from 'next/link'

export default function ClientList({ clients, currentPage, totalPages, search }) {
  if (!clients || clients.length === 0) {
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
            d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"
          />
        </svg>
        <h3 className="mt-2 text-sm font-medium text-gray-900">No clients</h3>
        <p className="mt-1 text-sm text-gray-500">
          {search ? 'No clients found matching your search.' : 'Get started by creating a new client.'}
        </p>
      </div>
    )
  }

  return (
    <div>
      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <ul className="divide-y divide-gray-200">
          {clients.map((client) => (
            <li key={client.id} className="mb-2 last:mb-0">
              <Link
                href={`/dashboard/clients/${client.id}`}
                className="block hover:bg-gray-50 transition-colors"
              >
                <div className="px-4 py-4 sm:px-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center flex-1 min-w-0">
                      <svg
                        className="h-6 w-6 sm:h-8 sm:w-8 text-indigo-600 mr-2 sm:mr-3 flex-shrink-0"
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
                      <div className="flex-1 min-w-0">
                        <p className="text-sm sm:text-base font-medium text-indigo-600 truncate">
                          {client.name}
                        </p>
                        <div className="mt-1 sm:mt-2 flex flex-wrap items-center text-xs sm:text-sm text-gray-500 gap-x-3 gap-y-1">
                          {client.email && (
                            <span className="truncate">{client.email}</span>
                          )}
                          {client.age && (
                            <span>Age: {client.age}</span>
                          )}
                          {client.gender && (
                            <span>{client.gender}</span>
                          )}
                          {client.place && <span className="truncate">{client.place}</span>}
                        </div>
                      </div>
                    </div>
                    <div className="ml-2 flex-shrink-0 flex">
                      <svg
                        className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 5l7 7-7 7"
                        />
                      </svg>
                    </div>
                  </div>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-xs sm:text-sm text-gray-700 text-center sm:text-left">
            Showing page {currentPage} of {totalPages} ({clients.length} {clients.length === 1 ? 'client' : 'clients'})
          </div>
          <div className="flex gap-1 sm:gap-2 items-center flex-wrap justify-center">
            {currentPage > 1 && (
              <Link
                href={`/dashboard/clients?page=${currentPage - 1}${search ? `&search=${encodeURIComponent(search)}` : ''}`}
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
                    href={`/dashboard/clients?page=${pageNum}${search ? `&search=${encodeURIComponent(search)}` : ''}`}
                    className="px-2 sm:px-3 py-2 text-xs sm:text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                  >
                    {pageNum}
                  </Link>
                )
              })}
            </div>
            
            {currentPage < totalPages && (
              <Link
                href={`/dashboard/clients?page=${currentPage + 1}${search ? `&search=${encodeURIComponent(search)}` : ''}`}
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
