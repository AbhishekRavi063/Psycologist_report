'use client'

import { useEffect } from 'react'

export default function SuccessPopup({ open, onClose, autoCloseMs = 2500 }) {
  useEffect(() => {
    if (!open || !onClose) return
    const t = setTimeout(onClose, autoCloseMs)
    return () => clearTimeout(t)
  }, [open, onClose, autoCloseMs])

  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-label="Success"
    >
      <div
        className="absolute inset-0 bg-black/40"
        onClick={onClose}
        aria-hidden="true"
      />
      <div className="relative flex flex-col items-center gap-6 rounded-2xl bg-white p-8 sm:p-12 shadow-2xl max-w-md w-full">
        <img
          src="/success.png"
          alt=""
          className="h-40 w-40 sm:h-52 sm:w-52 object-contain"
        />
        <p className="text-2xl sm:text-3xl font-bold text-gray-800">Success</p>
      </div>
    </div>
  )
}
