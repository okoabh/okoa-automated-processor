import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  // Skip middleware for API routes, webhooks, and login page
  if (request.nextUrl.pathname.startsWith('/api/') || 
      request.nextUrl.pathname.startsWith('/login')) {
    return NextResponse.next()
  }

  // Simple password protection (only if enabled)
  const isPasswordProtected = process.env.DEMO_PASSWORD_REQUIRED === 'true'
  
  if (isPasswordProtected) {
    const basicAuth = request.headers.get('authorization')

    if (basicAuth) {
      const authValue = basicAuth.split(' ')[1]
      const [user, pwd] = atob(authValue).split(':')

      if (user === 'demo' && pwd === process.env.DEMO_PASSWORD) {
        return NextResponse.next()
      }
    }

    // Redirect to login page instead of basic auth prompt
    const loginUrl = new URL('/login', request.url)
    return NextResponse.redirect(loginUrl)
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
}