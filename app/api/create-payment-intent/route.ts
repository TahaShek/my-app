// app/api/create-payment/route.ts
import { NextResponse } from "next/server";
import Stripe from "stripe";
import { createClient } from "@/lib/supabase/server";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-12-15.clover",
});

// Points packages
const packages = [
  { id: "starter", price: 500, points: 50, bonus: 0 },
  { id: "popular", price: 900, points: 100, bonus: 10 },
  { id: "premium", price: 1500, points: 200, bonus: 15 },
];

export async function POST(req: Request) {
  try {
    const { packageId } = await req.json();
    
    // 1. Authenticate User
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: "Unauthorized. Please sign in." },
        { status: 401 }
      );
    }

    // 2. Validate Package
    const selectedPackage = packages.find((p) => p.id === packageId);
    if (!selectedPackage) {
      return NextResponse.json(
        { error: "Invalid package selected" },
        { status: 400 }
      );
    }

    const totalPoints = selectedPackage.points + selectedPackage.bonus;

    // 3. Create PaymentIntent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: selectedPackage.price,
      currency: "usd",
      automatic_payment_methods: {
        enabled: true,
      },
      metadata: {
        userId: user.id,
        userEmail: user.email || "",
        packageId: selectedPackage.id,
        points: totalPoints.toString(),
        type: "points_purchase",
        timestamp: new Date().toISOString(),
      },
      description: `Purchase ${totalPoints} Book Exchange Points`,
    });

    return NextResponse.json({
      success: true,
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
      points: totalPoints,
      amount: selectedPackage.price / 100,
    });

  } catch (err: any) {
    console.error("Payment Intent Error:", err);
    return NextResponse.json(
      { 
        success: false,
        error: err.message || "An unexpected error occurred" 
      },
      { status: 500 }
    );
  }
}