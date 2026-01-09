"use client";

import { useEffect } from "react";
import { registerFcmToken } from "@/lib/push";
import { messaging } from "@/lib/firebase";
import { supabase } from "@/lib/supabase/client";

export default function ServiceWorkerRegister() {
  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker
        .register("/firebase-messaging-sw.js")
        .then((reg) => {
          console.log("Service Worker registered:", reg.scope);
          // Register token once SW is ready and user is logged in
          if (messaging) {
            registerFcmToken(messaging);
          }
        })
        .catch((err) => {
          console.error("SW registration failed:", err);
        });

      // Also listen for auth state changes to re-register token
      const { data: { subscription } } = supabase.auth.onAuthStateChange((event: any, session: any) => {
        if (event === 'SIGNED_IN' && messaging) {
          registerFcmToken(messaging);
        }
      });

      return () => {
        subscription.unsubscribe();
      };
    }
  }, []);

  return null;
}