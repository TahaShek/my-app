importScripts("https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/10.7.1/firebase-messaging-compat.js");

firebase.initializeApp({
  apiKey: "AIzaSyDk83eg5dLG2ywL3T62PIYGR604wvTjD9I",
  authDomain: "push-98067.firebaseapp.com",
  projectId: "push-98067",
  messagingSenderId: "969821201558",
  appId: "1:969821201558:web:f9b66f4a6745a741d00eb7",
});

const messaging = firebase.messaging();

// Helper function to get and increment notification count using IndexedDB
async function getAndIncrementNotificationCount() {
  return new Promise((resolve) => {
    const request = indexedDB.open("notificationDB", 1);
    
    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains("counts")) {
        db.createObjectStore("counts");
      }
    };
    
    request.onsuccess = (event) => {
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
      // Fallback to in-memory counter if IndexedDB fails
      if (typeof self.notificationCount === "undefined") {
        self.notificationCount = 0;
      }
      self.notificationCount += 1;
      resolve(self.notificationCount);
    };
  });
}

messaging.onBackgroundMessage(async (payload) => {
  const notificationCount = await getAndIncrementNotificationCount();
  
  console.log(`Background message received. Total notifications: ${notificationCount}`, payload);

  self.registration.showNotification(
    payload.notification?.title || "Notification",
    {
      body: payload.notification?.body,
    }
  );
});
