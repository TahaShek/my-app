"use client"

import { useEffect } from "react"
import { messaging } from "@/lib/firebase"
import { registerFcmToken, handleForegroundMessage } from "@/lib/push"
import { supabase } from "@/lib/supabase/client"

export function PushNotificationManager() {
  useEffect(() => {
    if (typeof window === "undefined" || !("serviceWorker" in navigator)) return;

    const setupPush = async () => {
      try {
        // Register Service Worker
        const registration = await navigator.serviceWorker.register("/firebase-messaging-sw.js", {
          scope: "/",
        });
        console.log("Service Worker registered with scope:", registration.scope);

        // Wait for auth to be ready
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session && messaging) {
          // Register FCM token and link to user
          await registerFcmToken(messaging);
          
          // Setup foreground message handler
          const unsubscribe = handleForegroundMessage(messaging);
          return unsubscribe;
        }
      } catch (error) {
        console.error("Error setting up push notifications:", error);
      }
    };

    const unsubscribePromise = setupPush();

    // Re-run setup on auth change
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event: string, session: any) => {
      if (session && messaging) {
        await registerFcmToken(messaging);
      }
    });

    return () => {
      subscription.unsubscribe();
      unsubscribePromise.then(unsubscribe => {
        if (typeof unsubscribe === 'function') unsubscribe();
      });
    };
  }, []);

  return null; // This component doesn't render anything
}
