import admin from "firebase-admin";
import { getMessaging } from "firebase-admin/messaging";
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

/* ------------------------------------------------------------------ */
/* Supabase SERVER client (service role) */
/* ------------------------------------------------------------------ */
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

/* ------------------------------------------------------------------ */
/* Firebase Admin Initialization */
/* ------------------------------------------------------------------ */
if (!admin.apps.length) {
  if (
    !process.env.FIREBASE_PROJECT_ID ||
    !process.env.FIREBASE_CLIENT_EMAIL ||
    !process.env.FIREBASE_PRIVATE_KEY
  ) {
    throw new Error("Missing Firebase environment variables");
  }

  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, "\n"),
    }),
  });
}

const messaging = getMessaging();

/* ------------------------------------------------------------------ */
/* POST: Send Push Notification */
/* ------------------------------------------------------------------ */
export async function POST(req: Request) {
  try {
    const { title, body, targetUserId } = await req.json();

    if (!title || !body || !targetUserId) {
      return NextResponse.json(
        { success: false, message: "Title, body, and targetUserId are required" },
        { status: 400 }
      );
    }

    /* -------------------------------------------------------------- */
    /* Fetch FCM tokens from Supabase */
    /* -------------------------------------------------------------- */
    const { data: tokenRows, error } = await supabase
      .from("fcm_tokens")
      .select("token")
      .eq("user_id", targetUserId);

    if (error) {
      throw error;
    }

    const tokens = [
      ...new Set(
        tokenRows
          ?.map((row: { token: string }) => row.token)
          .filter(Boolean)
      ),
    ];

    if (!tokens.length) {
      return NextResponse.json(
        { success: false, message: "No FCM tokens found" },
        { status: 400 }
      );
    }

    console.log(`📤 Sending push to ${tokens.length} device(s)`);

    /* -------------------------------------------------------------- */
    /* Send push notification */
    /* -------------------------------------------------------------- */
    const message = {
      notification: { title, body },
      tokens,
    };

    const response = await messaging.sendEachForMulticast(message);

    /* -------------------------------------------------------------- */
    /* Cleanup invalid tokens */
    /* -------------------------------------------------------------- */
    const invalidTokens: string[] = [];

    response.responses.forEach((res, index) => {
      if (!res.success) {
        const code = res.error?.code;
        if (
          code === "messaging/invalid-registration-token" ||
          code === "messaging/registration-token-not-registered"
        ) {
          invalidTokens.push(tokens[index]);
        }
      }
    });

    if (invalidTokens.length) {
      await supabase
        .from("fcm_tokens")
        .delete()
        .in("token", invalidTokens);

      console.log(`🧹 Removed ${invalidTokens.length} invalid token(s)`);
    }

    return NextResponse.json({
      success: true,
      sent: response.successCount,
      failed: response.failureCount,
    });
  } catch (err: any) {
    console.error("❌ Push Error:", err);

    return NextResponse.json(
      {
        success: false,
        error: err?.message || "Internal Server Error",
      },
      { status: 500 }
    );
  }
}
