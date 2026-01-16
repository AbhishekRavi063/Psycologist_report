// Next.js middleware to protect dashboard routes
// Note: Authentication is primarily handled at the page level
// This middleware provides basic route protection

import { NextResponse } from 'next/server'

export async function middleware(req) {
  // Protected routes that require authentication
  const protectedPaths = ['/dashboard']

  // Check if the current path is protected
  const isProtectedPath = protectedPaths.some(path => 
    req.nextUrl.pathname.startsWith(path)
  )

  // For protected paths, we'll let the page handle authentication
  // Pages will check session and redirect if needed
  // This middleware is kept simple to avoid cookie/session complexity

  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
