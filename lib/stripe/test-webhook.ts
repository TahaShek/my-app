// For testing ONLY - generate a random webhook secret
export const TEST_WEBHOOK_SECRET = 'whsec_test_' +
  Buffer.from(Date.now().toString()).toString('base64').slice(0, 32)

// Simulate webhook events for testing
export async function simulateStripeWebhook(eventType: string, payload: any) {
  const event = {
    id: 'evt_test_' + Date.now(),
    type: eventType,
    data: {
      object: {
        ...payload,
        metadata: {
          userId: 'test_user_123',
          pointPackage: 'starter',
          points: '100'
        }
      }
    }
  }

  // Call your webhook handler directly
  await fetch('/api/webhooks/stripe', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'stripe-signature': 'test_signature'
    },
    body: JSON.stringify(event)
  })
}