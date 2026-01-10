import Stripe from 'stripe'

// Initialize Stripe with your test key
export const stripe = new Stripe(
  process.env.STRIPE_TEST_SECRET_KEY || process.env.STRIPE_SECRET_KEY || '',
  {
    apiVersion: '2025-12-15.clover', // Use latest API version
    appInfo: {
      name: 'BooksExchange',
      version: '1.0.0',
    },
  }
)

// Helper to get publishable key
export const getStripePublishableKey = (): string => {
  return (
    process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY ||
    process.env.NEXT_PUBLIC_STRIPE_TEST_PUBLISHABLE_KEY ||
    ''
  )
}

// Mock webhook secret for testing (only if no real secret is set)
export const getWebhookSecret = (): string => {
  return (
    process.env.STRIPE_WEBHOOK_SECRET ||
    process.env.STRIPE_TEST_WEBHOOK_SECRET ||
    'whsec_test_fallback_' + Date.now() // Fallback for testing
  )
}