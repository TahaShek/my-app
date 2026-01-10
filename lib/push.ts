import { getToken, onMessage } from "firebase/messaging";
import { supabase } from "./supabase/client";

export async function registerFcmToken(messaging: any) {
  if (typeof window === "undefined") return null;

  try {
    const registration = await navigator.serviceWorker.ready;

    const token = await getToken(messaging, {
      vapidKey: process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY,
      serviceWorkerRegistration: registration,
    });

    if (token) {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        // Link the token to the logged-in user
        const { error: upsertError } = await supabase
          .from("fcm_tokens")
          .upsert(
            { token, user_id: user.id },
            { onConflict: 'token' }
          );

        if (upsertError) {
          console.error("Failed to sync FCM token with user profile:", upsertError);
        }
      }
    }

    return token;
  } catch (error) {
    console.error("Error registering FCM token:", error);
    return null;
  }
}

export function handleForegroundMessage(messaging: any) {
  if (!messaging) return () => { };

  return onMessage(messaging, async (payload) => {
    // Get and increment notification count using IndexedDB (shared with service worker)
    const getAndIncrementCount = async () => {
      return new Promise<number>((resolve) => {
        const request = indexedDB.open("notificationDB", 1);

        request.onupgradeneeded = (event: any) => {
          const db = event.target.result;
          if (!db.objectStoreNames.contains("counts")) {
            db.createObjectStore("counts");
          }
        };

        request.onsuccess = (event: any) => {
          const db = event.target.result;
          const transaction = db.transaction(["counts"], "readwrite");
          const store = transaction.objectStore("counts");

          const getRequest = store.get("notificationCount");
          getRequest.onsuccess = () => {
            const currentCount = getRequest.result || 0;
            const newCount = currentCount + 1;

            const putRequest = store.put(newCount, "notificationCount");
            putRequest.onsuccess = () => {
              resolve(newCount);
            };
          };
        };

        request.onerror = () => {
          // Fallback to localStorage if IndexedDB fails
          const currentCount = parseInt(localStorage.getItem("notificationCount") || "0", 10);
          const newCount = currentCount + 1;
          localStorage.setItem("notificationCount", newCount.toString());
          resolve(newCount);
        };
      });
    };

    const notificationCount = await getAndIncrementCount();

    console.log(`Foreground message received. Total notifications: ${notificationCount}`, payload);

    // Check if permission is granted
    if (Notification.permission === "granted") {
      new Notification(payload.notification?.title || "Notification", {
        body: payload.notification?.body,
        icon: '/favicon.ico', // Optional: add an icon
      });
    }
  });
}