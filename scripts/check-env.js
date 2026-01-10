require('dotenv').config({ path: '.env.local' });

console.log('📋 Environment Variables Check');
console.log('==============================');

const envVars = {
  'STRIPE_TEST_SECRET_KEY': process.env.STRIPE_TEST_SECRET_KEY,
  'NEXT_PUBLIC_STRIPE_TEST_PUBLISHABLE_KEY': process.env.NEXT_PUBLIC_STRIPE_TEST_PUBLISHABLE_KEY,
  'STRIPE_TEST_WEBHOOK_SECRET': process.env.STRIPE_TEST_WEBHOOK_SECRET,
  'BASE_URL': process.env.BASE_URL,
};

Object.entries(envVars).forEach(([key, value]) => {
  if (!value) {
    console.log(`❌ ${key}: MISSING`);
  } else if (key.includes('SECRET') || key.includes('KEY')) {
    const masked = value.substring(0, 10) + '...' + value.substring(value.length - 4);
    console.log(`✅ ${key}: ${masked} (${value.length} chars)`);

    // Validate Stripe key format
    if (key.includes('STRIPE') && key.includes('KEY')) {
      if (!value.startsWith('sk_test_') && !value.startsWith('sk_live_') &&
        !value.startsWith('pk_test_') && !value.startsWith('pk_live_')) {
        console.log(`   ⚠️  Warning: Doesn't look like a valid Stripe key format`);
      }
    }
  } else {
    console.log(`✅ ${key}: ${value}`);
  }
});

console.log('\n🔧 Next steps:');
console.log('1. Copy your real keys from Stripe Dashboard');
console.log('2. Update .env.local file');
console.log('3. Run: node scripts/test-webhook.js');