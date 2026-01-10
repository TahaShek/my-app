import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

// Define public routes that don't require authentication
const PUBLIC_ROUTES = ["/", "/login", "/signup", "/browse", "/books", "/locations"]

// Define route patterns that are public
const PUBLIC_PATTERNS = [
  /^\/books\/[^/]+$/, // /books/[id]
]

// Define protected routes that require authentication
const PROTECTED_ROUTES = ["/dashboard", "/add-book", "/wishlist", "/messages", "/profile", "/buy-points", "/history"]

// Define route patterns that are protected
const PROTECTED_PATTERNS = [
  /^\/profile\/edit$/, // /profile/edit
]

function isPublicRoute(pathname: string): boolean {
  // Check exact matches
  if (PUBLIC_ROUTES.includes(pathname)) {
    return true
  }

  // Check pattern matches
  return PUBLIC_PATTERNS.some((pattern) => pattern.test(pathname))
}

function isProtectedRoute(pathname: string): boolean {
  // Check exact matches
  if (PROTECTED_ROUTES.some((route) => pathname.startsWith(route))) {
    return true
  }

  // Check pattern matches
  return PROTECTED_PATTERNS.some((pattern) => pattern.test(pathname))
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Skip middleware for static files and API routes
  if (pathname.startsWith("/_next") || pathname.startsWith("/api") || pathname.includes(".")) {
    return NextResponse.next()
  }

  // Check if user is authenticated
  const authToken = request.cookies.get("auth_token")
  const isAuthenticated = !!authToken

  // If route is protected and user is not authenticated, redirect to login
  if (isProtectedRoute(pathname) && !isAuthenticated) {
    const loginUrl = new URL("/login", request.url)
    loginUrl.searchParams.set("redirect", pathname)
    return NextResponse.redirect(loginUrl)
  }

  // If user is authenticated and tries to access login/signup, redirect to dashboard
  if (isAuthenticated && (pathname === "/login" || pathname === "/signup")) {
    return NextResponse.redirect(new URL("/dashboard", request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
}
