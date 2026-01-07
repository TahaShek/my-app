"use client";
import { onMessage } from "firebase/messaging";
import { messaging } from "../lib/firebase";

import { useEffect, useState, useRef } from "react";
import { registerFcmToken } from "../lib/push";

export default function HomePage() {
  const [isSending, setIsSending] = useState(false);
  const lastClickTime = useRef(0);

  useEffect(() => {
    registerFcmToken();
  }, []);

  const sendNotification = async () => {
    // Prevent rapid clicks (debounce - 2 seconds)
    const now = Date.now();
    if (now - lastClickTime.current < 2000) {
      console.log("Please wait before sending another notification");
      return;
    }
    lastClickTime.current = now;

    if (isSending) return;
    
    setIsSending(true);
    try {
      const res = await fetch("/api/send-push", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: "Hello from Next.js App Router!",
          body: "This is a push notification 🚀",
        }),
      });

      const data = await res.json();
      console.log(data);
    } catch (error) {
      console.error("Error sending notification:", error);
    } finally {
      setIsSending(false);
    }
  };
  useEffect(() => {
    if (!messaging) return;
  
    onMessage(messaging, async (payload) => {
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
      new Notification(payload.notification?.title || "Notification", {
        body: payload.notification?.body,
      });
    });
  }, []);
  

  return (
    <div style={{ padding: 20 }}>
      <h1>Push Notification Demo</h1>
      <button onClick={sendNotification} disabled={isSending}>
        {isSending ? "Sending..." : "Send Notification"}
      </button>
    </div>
  );
}
