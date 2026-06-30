import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useEffect, useState } from 'react';
import { testSupabaseConnection } from '@/lib/testSupabaseConnection';

interface TestResult {
  connected: boolean;
  hasProducts: boolean;
  isAuthenticated: boolean;
}

export default function SupabaseConnectionTest() {
  const [result, setResult] = useState<TestResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    runTest();
  }, []);

  const runTest = async () => {
    setLoading(true);
    setError(null);
    try {
      const testResult = await testSupabaseConnection();
      setResult(testResult);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <ActivityIndicator size="large" color="#D4AF37" />
        <Text className="mt-4 text-gray-700">Testing Supabase connection...</Text>
      </View>
    );
  }

  return (
    <ScrollView className="flex-1 bg-white p-4">
      <Text className="text-2xl font-bold text-gray-900 mb-6">Supabase Connection Test</Text>

      <View className="bg-gray-50 rounded-lg p-4 mb-4 border border-gray-200">
        <View className="flex-row items-center mb-3">
          <Text className={`text-lg font-semibold ${result?.connected ? 'text-green-600' : 'text-red-600'}`}>
            {result?.connected ? '✅' : '❌'} Connection Status
          </Text>
        </View>
        <Text className="text-gray-700">
          {result?.connected ? 'Connected to Supabase' : 'Failed to connect to Supabase'}
        </Text>
      </View>

      <View className="bg-gray-50 rounded-lg p-4 mb-4 border border-gray-200">
        <View className="flex-row items-center mb-3">
          <Text className={`text-lg font-semibold ${result?.hasProducts ? 'text-green-600' : 'text-orange-600'}`}>
            {result?.hasProducts ? '✅' : '⚠️'} Products Available
          </Text>
        </View>
        <Text className="text-gray-700">
          {result?.hasProducts ? 'Products loaded from database' : 'No products found or database error'}
        </Text>
      </View>

      <View className="bg-gray-50 rounded-lg p-4 mb-4 border border-gray-200">
        <View className="flex-row items-center mb-3">
          <Text className={`text-lg font-semibold ${result?.isAuthenticated ? 'text-green-600' : 'text-blue-600'}`}>
            {result?.isAuthenticated ? '✅' : 'ℹ️'} Authentication
          </Text>
        </View>
        <Text className="text-gray-700">
          {result?.isAuthenticated ? 'User is authenticated' : 'No user logged in (public data available)'}
        </Text>
      </View>

      {error && (
        <View className="bg-red-50 rounded-lg p-4 mb-4 border border-red-200">
          <Text className="text-red-600 font-semibold mb-2">Error</Text>
          <Text className="text-red-700 text-sm">{error}</Text>
        </View>
      )}

      <TouchableOpacity
        onPress={runTest}
        className="bg-yellow-600 rounded-lg p-4 items-center mt-4"
      >
        <Text className="text-white font-semibold">Re-run Test</Text>
      </TouchableOpacity>

      <View className="mt-6 bg-blue-50 rounded-lg p-4 border border-blue-200">
        <Text className="text-blue-900 font-semibold mb-2">📝 Next Steps:</Text>
        <Text className="text-blue-800 text-sm mb-2">
          1. Check browser console for detailed test output
        </Text>
        <Text className="text-blue-800 text-sm mb-2">
          2. If connected: Your Supabase integration is working! ✅
        </Text>
        <Text className="text-blue-800 text-sm">
          3. If not connected: Check your .env file credentials
        </Text>
      </View>
    </ScrollView>
  );
}
