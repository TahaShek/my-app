const Stripe = require('stripe');

// Load environment variables
require('dotenv').config({ path: '.env.local' });

const stripeSecretKey = process.env.STRIPE_TEST_SECRET_KEY || process.env.STRIPE_SECRET_KEY;

console.log('🔍 Checking Stripe configuration...');
console.log('Environment:', process.env.NODE_ENV);
console.log('Key length:', stripeSecretKey?.length || 0);
console.log('Key starts with:', stripeSecretKey?.substring(0, 7) || 'none');

async function testStripe() {
  if (!stripeSecretKey) {
    console.error('❌ No Stripe secret key found in environment variables');
    console.log('Check your .env.local file has STRIPE_TEST_SECRET_KEY');
    return;
  }

  if (!stripeSecretKey.startsWith('sk_test_') && !stripeSecretKey.startsWith('sk_live_')) {
    console.error('❌ Invalid Stripe key format. Should start with sk_test_ or sk_live_');
    console.log('Current key start:', stripeSecretKey.substring(0, 10) + '...');
    return;
  }

  try {
    // Initialize Stripe
    const stripe = new Stripe(stripeSecretKey, {
      apiVersion: '2025-01-27.acacia',
    });

    console.log('✅ Stripe initialized successfully');

    // Test 1: List payment methods (simple API call)
    console.log('\n🔧 Test 1: Testing API connection...');
    const paymentMethods = await stripe.paymentMethods.list({
      limit: 1,
    });
    console.log('✅ API connection successful');

    // Test 2: Create a test payment intent
    console.log('\n🔧 Test 2: Creating test payment intent...');
    const paymentIntent = await stripe.paymentIntents.create({
      amount: 1000, // $10.00
      currency: 'usd',
      description: 'Test payment for BooksExchange',
      metadata: {
        test: 'true',
        userId: 'test_user_123',
        pointPackage: 'starter'
      },
    });

    console.log('✅ Test payment intent created');
    console.log('   ID:', paymentIntent.id);
    console.log('   Amount:', `$${(paymentIntent.amount / 100).toFixed(2)}`);
    console.log('   Status:', paymentIntent.status);
    console.log('   Client Secret:', paymentIntent.client_secret?.substring(0, 20) + '...');

    // Test 3: Cancel the test payment intent
    console.log('\n🔧 Test 3: Cleaning up test payment intent...');
    const canceledIntent = await stripe.paymentIntents.cancel(paymentIntent.id);
    console.log('✅ Test payment intent canceled');
    console.log('   Final status:', canceledIntent.status);

    console.log('\n🎉 All tests passed! Your Stripe integration is working correctly.');

  } catch (error) {
    console.error('\n❌ Stripe test failed:');
    console.error('Error type:', error.type || 'Unknown error');
    console.error('Error message:', error.message);
    console.error('\n💡 Troubleshooting tips:');
    console.log('1. Make sure your API key is correct');
    console.log('2. Check if the key has proper permissions');
    console.log('3. Verify you are in test mode (sk_test_)');
    console.log('4. Check Stripe Dashboard for API key status');
  }
}

testStripe();