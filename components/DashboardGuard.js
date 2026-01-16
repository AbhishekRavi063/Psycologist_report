'use client'

// Client component to check session and redirect if needed
// This ensures session is checked on client side where localStorage is available

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

export default function DashboardGuard({ children }) {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [hasSession, setHasSession] = useState(false)

  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      
      if (session) {
        setHasSession(true)
        setLoading(false)
      } else {
        // No session - redirect to login
        router.push('/login')
      }
    }

    checkSession()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session) {
        setHasSession(true)
        setLoading(false)
      } else {
        router.push('/login')
      }
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [router])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  if (!hasSession) {
    return null
  }

  return <>{children}</>
}
