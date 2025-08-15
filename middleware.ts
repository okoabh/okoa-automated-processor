import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  // Skip middleware for API routes and webhooks
  if (request.nextUrl.pathname.startsWith('/api/')) {
    return NextResponse.next()
  }

  // Simple password protection (only if enabled)
  const isPasswordProtected = process.env.DEMO_PASSWORD_REQUIRED === 'true'
  
  if (isPasswordProtected) {
    const basicAuth = request.headers.get('authorization')
    const url = request.nextUrl

    if (basicAuth) {
      const authValue = basicAuth.split(' ')[1]
      const [user, pwd] = atob(authValue).split(':')

      if (user === 'demo' && pwd === process.env.DEMO_PASSWORD) {
        return NextResponse.next()
      }
    }

    url.pathname = '/api/auth'

    return NextResponse.rewrite(url)
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
}