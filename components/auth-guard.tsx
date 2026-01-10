"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"

interface AuthGuardProps {
  children: React.ReactNode
  fallback?: React.ReactNode
}

export function AuthGuard({ children, fallback }: AuthGuardProps) {
  const router = useRouter()
  const [isChecking, setIsChecking] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  useEffect(() => {
    // Check if user is authenticated
    const checkAuth = async () => {
      try {
        const response = await fetch("/api/auth/check")
        const data = await response.json()
        setIsAuthenticated(data.authenticated)

        if (!data.authenticated) {
          router.push("/login?redirect=" + window.location.pathname)
        }
      } catch (error) {
        console.error("[v0] Auth check failed:", error)
        router.push("/login")
      } finally {
        setIsChecking(false)
      }
    }

    checkAuth()
  }, [router])

  if (isChecking) {
    return (
      fallback || (
        <div className="flex items-center justify-center min-h-screen bg-[#F5F1E8]">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-[#2C3E50] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-[#2C3E50] font-serif">Verifying credentials...</p>
          </div>
        </div>
      )
    )
  }

  if (!isAuthenticated) {
    return null
  }

  return <>{children}</>
}
