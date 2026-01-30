'use client';

// Session list component
// Displays sessions in a file-like view with pagination and 3-dots menu (View, Edit, Delete)

import { useState } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import ThreeDotsMenu from '@/components/ThreeDotsMenu';
import ConfirmModal from '@/components/ConfirmModal';

const MENU_ITEM_CLASS = 'block w-full text-left px-4 py-2 text-sm border-0 bg-transparent cursor-pointer text-gray-700';
const MENU_ITEM_DANGER_CLASS = 'block w-full text-left px-4 py-2 text-sm border-0 bg-transparent cursor-pointer text-red-600';

const ITEMS_PER_PAGE_DEFAULT = 10;

export default function SessionList({
  sessions,
  clientId,
  currentPage,
  totalPages,
  totalCount = 0,
  itemsPerPage = ITEMS_PER_PAGE_DEFAULT,
  platformFilter,
  onSessionDeleted,
}) {
  const [selectedSession, setSelectedSession] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatTime = (timeString) => {
    if (!timeString) return '';
    const [hours, minutes] = timeString.split(':');
    if (hours === '00' && minutes === '00') return '';
    return `${hours}:${minutes}`;
  };

  const handleDeleteClick = (session) => {
    setDeleteConfirm({
      session,
      message: `Delete this session (${formatDate(session.session_date)})?`,
    });
  };

  const handleDeleteConfirm = async () => {
    if (!deleteConfirm) return;
    const { session } = deleteConfirm;
    setDeletingId(session.id);
    try {
      const { error } = await supabase.from('sessions').delete().eq('id', session.id);
      if (error) throw error;
      if (onSessionDeleted) onSessionDeleted(session.id);
      setDeleteConfirm(null);
    } catch (err) {
      console.error('Error deleting session:', err);
      alert(err.message || 'Failed to delete session');
    } finally {
      setDeletingId(null);
    }
  };

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
    );
  }

  return (
    <div>
      <div className="bg-white shadow overflow-visible sm:rounded-md overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-200">
          <thead className="bg-slate-100">
            <tr>
              <th scope="col" className="px-4 py-3.5 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                Date
              </th>
              <th scope="col" className="px-4 py-3.5 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                Platform
              </th>
              <th scope="col" className="relative px-4 py-3.5 text-right text-xs font-semibold text-slate-600 uppercase tracking-wider">
                <span className="sr-only">Actions</span>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200/80">
            {sessions.map((session, index) => (
              <tr
                key={session.id}
                className={`transition-colors ${
                  index % 2 === 0 ? 'bg-white hover:bg-slate-50' : 'bg-slate-50/70 hover:bg-slate-100'
                }`}
              >
                <td className="px-4 py-3.5 whitespace-nowrap text-sm font-medium text-slate-900">
                  {formatDate(session.session_date)}
                  {formatTime(session.session_time) && (
                    <span className="text-slate-500 font-normal"> {formatTime(session.session_time)}</span>
                  )}
                </td>
                <td className="px-4 py-3.5 whitespace-nowrap">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    {session.platform}
                  </span>
                </td>
                <td className="px-4 py-3.5 whitespace-nowrap text-right">
                  <ThreeDotsMenu>
                    <button
                      type="button"
                      className={MENU_ITEM_CLASS}
                      onClick={() => setSelectedSession(session)}
                    >
                      View
                    </button>
                    <Link
                      href={`/dashboard/clients/${clientId}/sessions/${session.id}/edit`}
                      className={MENU_ITEM_CLASS}
                    >
                      Edit
                    </Link>
                    <button
                      type="button"
                      className={MENU_ITEM_DANGER_CLASS}
                      onClick={() => handleDeleteClick(session)}
                      disabled={deletingId === session.id}
                    >
                      {deletingId === session.id ? 'Deleting...' : 'Delete'}
                    </button>
                  </ThreeDotsMenu>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Delete confirmation modal */}
      <ConfirmModal
        open={!!deleteConfirm}
        title="Delete session"
        message={deleteConfirm?.message ?? ''}
        confirmLabel="Delete"
        cancelLabel="Cancel"
        variant="danger"
        loading={!!deletingId}
        onConfirm={handleDeleteConfirm}
        onCancel={() => !deletingId && setDeleteConfirm(null)}
      />

      {/* Session Detail Modal - modern UI */}
      {selectedSession && (
        <div className="fixed inset-0 z-50 overflow-y-auto overscroll-contain p-4 sm:p-6" aria-labelledby="modal-title" role="dialog" aria-modal="true">
          <div className="flex min-h-full items-center justify-center">
            <div
              className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm transition-opacity"
              onClick={() => setSelectedSession(null)}
              aria-hidden="true"
            />
            <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto overflow-x-hidden rounded-2xl bg-white shadow-2xl shadow-slate-900/20">
              {/* Accent bar */}
              <div className="h-1 w-full bg-gradient-to-r from-green-600 via-green-700 to-green-800 shrink-0" />

              {/* Header: title + meta pills + close */}
              <div className="flex flex-wrap items-start justify-between gap-3 px-4 pt-6 pb-4 sm:px-6 sm:gap-4 sticky top-0 bg-white z-10">
                <div className="space-y-3">
                  <h3 className="text-xl font-bold text-slate-900 tracking-tight" id="modal-title">
                    Session
                  </h3>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1.5 text-sm font-medium text-slate-700">
                      <svg className="h-4 w-4 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      {formatDate(selectedSession.session_date)}
                      {formatTime(selectedSession.session_time) ? ` · ${formatTime(selectedSession.session_time)}` : ''}
                    </span>
                    <span className="inline-flex items-center rounded-full bg-green-100 px-3 py-1.5 text-sm font-semibold text-green-700">
                      {selectedSession.platform}
                    </span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedSession(null)}
                  className="rounded-xl p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600 focus:outline-none focus:ring-2 focus:ring-green-600 focus:ring-offset-2 transition-colors"
                  aria-label="Close"
                >
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Content: two cards */}
              <div className="space-y-4 px-4 pb-6 sm:px-6">
                {/* Summary card */}
                <div className="rounded-xl border border-slate-200/80 bg-gradient-to-br from-slate-50 to-white p-4 shadow-sm">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-green-100 text-green-600">
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </span>
                    <span className="text-sm font-semibold uppercase tracking-wider text-slate-500">Summary</span>
                  </div>
                  <p className="text-sm leading-relaxed text-slate-800 whitespace-pre-wrap">
                    {selectedSession.summary || 'No summary added.'}
                  </p>
                </div>

                {/* Conditions card */}
                <div className="rounded-xl border border-slate-200/80 bg-gradient-to-br from-slate-50 to-white p-4 shadow-sm">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-green-100 text-green-700">
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                      </svg>
                    </span>
                    <span className="text-sm font-semibold uppercase tracking-wider text-slate-500">Conditions</span>
                  </div>
                  <p className="text-sm leading-relaxed text-slate-800 whitespace-pre-wrap">
                    {selectedSession.conditions || 'No conditions noted.'}
                  </p>
                </div>
              </div>

              {/* Footer */}
              <div className="border-t border-slate-200 bg-slate-50/80 px-4 py-4 sm:px-6">
                <button
                  type="button"
                  onClick={() => setSelectedSession(null)}
                  className="w-full rounded-xl bg-green-700 px-4 py-3 text-sm font-semibold text-white shadow-sm hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-600 focus:ring-offset-2 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Pagination - always show when there are sessions */}
      {sessions.length > 0 && (
        <div className="mt-6 rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 sm:px-5 sm:py-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-sm font-medium text-slate-800 text-center sm:text-left">
              {(() => {
                const start = totalCount === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1;
                const end = Math.min(currentPage * itemsPerPage, totalCount);
                return (
                  <>
                    Showing <span className="font-semibold text-slate-900">{start}–{end}</span> of <span className="font-semibold text-slate-900">{totalCount}</span> {totalCount === 1 ? 'session' : 'sessions'} · <span className="text-slate-600">{itemsPerPage} per page</span>
                  </>
                );
              })()}
            </div>
          {totalPages > 1 && (
            <div className="flex gap-1 sm:gap-2 items-center flex-wrap justify-center">
              {currentPage > 1 && (
                <Link
                  href={`/dashboard/clients/${clientId}?page=${currentPage - 1}${platformFilter ? `&platform=${encodeURIComponent(platformFilter)}` : ''}`}
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
                      href={`/dashboard/clients/${clientId}?page=${pageNum}${platformFilter ? `&platform=${encodeURIComponent(platformFilter)}` : ''}`}
                      className="px-2 sm:px-3 py-2 text-xs sm:text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                    >
                      {pageNum}
                    </Link>
                  );
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
          )}
          </div>
        </div>
      )}
    </div>
  );
}
