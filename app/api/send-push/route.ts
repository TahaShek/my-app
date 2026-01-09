import admin from "firebase-admin";
import { getMessaging } from "firebase-admin/messaging";
import { NextRequest, NextResponse } from "next/server";
import { supabase } from "../../../lib/supabase/client";

// Environment variables are loaded from Vercel

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID!,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL!,
      privateKey: process.env.FIREBASE_PRIVATE_KEY!.replace(/\\n/g, "\n"),
    }),
  });
}

const messaging = getMessaging();

export async function POST(req: Request) {
  try {
    const { title, body, targetUserId } = await req.json();

    // Fetch tokens filter by targetUserId if provided, otherwise fetch all
    const query = supabase.from("fcm_tokens").select("token")

    if (targetUserId) {
      query.eq("user_id", targetUserId)
    }

    const { data: tokenRows, error: fetchError } = await query

    if (fetchError) throw fetchError

    const allTokens = tokenRows?.map((t: { token: string }) => t.token) || [];

    // Deduplicate tokens to prevent sending multiple notifications to the same device
    const tokens = [...new Set(allTokens)].filter(Boolean) as string[];

    if (!tokens.length) {
      if (targetUserId) {
        return new Response(
          JSON.stringify({ success: true, message: "No registered tokens found for this user", response: { successCount: 0, failureCount: 0 } }),
          { status: 200 }
        );
      }
      return new Response(
        JSON.stringify({ success: false, message: "No tokens found in the database" }),
        { status: 400 }
      );
    }

    console.log(`Sending notification to ${tokens.length} unique token(s)`);

    try {
      const multicastMessage = {
        notification: { title, body },
        tokens,
      };

      const response = await messaging.sendEachForMulticast(multicastMessage);

      return new Response(JSON.stringify({ success: true, response }), { status: 200 });
    } catch (err) {
      console.error("FCM Error:", err);
      return new Response(JSON.stringify({ success: false, error: err }), { status: 500 });
    }
  } catch (err) {
    console.error("API Error:", err);
    return new Response(JSON.stringify({ success: false, error: err }), { status: 500 });
  }
}
