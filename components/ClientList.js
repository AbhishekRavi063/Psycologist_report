'use client';

// Client list component
// Displays clients in a folder-like view with pagination and 3-dots menu (View, Edit, Delete)

import { useState } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import ThreeDotsMenu from '@/components/ThreeDotsMenu';
import ConfirmModal from '@/components/ConfirmModal';

const MENU_ITEM_CLASS = 'block w-full text-left px-4 py-2 text-sm border-0 bg-transparent cursor-pointer text-gray-700';
const MENU_ITEM_DANGER_CLASS = 'block w-full text-left px-4 py-2 text-sm border-0 bg-transparent cursor-pointer text-red-600';

const ITEMS_PER_PAGE_DEFAULT = 10;

export default function ClientList({ clients, currentPage, totalPages, totalCount = 0, itemsPerPage = ITEMS_PER_PAGE_DEFAULT, search, embedded = false, onClientDeleted }) {
  const [viewClient, setViewClient] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  const handleDeleteClick = (client) => {
    setDeleteConfirm({
      client,
      message: `Delete client "${client.name}"? This will also delete all their sessions.`,
    });
  };

  const handleDeleteConfirm = async () => {
    if (!deleteConfirm) return;
    const { client } = deleteConfirm;
    setDeletingId(client.id);
    try {
      await supabase.from('sessions').delete().eq('client_id', client.id);
      const { error } = await supabase.from('clients').delete().eq('id', client.id);
      if (error) throw error;
      if (onClientDeleted) onClientDeleted(client.id);
      setDeleteConfirm(null);
    } catch (err) {
      console.error('Error deleting client:', err);
      alert(err.message || 'Failed to delete client');
    } finally {
      setDeletingId(null);
    }
  };

  if (!clients || clients.length === 0) {
    return (
      <div className={`p-8 text-center ${embedded ? 'rounded-b-2xl' : 'bg-white shadow rounded-lg'}`}>
        <svg
          className="mx-auto h-12 w-12 text-slate-400"
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
        <h3 className="mt-2 text-sm font-semibold text-slate-900">No clients</h3>
        <p className="mt-1 text-sm text-slate-500">
          {search ? 'No clients found matching your search.' : 'Get started by creating a new client.'}
        </p>
      </div>
    );
  }

  const listContent = (
    <ul className="divide-y divide-slate-200/80">
          {clients.map((client, index) => (
            <li
              key={client.id}
              className={`transition-colors ${
                index % 2 === 0 ? 'bg-white hover:bg-slate-50' : 'bg-slate-50/70 hover:bg-slate-100'
              }`}
            >
              <div className="px-4 py-4 sm:px-6 flex items-center justify-between gap-2">
                <Link
                  href={`/dashboard/clients/${client.id}`}
                  className="flex items-center flex-1 min-w-0 transition-colors -m-4 p-4 sm:-m-6 sm:p-6 rounded-l"
                >
                  <svg
                    className="h-6 w-6 sm:h-8 sm:w-8 text-green-700 mr-2 sm:mr-3 flex-shrink-0"
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
                    <p className="text-sm sm:text-base font-medium text-green-700 truncate">
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
                  <svg
                    className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400 flex-shrink-0"
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
                </Link>
                <div className="flex-shrink-0" onClick={(e) => e.preventDefault()}>
                  <ThreeDotsMenu>
                    <button
                      type="button"
                      className={MENU_ITEM_CLASS}
                      onClick={(e) => { e.preventDefault(); setViewClient(client); }}
                    >
                      View
                    </button>
                    <Link
                      href={`/dashboard/clients/${client.id}/edit`}
                      className={MENU_ITEM_CLASS}
                    >
                      Edit
                    </Link>
                    <button
                      type="button"
                      className={MENU_ITEM_DANGER_CLASS}
                      onClick={(e) => { e.preventDefault(); handleDeleteClick(client); }}
                      disabled={deletingId === client.id}
                    >
                      {deletingId === client.id ? 'Deleting...' : 'Delete'}
                    </button>
                  </ThreeDotsMenu>
                </div>
              </div>
            </li>
          ))}
        </ul>
  );

  return (
    <div>
      {embedded ? listContent : <div className="bg-white shadow overflow-visible sm:rounded-md">{listContent}</div>}

      {/* Delete confirmation modal */}
      <ConfirmModal
        open={!!deleteConfirm}
        title="Delete client"
        message={deleteConfirm?.message ?? ''}
        confirmLabel="Delete"
        cancelLabel="Cancel"
        variant="danger"
        loading={!!deletingId}
        onConfirm={handleDeleteConfirm}
        onCancel={() => !deletingId && setDeleteConfirm(null)}
      />

      {/* View Client Details Modal */}
      {viewClient && (
        <div className="fixed inset-0 z-50 overflow-y-auto overscroll-contain p-4 sm:p-6" aria-labelledby="modal-title" role="dialog" aria-modal="true">
          <div className="flex min-h-full items-center justify-center">
            <div
              className="fixed inset-0 bg-gray-600/50 transition-opacity"
              onClick={() => setViewClient(null)}
              aria-hidden="true"
            />
            <div className="relative w-full max-w-md max-h-[90vh] overflow-y-auto rounded-xl bg-white shadow-2xl ring-1 ring-black/5">
              {/* Header */}
              <div className="flex items-center justify-between border-b border-gray-200 px-4 py-4 sm:px-6 sticky top-0 bg-white z-10">
                <h3 className="text-lg font-semibold text-gray-900" id="modal-title">
                  Client details
                </h3>
                <button
                  type="button"
                  onClick={() => setViewClient(null)}
                  className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-green-600 focus:ring-offset-2"
                  aria-label="Close"
                >
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              {/* Body - field list with clear separation */}
              <div className="px-4 py-4 sm:px-6">
                <dl className="divide-y divide-gray-100">
                  <div className="py-4 first:pt-0">
                    <dt className="text-xs font-medium uppercase tracking-wider text-gray-500">Name</dt>
                    <dd className="mt-1.5 text-sm font-medium text-gray-900">{viewClient.name || '—'}</dd>
                  </div>
                  <div className="py-4">
                    <dt className="text-xs font-medium uppercase tracking-wider text-gray-500">Email</dt>
                    <dd className="mt-1.5 text-sm text-gray-900">{viewClient.email || '—'}</dd>
                  </div>
                  <div className="py-4">
                    <dt className="text-xs font-medium uppercase tracking-wider text-gray-500">Age</dt>
                    <dd className="mt-1.5 text-sm text-gray-900">{viewClient.age != null ? viewClient.age : '—'}</dd>
                  </div>
                  <div className="py-4">
                    <dt className="text-xs font-medium uppercase tracking-wider text-gray-500">Gender</dt>
                    <dd className="mt-1.5 text-sm text-gray-900">{viewClient.gender || '—'}</dd>
                  </div>
                  <div className="py-4 last:pb-0">
                    <dt className="text-xs font-medium uppercase tracking-wider text-gray-500">Place</dt>
                    <dd className="mt-1.5 text-sm text-gray-900">{viewClient.place || '—'}</dd>
                  </div>
                </dl>
              </div>
              {/* Footer */}
              <div className="border-t border-gray-200 bg-gray-50 px-4 py-4 sm:px-6 rounded-b-xl">
                <button
                  type="button"
                  onClick={() => setViewClient(null)}
                  className="w-full rounded-lg bg-green-700 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-600 focus:ring-offset-2"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Pagination - always show when there are clients */}
      {clients.length > 0 && (
        <div className="mt-6 rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 sm:px-5 sm:py-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-sm font-medium text-slate-800 text-center sm:text-left">
              {(() => {
                const start = totalCount === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1;
                const end = Math.min(currentPage * itemsPerPage, totalCount);
                return (
                  <>
                    Showing <span className="font-semibold text-slate-900">{start}–{end}</span> of <span className="font-semibold text-slate-900">{totalCount}</span> {totalCount === 1 ? 'client' : 'clients'} · <span className="text-slate-600">{itemsPerPage} per page</span>
                  </>
                );
              })()}
            </div>
          {totalPages > 1 && (
            <div className="flex gap-1 sm:gap-2 items-center flex-wrap justify-center">
              {currentPage > 1 && (
                <Link
                  href={`/dashboard/clients?page=${currentPage - 1}${search ? `&search=${encodeURIComponent(search)}` : ''}`}
                  className="px-3 sm:px-4 py-2 border border-gray-300 text-xs sm:text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                >
                  ← Prev
                </Link>
              )}

              <div className="flex gap-1">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNum;
                  if (totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (currentPage <= 3) {
                    pageNum = i + 1;
                  } else if (currentPage >= totalPages - 2) {
                    pageNum = totalPages - 4 + i;
                  } else {
                    pageNum = currentPage - 2 + i;
                  }

                  if (pageNum === currentPage) {
                    return (
                      <span
                        key={pageNum}
                        className="px-2 sm:px-3 py-2 text-xs sm:text-sm font-medium text-green-700 bg-green-50 border border-green-300 rounded-md"
                      >
                        {pageNum}
                      </span>
                    );
                  }

                  return (
                    <Link
                      key={pageNum}
                      href={`/dashboard/clients?page=${pageNum}${search ? `&search=${encodeURIComponent(search)}` : ''}`}
                      className="px-2 sm:px-3 py-2 text-xs sm:text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                    >
                      {pageNum}
                    </Link>
                  );
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
          )}
          </div>
        </div>
      )}
    </div>
  );
}
