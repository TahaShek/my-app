importScripts("https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js")
importScripts("https://www.gstatic.com/firebasejs/10.7.1/firebase-messaging-compat.js")

// Initialize Firebase
firebase.initializeApp({
  apiKey: "AIzaSyDk83eg5dLG2ywL3T62PIYGR604wvTjD9I",
  authDomain: "push-98067.firebaseapp.com",
  projectId: "push-98067",
  messagingSenderId: "969821201558",
  appId: "1:969821201558:web:f9b66f4a6745a741d00eb7",
})

const messaging = firebase.messaging()

// Simple in-memory counter (resets on SW restart)
let notificationCount = 0

// Handle background messages
messaging.onBackgroundMessage((payload) => {
  notificationCount++
  
  console.log(`📬 Background message #${notificationCount}:`, payload)

  const notificationTitle = payload.notification?.title || "BooksExchange"
  const notificationOptions = {
    body: payload.notification?.body || "",
    icon: "/icon-192x192.png",
    badge: "/icon-192x192.png",
    tag: "booksexchange-notification",
    data: payload.data,
  }

  return self.registration.showNotification(notificationTitle, notificationOptions)
})

// Handle notification clicks
self.addEventListener("notificationclick", (event) => {
  console.log("🖱️ Notification clicked:", event.notification)
  
  event.notification.close()

  // Open the app when notification is clicked
  event.waitUntil(
    clients.matchAll({ type: "window", includeUncontrolled: true }).then((clientList) => {
      // If app is already open, focus it
      for (const client of clientList) {
        if (client.url.includes(self.registration.scope) && "focus" in client) {
          return client.focus()
        }
      }
      // Otherwise open new window
      if (clients.openWindow) {
        return clients.openWindow("/")
      }
    })
  )
})

console.log("✅ Firebase Messaging Service Worker loaded")