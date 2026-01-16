// Authentication helper functions
// These functions handle signup, login, logout, and session management

import { supabase } from './supabase'

// Get env vars for validation
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

/**
 * Sign up a new psychologist
 * @param {string} email - User email
 * @param {string} password - User password
 * @returns {Promise<{user: object|null, error: object|null}>}
 */
export async function signUp(email, password) {
  try {
    // Check if Supabase is configured
    if (!supabaseUrl || !supabaseAnonKey) {
      return { 
        user: null, 
        error: { 
          message: 'Supabase is not configured. Please check your .env.local file with NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY' 
        } 
      }
    }

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: undefined,
        data: {
          email_confirm: true, // Try to auto-confirm
        },
      },
    })
    
    // If signup succeeds but email needs confirmation, try to confirm it
    if (data?.user && !data?.user.email_confirmed_at && !error) {
      // Try to sign in immediately to see if it works
      const { data: signInData } = await supabase.auth.signInWithPassword({
        email,
        password,
      })
      if (signInData?.session) {
        return {
          user: signInData.user,
          session: signInData.session,
          needsEmailConfirmation: false,
          error: null,
        }
      }
    }
    
    if (error) {
      console.error('Signup error:', error)
    }
    
    // Return user, session, and whether email confirmation is needed
    return { 
      user: data?.user || null, 
      session: data?.session || null,
      needsEmailConfirmation: !data?.session && data?.user && !data?.user.email_confirmed_at,
      error 
    }
  } catch (error) {
    console.error('Signup exception:', error)
    return { user: null, error: { message: error.message || 'An unexpected error occurred during signup' } }
  }
}

/**
 * Sign in an existing psychologist
 * @param {string} email - User email
 * @param {string} password - User password
 * @returns {Promise<{user: object|null, error: object|null}>}
 */
export async function signIn(email, password) {
  try {
    // Check if Supabase is configured
    if (!supabaseUrl || !supabaseAnonKey) {
      return { 
        user: null, 
        error: { 
          message: 'Supabase is not configured. Please check your .env.local file with NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY' 
        } 
      }
    }

    if (!email || !password) {
      return { 
        user: null, 
        error: { message: 'Email and password are required' } 
      }
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    })
    
    if (error) {
      console.error('Signin error:', error)
      return { user: null, error }
    }
    
    // Return user and session
    return { 
      user: data?.user || null, 
      session: data?.session || null,
      error: null 
    }
  } catch (error) {
    console.error('Signin exception:', error)
    return { user: null, error: { message: error.message || 'An unexpected error occurred during sign in' } }
  }
}

/**
 * Sign out the current user
 * @returns {Promise<{error: object|null}>}
 */
export async function signOut() {
  try {
    const { error } = await supabase.auth.signOut()
    return { error }
  } catch (error) {
    return { error }
  }
}

/**
 * Get the current user session
 * @returns {Promise<{user: object|null, session: object|null}>}
 */
export async function getCurrentUser() {
  try {
    const { data: { user }, error } = await supabase.auth.getUser()
    return { user, error }
  } catch (error) {
    return { user: null, error }
  }
}

/**
 * Get the current session
 * @returns {Promise<{session: object|null, error: object|null}>}
 */
export async function getSession() {
  try {
    // Get session from Supabase
    const { data: { session }, error } = await supabase.auth.getSession()
    
    // If no session, try to get user (which might trigger session refresh)
    if (!session && !error) {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        // User exists but no session - try to get session again
        const { data: { session: retrySession } } = await supabase.auth.getSession()
        return { session: retrySession || null, error: null }
      }
    }
    
    return { session, error }
  } catch (error) {
    return { session: null, error }
  }
}
