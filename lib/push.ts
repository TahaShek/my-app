import { getToken } from "firebase/messaging";
import { messaging } from "./firebase";
import { supabase } from "./supabase";

export async function registerFcmToken() {
  if (!messaging) return null;

  const permission = await Notification.requestPermission();
  if (permission !== "granted") {
    console.log("Notification permission denied");
    return null;
  }

  const token = await getToken(messaging, {
    vapidKey: process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY,
  });

  console.log("FCM Token:", token);

  if (token) {
    // Check if token already exists to prevent duplicates
    const { data: existing } = await supabase
      .from("fcm_tokens")
      .select("token")
      .eq("token", token)
      .single();
    
    // Only insert if token doesn't exist
    if (!existing) {
      await supabase.from("fcm_tokens").insert({ token });
    }
  }

  return token;
}
