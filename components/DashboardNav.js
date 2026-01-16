'use client'

// Dashboard navigation component
// Shows user email and logout button

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import LogoutButton from '@/components/LogoutButton'

export default function DashboardNav() {
  const [userEmail, setUserEmail] = useState('')

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        setUserEmail(user.email || '')
      }
    }
    getUser()
  }, [])

  return (
    <nav className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center min-w-0 flex-1">
            <h1 className="text-lg sm:text-xl font-semibold text-gray-900 truncate">
              Psychologist Dashboard
            </h1>
          </div>
          <div className="flex items-center space-x-2 sm:space-x-4 ml-2">
            {userEmail && (
              <span className="text-xs sm:text-sm text-gray-600 truncate max-w-[120px] sm:max-w-none hidden sm:inline">
                {userEmail}
              </span>
            )}
            <LogoutButton />
          </div>
        </div>
      </div>
    </nav>
  )
}
