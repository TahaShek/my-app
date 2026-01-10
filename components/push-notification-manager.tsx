"use client"

import { useEffect, useRef } from "react"
import { messaging } from "@/lib/firebase"
import { registerFcmToken, handleForegroundMessage } from "@/lib/push"
import { supabase } from "@/lib/supabase/client"

export function PushNotificationManager() {
  const isInitialized = useRef(false)
  const unsubscribeRef = useRef<(() => void) | null>(null)
  const authUnsubscribeRef = useRef<(() => void) | null>(null)

  useEffect(() => {
    // Prevent double initialization
    if (isInitialized.current) return
    isInitialized.current = true

    // Only run in browser with service worker support
    if (typeof window === "undefined" || !("serviceWorker" in navigator)) {
      return
    }

    const setupPush = async () => {
      try {
        // Wait for page to be fully loaded to avoid blocking render
        if (document.readyState !== "complete") {
          await new Promise(resolve => {
            window.addEventListener("load", resolve, { once: true })
          })
        }

        // Small delay to ensure UI is responsive
        await new Promise(resolve => setTimeout(resolve, 1000))

        console.log("🔔 Initializing Push Notifications...")

        // Register service worker (non-blocking)
        let registration: ServiceWorkerRegistration | undefined

        try {
          registration = await navigator.serviceWorker.getRegistration("/")
          
          if (!registration) {
            registration = await navigator.serviceWorker.register(
              "/firebase-messaging-sw.js",
              { 
                scope: "/",
                updateViaCache: "none"
              }
            )
            console.log("✅ Service Worker registered")
          } else {
            console.log("✅ Service Worker already registered")
          }

          // Don't wait for ready - continue in background
          navigator.serviceWorker.ready.then(() => {
            console.log("✅ Service Worker ready")
          })

        } catch (swError) {
          console.error("⚠️ Service Worker error:", swError)
          // Continue anyway - push notifications are optional
          return
        }

        // Check auth state (non-blocking)
        const { data: { session } } = await supabase.auth.getSession()
        
        if (session && messaging) {
          // Register token in background (don't await)
          registerFcmToken(messaging).then(() => {
            console.log("✅ FCM token registered in background")
          }).catch(err => {
            console.log("ℹ️ FCM registration skipped:", err.message)
          })
          
          // Setup foreground message handler
          try {
            const messageUnsubscribe = handleForegroundMessage(messaging)
            unsubscribeRef.current = messageUnsubscribe
          } catch (err) {
            console.log("ℹ️ Foreground messages not available")
          }
        }

        // Listen for auth changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event: string, session: any) => {
          if (event === "SIGNED_IN" && session && messaging) {
            // Register token in background
            registerFcmToken(messaging).catch(() => {})
            
            if (!unsubscribeRef.current) {
              try {
                const messageUnsubscribe = handleForegroundMessage(messaging)
                unsubscribeRef.current = messageUnsubscribe
              } catch (err) {
                // Silent fail
              }
            }
          } else if (event === "SIGNED_OUT") {
            if (unsubscribeRef.current) {
              unsubscribeRef.current()
              unsubscribeRef.current = null
            }
          }
        })

        authUnsubscribeRef.current = () => subscription.unsubscribe()

      } catch (error: any) {
        // Silently handle errors - push notifications are optional
        if (!error.message?.includes("abort")) {
          console.log("ℹ️ Push notifications unavailable")
        }
      }
    }

    // Run setup asynchronously (non-blocking)
    setupPush()

    // Cleanup
    return () => {
      if (authUnsubscribeRef.current) {
        authUnsubscribeRef.current()
      }
      if (unsubscribeRef.current) {
        unsubscribeRef.current()
      }
    }
  }, [])

  return null
}