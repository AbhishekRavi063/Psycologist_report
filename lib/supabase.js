// Supabase client configuration
// This creates a singleton instance of the Supabase client

import { createClient } from '@supabase/supabase-js'

let supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

// Ensure URL is valid (https and supabase.co) so we never hit a broken/placeholder host
if (supabaseUrl && !supabaseUrl.startsWith('https://')) {
  supabaseUrl = 'https://' + supabaseUrl.replace(/^\s*\/+/, '')
}
const isValidUrl = supabaseUrl && supabaseUrl.startsWith('https://') && supabaseUrl.includes('.supabase.co') && !supabaseUrl.includes('placeholder')

// Create Supabase client only when config is valid; otherwise use a dummy URL so createClient doesn't throw (auth will return a clear error)
export const supabase = createClient(
  isValidUrl ? supabaseUrl : 'https://invalid.supabase.co',
  supabaseAnonKey || 'placeholder-key',
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
      storage: typeof window !== 'undefined' ? window.localStorage : undefined,
      storageKey: 'sb-psychologist-record-auth',
    },
  }
)

// Helper to check if Supabase is properly configured
export function isSupabaseConfigured() {
  return !!(isValidUrl && supabaseAnonKey && supabaseAnonKey !== 'placeholder-key')
}

// Create Supabase client for server-side operations
// This uses cookies to maintain the session
export function createServerClient() {
  if (!isValidUrl || !supabaseAnonKey || supabaseAnonKey === 'placeholder-key') {
    throw new Error('Supabase environment variables are missing or invalid. Use NEXT_PUBLIC_SUPABASE_URL (https://xxx.supabase.co) and NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local and restart the dev server.')
  }
  
  return createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
  })
}
