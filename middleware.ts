// middleware.ts
import { createServerClient } from '@supabase/ssr'
import { NextRequest, NextResponse } from 'next/server'

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()

  // Create Supabase client using req/res cookies
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!, // server key
    {
      cookies: {
        getAll: () => req.cookies.getAll(), // read cookies from request
        setAll: (cookiesToSet) => {
          cookiesToSet.forEach(({ name, value, options }) =>
            res.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // Check user session
  const { data: { session }, error } = await supabase.auth.getSession()

  if (error) {
    console.log('Error fetching session:', error.message)
  } else {
    console.log('User session:', session)
    if (session) {
      console.log('Access token:', session.access_token) // this is your JWT
      console.log('Refresh token:', session.refresh_token)
    }
  }

  const { pathname } = req.nextUrl

  // If user is authenticated and trying to access /auth, redirect to home
  if (session && pathname === '/auth') {
    return NextResponse.redirect(new URL('/home', req.url))
  }

  // Redirect if not logged in (for protected routes)
  if (!session && pathname !== '/auth') {
    return NextResponse.redirect(new URL('/auth', req.url))
  }
  

  return res
}

// Apply middleware to /home, protected routes, and /auth
export const config = {
  matcher: ['/home', '/dashboard/:path*', '/', '/auth'],
}
