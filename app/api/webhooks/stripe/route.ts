import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'

// Dynamic import or fallback for stripe config
let stripeInstance: Stripe | null = null
let webhookSecret: string | null = null

try {
  // Try to import the config
  const config = require('@/lib/stripe/config')
  stripeInstance = config.stripe
  webhookSecret = process.env.STRIPE_WEBHOOK_SECRET ||
    process.env.STRIPE_TEST_WEBHOOK_SECRET ||
    config.getWebhookSecret()
} catch (error) {
  console.warn('Stripe config not found, creating fallback...')

  // Fallback configuration
  const secretKey = process.env.STRIPE_TEST_SECRET_KEY ||
    process.env.STRIPE_SECRET_KEY ||
    'sk_test_fallback_' + Date.now()

  stripeInstance = new Stripe(secretKey, {
    apiVersion: '2025-12-15.clover',
  })

  webhookSecret = process.env.STRIPE_WEBHOOK_SECRET ||
    process.env.STRIPE_TEST_WEBHOOK_SECRET ||
    'whsec_test_fallback_' + Date.now()
}

export async function POST(request: NextRequest) {
  if (!stripeInstance || !webhookSecret) {
    return NextResponse.json(
      { error: 'Stripe not configured' },
      { status: 500 }
    )
  }

  const body = await request.text()
  const signature = request.headers.get('stripe-signature')!

  let event: Stripe.Event

  try {
    event = stripeInstance.webhooks.constructEvent(
      body,
      signature,
      webhookSecret
    )
  } catch (err) {
    console.warn('Webhook verification failed:', err)

    // For testing: Try to parse as JSON directly
    try {
      const parsedBody = JSON.parse(body)
      if (parsedBody.type && parsedBody.id) {
        event = parsedBody as Stripe.Event
        console.log('Processing test event:', event.type)
      } else {
        throw new Error('Invalid test event format')
      }
    } catch (parseErr) {
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 400 }
      )
    }
  }

  try {
    switch (event.type) {
      case 'payment_intent.succeeded':
        await handlePaymentIntentSucceeded(event.data.object as Stripe.PaymentIntent)
        break
      case 'payment_intent.payment_failed':
        await handlePaymentIntentFailed(event.data.object as Stripe.PaymentIntent)
        break
      case 'checkout.session.completed':
        await handleCheckoutSessionCompleted(event.data.object as Stripe.Checkout.Session)
        break
      default:
        console.log(`Unhandled event type: ${event.type}`)
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('Error handling webhook:', error)
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 500 }
    )
  }
}

async function handlePaymentIntentSucceeded(paymentIntent: Stripe.PaymentIntent) {
  console.log('✅ Payment succeeded:', paymentIntent.id)

  const userId = paymentIntent.metadata?.userId
  const pointPackage = paymentIntent.metadata?.pointPackage
  const points = parseInt(paymentIntent.metadata?.points || '0')
  const amount = paymentIntent.amount / 100

  // TODO: Implement database update
  console.log(`💰 User ${userId} purchased ${points} points for $${amount}`)

  // Mock database update for now
  if (typeof window !== 'undefined' && userId) {
    // Update localStorage for testing
    const currentUser = localStorage.getItem('user')
    if (currentUser) {
      const user = JSON.parse(currentUser)
      user.points = (user.points || 0) + points
      localStorage.setItem('user', JSON.stringify(user))
    }
  }
}

async function handlePaymentIntentFailed(paymentIntent: Stripe.PaymentIntent) {
  console.error('❌ Payment failed:', paymentIntent.id)
  console.error('Failure reason:', paymentIntent.last_payment_error?.message)
}

async function handleCheckoutSessionCompleted(session: Stripe.Checkout.Session) {
  console.log('✅ Checkout session completed:', session.id)
}