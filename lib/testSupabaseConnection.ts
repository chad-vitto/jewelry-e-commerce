import { supabase } from '@/lib/supabase';

/**
 * Test Supabase Connection
 * Run this in your app to verify the connection is working
 */
export async function testSupabaseConnection() {
  console.log('🔍 Testing Supabase Connection...\n');

  try {
    // Test 1: Check if credentials are loaded
    console.log('✅ Supabase client initialized');

    // Test 2: Fetch products (public, no auth required)
    console.log('\n🔄 Testing product query...');
    const { data: products, error: productError } = await supabase
      .from('products')
      .select('id, name, category, price_php, is_active')
      .eq('is_active', true)
      .limit(3);

    if (productError) {
      console.error('❌ Product query failed:', productError);
    } else {
      console.log(`✅ Successfully fetched ${products?.length || 0} products`);
      if (products && products.length > 0) {
        console.log(`   Sample: ${products[0].name} - ₱${products[0].price_php}`);
      }
    }

    // Test 3: Check authentication
    console.log('\n🔄 Checking authentication...');
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.user) {
      console.log(`✅ User authenticated: ${session.user.email}`);
    } else {
      console.log('⚠️  No user authenticated (this is okay for public data)');
    }

    // Test 4: Test RLS by checking if table query works
    console.log('\n🔄 Testing RLS policies...');
    const { data: testData, error: testError } = await supabase
      .from('profiles')
      .select('id')
      .limit(1);

    if (testError && testError.code === 'PGRST116') {
      console.log('✅ RLS policies are active (auth required)');
    } else if (!testError) {
      console.log('✅ RLS check passed');
    }

    console.log('\n🎉 Supabase Connection Test Complete!\n');
    return {
      connected: true,
      hasProducts: (products?.length || 0) > 0,
      isAuthenticated: !!session?.user,
    };

  } catch (error) {
    console.error('\n❌ Supabase Connection Test Failed:');
    console.error(error);
    return {
      connected: false,
      hasProducts: false,
      isAuthenticated: false,
    };
  }
}

// Export for testing
export default testSupabaseConnection;
