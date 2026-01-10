import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY! || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // Get user claims
  const { data } = await supabase.auth.getClaims()
  const user = data?.claims

  const isAuthPage = request.nextUrl.pathname.startsWith('/auth')

  if (user) {
    // Authenticated user
    if (!isAuthPage) {
      // Already on a protected route, let them continue
      return supabaseResponse
    }
    // If on /auth, redirect to /dashboard
    const url = request.nextUrl.clone()
    url.pathname = '/dashboard'
    return NextResponse.redirect(url)
  } else {
    // Unauthenticated user
    if (isAuthPage) {
      // Let them access login/signup pages
      return supabaseResponse
    }
    // Redirect unauthenticated users to "/"
    const url = request.nextUrl.clone()
    url.pathname = '/'
    return NextResponse.redirect(url)
  }
}