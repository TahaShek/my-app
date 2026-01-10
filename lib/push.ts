import { Messaging, getToken, onMessage } from "firebase/messaging"
import { supabase } from "./supabase/client"

let isRegistering = false
let registrationPromise: Promise<string | null> | null = null

export async function registerFcmToken(messaging: Messaging): Promise<string | null> {
  // Return existing promise if already registering
  if (isRegistering && registrationPromise) {
    return registrationPromise
  }

  isRegistering = true

  registrationPromise = (async () => {
    try {
      // Check permission first
      if (Notification.permission === "denied") {
        console.log("ℹ️ Notifications blocked by user")
        return null
      }

      // Request permission if needed
      const permission = Notification.permission === "granted" 
        ? "granted" 
        : await Notification.requestPermission()
      
      if (permission !== "granted") {
        console.log("ℹ️ Notification permission not granted")
        return null
      }

      const vapidKey = process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY
      
      if (!vapidKey) {
        console.error("❌ VAPID key not configured")
        return null
      }

      // Get FCM token with timeout
      const tokenPromise = getToken(messaging, { vapidKey })
      const timeoutPromise = new Promise<null>((_, reject) => 
        setTimeout(() => reject(new Error("Token fetch timeout")), 10000)
      )

      const token = await Promise.race([tokenPromise, timeoutPromise]) as string

      if (!token) {
        return null
      }

      // Get current user
      const { data: { user }, error: authError } = await supabase.auth.getUser()
      
      if (authError || !user) {
        return null
      }

      // Save token to database (with retry logic)
      let attempts = 0
      const maxAttempts = 3

      while (attempts < maxAttempts) {
        try {
          const { error } = await supabase
            .from("fcm_tokens")
            .upsert(
              { 
                user_id: user.id, 
                token,
                updated_at: new Date().toISOString()
              },
              { 
                onConflict: "user_id,token",
                ignoreDuplicates: true
              }
            )

          if (!error) {
            console.log("✅ FCM token saved")
            return token
          }

          // If duplicate error, it's already saved - return success
          if (error.code === "23505") {
            console.log("ℹ️ Token already exists")
            return token
          }

          attempts++
          if (attempts < maxAttempts) {
            await new Promise(resolve => setTimeout(resolve, 1000 * attempts))
          }
        } catch (dbError) {
          attempts++
        }
      }

      return null

    } catch (error: any) {
      if (!error.message?.includes("timeout") && !error.message?.includes("abort")) {
        console.log("ℹ️ FCM registration skipped:", error.message)
      }
      return null
    } finally {
      isRegistering = false
      registrationPromise = null
    }
  })()

  return registrationPromise
}

export function handleForegroundMessage(messaging: Messaging) {
  try {
    const unsubscribe = onMessage(messaging, (payload) => {
      const { title, body } = payload.notification || {}
      
      if (title && body && Notification.permission === "granted") {
        try {
          new Notification(title, {
            body,
            icon: "/icon-192x192.png",
            badge: "/icon-192x192.png",
            tag: "booksexchange-notification",
            requireInteraction: false,
          })
        } catch (notifError) {
          console.log("ℹ️ Could not show notification")
        }
      }
    })

    return unsubscribe
  } catch (error) {
    console.log("ℹ️ Foreground messages not available")
    return () => {}
  }
}