import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { createServerClient } from "@supabase/ssr"

// Define public routes that don't require authentication
const PUBLIC_ROUTES = ["/", "/login", "/signup", "/browse", "/books", "/locations"]

const PUBLIC_PATTERNS = [
  /^\/books\/[^/]+$/,
]

const PROTECTED_ROUTES = [
  "/dashboard",
  "/add-book",
  "/wishlist",
  "/messages",
  "/profile",
  "/buy-points",
  "/history",
]

const PROTECTED_PATTERNS = [
  /^\/profile\/edit$/,
]

function isPublicRoute(pathname: string): boolean {
  if (PUBLIC_ROUTES.includes(pathname)) return true
  return PUBLIC_PATTERNS.some((pattern) => pattern.test(pathname))
}

function isProtectedRoute(pathname: string): boolean {
  if (PROTECTED_ROUTES.some((route) => pathname.startsWith(route))) return true
  return PROTECTED_PATTERNS.some((pattern) => pattern.test(pathname))
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname.includes(".")
  ) {
    return NextResponse.next()
  }

  let response = NextResponse.next({ request })

  // ✅ Supabase Server Client
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          )

          response = NextResponse.next({ request })

          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // ✅ Correct auth check
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const isAuthenticated = !!user

  // 🔒 Protected route → redirect if not logged in
  if (isProtectedRoute(pathname) && !isAuthenticated) {
    const loginUrl = new URL("/login", request.url)
    loginUrl.searchParams.set("redirect", pathname)
    return NextResponse.redirect(loginUrl)
  }

  // 🔁 Auth pages → redirect if already logged in
  if (isAuthenticated && (pathname === "/login" || pathname === "/signup")) {
    return NextResponse.redirect(new URL("/dashboard", request.url))
  }

  return response
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
}
