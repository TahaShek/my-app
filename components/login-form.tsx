"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { BookOpen, Loader2 } from "lucide-react"
import { createClient } from "@/lib/supabase/client"

export default function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const supabase = createClient()

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [emailLoading, setEmailLoading] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)
  const [error, setError] = useState("")
  const [isProcessingCallback, setIsProcessingCallback] = useState(false)
  
  // Get redirect parameter from URL
  const redirectTo = searchParams.get("redirect") || "/dashboard"

  // ------------------------
  // Handle OAuth callback
  // ------------------------
  useEffect(() => {
    const handleOAuthCallback = async () => {
      setIsProcessingCallback(true)
      
      try {
        // First check if we have an active session
        const { data: { session } } = await supabase.auth.getSession()
        
        if (session) {
          console.log("✅ Already has session, checking profile...")
          
          // Check if profile exists, if not create it
          const { data: profile, error: profileError } = await supabase
            .from("profiles")
            .select("*")
            .eq("id", session.user.id)
            .single()

          if (profileError || !profile) {
            console.log("📝 Creating profile for new user...")
            
            // Create profile automatically
            const { error: insertError } = await supabase
              .from("profiles")
              .insert({
                id: session.user.id,
                email: session.user.email,
                username: session.user.email?.split("@")[0] || `user_${Date.now()}`,
                name: session.user.user_metadata?.full_name || session.user.user_metadata?.name || "New User",
                bio: null,
                location: null,
                points: 100,
                books_owned: 0,
                exchanges_completed: 0,
              })

            if (insertError) {
              console.error("❌ Profile creation error:", insertError)
            } else {
              console.log("✅ Profile created successfully")
            }
          }

          // Clean the URL and redirect
          const cleanUrl = window.location.origin + redirectTo
          console.log("🚀 Redirecting to:", cleanUrl)
          window.location.replace(cleanUrl)
          return
        }
        
        // If no session, check for OAuth callback parameters
        const url = new URL(window.location.href)
        const accessToken = url.searchParams.get("access_token")
        const refreshToken = url.searchParams.get("refresh_token")
        
        if (accessToken && refreshToken) {
          console.log("🔐 Processing OAuth callback tokens...")
          
          const { data, error } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken,
          })

          if (error) throw error

          if (data.session) {
            console.log("✅ OAuth callback successful, user:", data.session.user.email)
            
            // Check if profile exists, if not create it
            const { data: profile, error: profileError } = await supabase
              .from("profiles")
              .select("*")
              .eq("id", data.session.user.id)
              .single()

            if (profileError || !profile) {
              console.log("📝 Creating profile for new OAuth user...")
              
              const { error: insertError } = await supabase
                .from("profiles")
                .insert({
                  id: data.session.user.id,
                  email: data.session.user.email,
                  username: data.session.user.email?.split("@")[0] || `user_${Date.now()}`,
                  name: data.session.user.user_metadata?.full_name || data.session.user.user_metadata?.name || "New User",
                  bio: null,
                  location: null,
                  points: 100,
                  books_owned: 0,
                  exchanges_completed: 0,
                })

              if (insertError) {
                console.error("❌ Profile creation error:", insertError)
              }
            }
            
            // Clean the URL and redirect - use replace to avoid back button issues
            const cleanUrl = window.location.origin + redirectTo
            console.log("🚀 OAuth redirecting to:", cleanUrl)
            window.location.replace(cleanUrl)
          }
        }
      } catch (err: any) {
        console.error("❌ Auth processing error:", err)
        setError("Authentication failed. Please try again.")
      } finally {
        setIsProcessingCallback(false)
      }
    }

    handleOAuthCallback()
  }, [router, supabase, redirectTo])

  // ------------------------
  // Email/Password login
  // ------------------------
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setEmailLoading(true)
    setError("")

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) throw error

      console.log("✅ Email login successful")
      
      // Use window.location.replace to avoid issues with Next.js router
      const cleanUrl = window.location.origin + redirectTo
      window.location.replace(cleanUrl)
    } catch (err: any) {
      console.error("❌ Login error:", err)
      setError(err.message || "Login failed. Please try again.")
      setEmailLoading(false)
    }
  }

  // ------------------------
  // Google OAuth login
  // ------------------------
  const handleOAuthLogin = async () => {
    setGoogleLoading(true)
    setError("")

    try {
      console.log("🔐 Starting Google OAuth...")
      
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/login`, // Just /login, no redirect param here
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          }
        },
      })

      if (error) throw error
      
      // OAuth will redirect automatically
      console.log("🚀 Redirecting to Google...")
    } catch (err: any) {
      console.error("❌ OAuth error:", err)
      setError(err.message || "Google login failed. Please try again.")
      setGoogleLoading(false)
    }
  }

  // Show loading state while processing OAuth callback
  if (isProcessingCallback) {
    return (
      <Card className="w-full max-w-md border-2 relative">
        <CardContent className="pt-12 pb-12 text-center">
          <Loader2 className="h-12 w-12 text-primary animate-spin mx-auto mb-4" />
          <p className="text-xl font-serif text-[#1a365d] uppercase tracking-widest">
            Authenticating...
          </p>
          <p className="text-sm text-muted-foreground font-mono italic mt-2">
            Please wait while we complete your passport application
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="w-full max-w-md border-2 relative">
      <CardHeader className="space-y-4 text-center">
        <div className="flex justify-center">
          <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
            <BookOpen className="h-8 w-8 text-primary" />
          </div>
        </div>
        <div>
          <CardTitle className="text-3xl font-bold font-serif">Welcome Back</CardTitle>
          <CardDescription className="text-base mt-2">
            Sign in to continue your book exchange journey
          </CardDescription>
        </div>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md">
              {error}
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="your@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="h-11"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="h-11"
            />
          </div>

          <Button
            type="submit"
            className="w-full h-11 bg-primary hover:bg-primary/90"
            disabled={emailLoading}
          >
            {emailLoading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Signing in...
              </>
            ) : (
              "Sign In"
            )}
          </Button>
        </form>

        <div className="my-4 text-center text-sm text-muted-foreground">or</div>

        <Button
          type="button"
          onClick={handleOAuthLogin}
          className="w-full h-11 bg-white border border-gray-300 hover:bg-gray-100 text-gray-700 flex items-center justify-center gap-2"
          disabled={googleLoading}
        >
          <svg className="w-5 h-5" viewBox="0 0 533.5 544.3">
            <path
              d="M533.5 278.4c0-18.4-1.5-36.1-4.4-53.4H272.1v101h146.9c-6.4 34.7-25.8 64.2-54.8 84.1v69h88.6c51.9-47.8 81.7-118.5 81.7-200.7z"
              fill="#4285F4"
            />
            <path
              d="M272.1 544.3c73.7 0 135.5-24.4 180.6-66.1l-88.6-69c-24.6 16.5-56.1 26-92 26-70.8 0-130.8-47.8-152.3-112.3h-90.4v70.8c45.3 89.4 137.6 150.6 242.7 150.6z"
              fill="#34A853"
            />
            <path
              d="M119.4 319.7c-10.9-32.4-10.9-67.5 0-99.9v-70.8h-90.4c-39.6 77.4-39.6 169.4 0 246.8l90.4-76.1z"
              fill="#FBBC05"
            />
            <path
              d="M272.1 107.7c38.6 0 73.2 13.3 100.5 39.2l75.2-75.2C404.8 24.2 343 0 272.1 0 167 0 74.7 61.2 29.4 150.6l90.4 70.8c21.5-64.5 81.5-112.3 152.3-112.3z"
              fill="#EA4335"
            />
          </svg>
          {googleLoading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Redirecting to Google...
            </>
          ) : (
            "Sign In with Google"
          )}
        </Button>
      </CardContent>

      <CardFooter className="flex flex-col space-y-4">
        <div className="text-center text-sm text-muted-foreground">
          Don't have an account?{" "}
          <Link href="/signup" className="text-primary hover:underline font-medium">
            Sign up
          </Link>
        </div>
      </CardFooter>
    </Card>
  )
}