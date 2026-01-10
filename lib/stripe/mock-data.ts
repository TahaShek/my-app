// Mock data for testing without Stripe
export const mockStripeData = {
  testCards: {
    success: '4242424242424242',
    authentication: '4000000000003220',
    declined: '4000000000009995'
  },

  testPaymentIntents: {
    starter: {
      id: 'pi_mock_starter_' + Date.now(),
      amount: 500,
      currency: 'usd',
      status: 'succeeded',
      metadata: {
        userId: 'mock_user',
        pointPackage: 'starter',
        points: '100'
      }
    },
    popular: {
      id: 'pi_mock_popular_' + Date.now(),
      amount: 2000,
      currency: 'usd',
      status: 'succeeded',
      metadata: {
        userId: 'mock_user',
        pointPackage: 'popular',
        points: '500'
      }
    },
    premium: {
      id: 'pi_mock_premium_' + Date.now(),
      amount: 4000,
      currency: 'usd',
      status: 'succeeded',
      metadata: {
        userId: 'mock_user',
        pointPackage: 'premium',
        points: '1200'
      }
    }
  }
}