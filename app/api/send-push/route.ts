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
  const { title, body } = await req.json();

  // Fetch tokens from Supabase
  const { data: tokenRows } = await supabase.from("fcm_tokens").select("token");
  const allTokens = tokenRows?.map((t: { token: string }) => t.token) || [];
  
  // Deduplicate tokens to prevent sending multiple notifications to the same device
  const tokens = [...new Set(allTokens)].filter(Boolean) as string[];

  if (!tokens.length) {
    return new Response(
      JSON.stringify({ success: false, message: "No tokens provided" }),
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
}
