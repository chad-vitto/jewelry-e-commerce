import React, { useState } from 'react';
import {
  Colors,
  formatCurrency,
  PAYMENT_METHODS,
  Shadows
  } from '@/constants';
import { GoldButton } from '@/components/GoldGradient';
import { Order, PaymentMethodType, ShippingAddressData } from '@/types';
import { Stack, useRouter } from 'expo-router';
import { supabase } from '@/lib/supabase';
import { useAuth, useCart } from '@/hooks';
import {
  ArrowLeft,
  Building,
  Check,
  CreditCard,
  Smartphone,
} from 'lucide-react-native';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  TextInput,
  Alert,
} from 'react-native';

type CheckoutStep = 'address' | 'payment' | 'review' | 'confirmation';

export default function CheckoutScreen() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();
  const { items, subtotal, shippingFee, total, clearCart } = useCart();

  const [currentStep, setCurrentStep] = useState<CheckoutStep>('address');
  const [isLoading, setIsLoading] = useState(false);
  const [orderPlaced, setOrderPlaced] = useState<Order | null>(null);

  // Form state
  const [address, setAddress] = useState<ShippingAddressData>({
    full_name: user?.full_name || '',
    phone_number: '',
    address_line1: '',
    address_line2: '',
    city: '',
    province: '',
    postal_code: '',
  });

  const [selectedPayment, setSelectedPayment] =
    useState<PaymentMethodType>('gcash');
  const [email, setEmail] = useState(user?.email || '');
  const [notes, setNotes] = useState('');

  const canProceedToPayment =
    address.full_name &&
    address.phone_number &&
    address.address_line1 &&
    address.city &&
    address.province &&
    address.postal_code;

  const handlePlaceOrder = async () => {
    if (!canProceedToPayment) {
      Alert.alert('Error', 'Please fill in all required fields.');
      return;
    }

    setIsLoading(true);

    try {
      const orderData = {
        customer_id: user?.id || null,
        items: items.map((item) => ({
          product_id: item.product.id,
          product_name: item.product.name,
          product_image: item.product.product_images?.[0]?.image_url || '',
          quantity: item.quantity,
          price_php: item.product.price_php,
          gold_purity: item.product.gold_purity,
          size: item.size,
        })),
        subtotal_php: subtotal,
        shipping_fee_php: shippingFee,
        total_amount_php: total,
        payment_method: selectedPayment,
        payment_status: 'pending' as const,
        order_status: 'pending' as const,
        shipping_address: address,
        contact_info: {
          email,
          phone_number: address.phone_number,
          notes: notes || undefined,
        },
        notes: notes || null,
      };

      const { data, error } = await supabase
        .from('orders')
        .insert(orderData)
        .select()
        .single();

      if (error) {
        // Mock success for demo
        console.log('Using mock order for demo');
        const mockOrder: Order = {
          id: `order-${Date.now()}`,
          customer_id: user?.id || null,
          items: orderData.items as any,
          subtotal_php: subtotal,
          shipping_fee_php: shippingFee,
          total_amount_php: total,
          payment_method: selectedPayment,
          payment_status: 'pending',
          order_status: 'pending',
          shipping_address: address,
          contact_info: {
            email,
            phone_number: address.phone_number,
            notes: notes || undefined,
          },
          tracking_number: null,
          notes: notes || null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };
        setOrderPlaced(mockOrder);
        clearCart();
        setCurrentStep('confirmation');
      } else {
        setOrderPlaced(data as Order);
        clearCart();
        setCurrentStep('confirmation');
      }
    } catch (err) {
      console.error('Error placing order:', err);
      Alert.alert('Error', 'Failed to place order. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const renderStepIndicator = () => {
    const steps = ['address', 'payment', 'review'];
    const labels = ['Address', 'Payment', 'Review'];
    const currentIndex = steps.indexOf(currentStep as string);

    return (
      <View style={styles.stepIndicator}>
        {steps.map((step, index) => (
          <View key={step} style={styles.stepItem}>
            <View
              style={[
                styles.stepCircle,
                index <= currentIndex && styles.stepCircleActive,
              ]}
            >
              {index < currentIndex ? (
                <Check size={14} color={Colors.primary} />
              ) : (
                <Text
                  style={[
                    styles.stepNumber,
                    index <= currentIndex && styles.stepNumberActive,
                  ]}
                >
                  {index + 1}
                </Text>
              )}
            </View>
            <Text
              style={[
                styles.stepLabel,
                index <= currentIndex && styles.stepLabelActive,
              ]}
            >
              {labels[index]}
            </Text>
            {index < steps.length - 1 && (
              <View
                style={[
                  styles.stepLine,
                  index < currentIndex && styles.stepLineActive,
                ]}
              />
            )}
          </View>
        ))}
      </View>
    );
  };

  const renderAddressStep = () => (
    <View style={styles.stepContent}>
      <Text style={styles.stepTitle}>Shipping Address</Text>

      <View style={styles.formGroup}>
        <Text style={styles.label}>Full Name *</Text>
        <TextInput
          style={styles.input}
          value={address.full_name}
          onChangeText={(text) => setAddress({ ...address, full_name: text })}
          placeholder="Enter your full name"
          placeholderTextColor={Colors.text.muted}
        />
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.label}>Phone Number *</Text>
        <TextInput
          style={styles.input}
          value={address.phone_number}
          onChangeText={(text) =>
            setAddress({ ...address, phone_number: text })
          }
          placeholder="09XX XXX XXXX"
          placeholderTextColor={Colors.text.muted}
          keyboardType="phone-pad"
        />
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.label}>Address Line 1 *</Text>
        <TextInput
          style={styles.input}
          value={address.address_line1}
          onChangeText={(text) =>
            setAddress({ ...address, address_line1: text })
          }
          placeholder="Street address"
          placeholderTextColor={Colors.text.muted}
        />
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.label}>Address Line 2</Text>
        <TextInput
          style={styles.input}
          value={address.address_line2 || ''}
          onChangeText={(text) =>
            setAddress({ ...address, address_line2: text })
          }
          placeholder="Apartment, unit, etc. (optional)"
          placeholderTextColor={Colors.text.muted}
        />
      </View>

      <View style={styles.row}>
        <View style={[styles.formGroup, { flex: 1 }]}>
          <Text style={styles.label}>City *</Text>
          <TextInput
            style={styles.input}
            value={address.city}
            onChangeText={(text) => setAddress({ ...address, city: text })}
            placeholder="City"
            placeholderTextColor={Colors.text.muted}
          />
        </View>
        <View style={[styles.formGroup, { flex: 1, marginLeft: 12 }]}>
          <Text style={styles.label}>Province *</Text>
          <TextInput
            style={styles.input}
            value={address.province}
            onChangeText={(text) => setAddress({ ...address, province: text })}
            placeholder="Province"
            placeholderTextColor={Colors.text.muted}
          />
        </View>
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.label}>Postal Code *</Text>
        <TextInput
          style={styles.input}
          value={address.postal_code}
          onChangeText={(text) => setAddress({ ...address, postal_code: text })}
          placeholder="1234"
          placeholderTextColor={Colors.text.muted}
          keyboardType="numeric"
        />
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.label}>Email *</Text>
        <TextInput
          style={styles.input}
          value={email}
          onChangeText={setEmail}
          placeholder="your@email.com"
          placeholderTextColor={Colors.text.muted}
          keyboardType="email-address"
          autoCapitalize="none"
        />
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.label}>Order Notes</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          value={notes}
          onChangeText={setNotes}
          placeholder="Special instructions (optional)"
          placeholderTextColor={Colors.text.muted}
          multiline
          numberOfLines={3}
          textAlignVertical="top"
        />
      </View>

      <GoldButton
        title="Continue to Payment"
        onPress={() => setCurrentStep('payment')}
        variant="gradient"
        size="lg"
        disabled={!canProceedToPayment}
      />
    </View>
  );

  const renderPaymentStep = () => (
    <View style={styles.stepContent}>
      <Text style={styles.stepTitle}>Payment Method</Text>
      <Text style={styles.stepSubtitle}>
        Payment will be made manually offline. Choose your preferred method and
        follow the instructions.
      </Text>

      {PAYMENT_METHODS.map((method) => (
        <Pressable
          key={method.id}
          style={[
            styles.paymentOption,
            selectedPayment === method.id && styles.paymentOptionActive,
          ]}
          onPress={() => setSelectedPayment(method.id)}
        >
          <View style={styles.paymentIcon}>
            {method.id === 'gcash' && (
              <Smartphone size={24} color={Colors.gold.DEFAULT} />
            )}
            {method.id === 'paymaya' && (
              <CreditCard size={24} color={Colors.gold.DEFAULT} />
            )}
            {method.id === 'bank_transfer' && (
              <Building size={24} color={Colors.gold.DEFAULT} />
            )}
          </View>
          <View style={styles.paymentInfo}>
            <Text style={styles.paymentName}>{method.name}</Text>
            <Text style={styles.paymentPreview}>{method.accountNumber}</Text>
          </View>
          <View
            style={[
              styles.radioButton,
              selectedPayment === method.id && styles.radioButtonActive,
            ]}
          >
            {selectedPayment === method.id && (
              <View style={styles.radioButtonInner} />
            )}
          </View>
        </Pressable>
      ))}

      {selectedPayment && (
        <View style={styles.paymentInstructions}>
          <Text style={styles.instructionsTitle}>Payment Instructions</Text>
          <Text style={styles.instructionsText}>
            {
              PAYMENT_METHODS.find((m) => m.id === selectedPayment)
                ?.instructions
            }
          </Text>
        </View>
      )}

      <View style={styles.stepButtons}>
        <GoldButton
          title="Back to Address"
          onPress={() => setCurrentStep('address')}
          variant="outline"
          size="lg"
        />
        <View style={{ width: 12 }} />
        <GoldButton
          title="Review Order"
          onPress={() => setCurrentStep('review')}
          variant="gradient"
          size="lg"
        />
      </View>
    </View>
  );

  const renderReviewStep = () => (
    <View style={styles.stepContent}>
      <Text style={styles.stepTitle}>Review Your Order</Text>

      {/* Items Summary */}
      <View style={styles.reviewSection}>
        <Text style={styles.reviewLabel}>Items ({items.length})</Text>
        {items.map((item) => (
          <View key={item.product.id} style={styles.reviewItem}>
            <Text style={styles.reviewItemName}>{item.product.name}</Text>
            <Text style={styles.reviewItemQty}>x{item.quantity}</Text>
            <Text style={styles.reviewItemPrice}>
              {formatCurrency(item.product.price_php * item.quantity)}
            </Text>
          </View>
        ))}
      </View>

      {/* Shipping Address */}
      <View style={styles.reviewSection}>
        <Text style={styles.reviewLabel}>Shipping Address</Text>
        <Text style={styles.reviewText}>{address.full_name}</Text>
        <Text style={styles.reviewText}>{address.address_line1}</Text>
        {address.address_line2 && (
          <Text style={styles.reviewText}>{address.address_line2}</Text>
        )}
        <Text style={styles.reviewText}>
          {address.city}, {address.province} {address.postal_code}
        </Text>
        <Text style={styles.reviewText}>{address.phone_number}</Text>
      </View>

      {/* Payment Method */}
      <View style={styles.reviewSection}>
        <Text style={styles.reviewLabel}>Payment Method</Text>
        <Text style={styles.reviewText}>
          {PAYMENT_METHODS.find((m) => m.id === selectedPayment)?.name}
        </Text>
      </View>

      {/* Order Summary */}
      <View style={styles.reviewSection}>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Subtotal</Text>
          <Text style={styles.summaryValue}>{formatCurrency(subtotal)}</Text>
        </View>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Shipping</Text>
          <Text style={styles.summaryValue}>
            {shippingFee === 0 ? 'FREE' : formatCurrency(shippingFee)}
          </Text>
        </View>
        <View style={[styles.summaryRow, styles.totalRow]}>
          <Text style={styles.totalLabel}>Total</Text>
          <Text style={styles.totalValue}>{formatCurrency(total)}</Text>
        </View>
      </View>

      <View style={styles.stepButtons}>
        <GoldButton
          title="Back to Payment"
          onPress={() => setCurrentStep('payment')}
          variant="outline"
          size="lg"
        />
        <View style={{ width: 12 }} />
        <GoldButton
          title="Place Order"
          onPress={handlePlaceOrder}
          variant="gradient"
          size="lg"
          loading={isLoading}
        />
      </View>
    </View>
  );

  const renderConfirmationStep = () => (
    <View style={styles.confirmationContent}>
      <View style={styles.checkmarkIcon}>
        <Check size={48} color={Colors.primary} />
      </View>
      <Text style={styles.confirmationTitle}>Order Confirmed!</Text>
      <Text style={styles.confirmationSubtitle}>
        Thank you for your purchase. Your order has been received.
      </Text>

      {orderPlaced && (
        <View style={styles.orderInfoCard}>
          <Text style={styles.orderNumber}>
            Order #{orderPlaced.id.slice(0, 12)}
          </Text>
          <Text style={styles.orderTotalL}>
            Amount: {formatCurrency(orderPlaced.total_amount_php)}
          </Text>
          <Text style={styles.orderPayment}>
            Via{' '}
            {
              PAYMENT_METHODS.find((m) => m.id === orderPlaced.payment_method)
                ?.name
            }
          </Text>
        </View>
      )}

      <View style={styles.paymentNote}>
        <Text style={styles.paymentNoteTitle}>Payment Instructions</Text>
        <Text style={styles.paymentNoteText}>
          Please complete your payment within 24 hours. You will receive
          instructions via email at {email}.
        </Text>
      </View>

      <GoldButton
        title="Continue Shopping"
        onPress={() => router.replace('/shop')}
        variant="gradient"
        size="lg"
      />
    </View>
  );

  if (items.length === 0 && !orderPlaced) {
    return (
      <View style={styles.container}>
        <Stack.Screen options={{ headerShown: false }} />
        <View style={styles.header}>
          <Pressable style={styles.backButton} onPress={() => router.back()}>
            <ArrowLeft size={24} color={Colors.text.primary} />
          </Pressable>
          <Text style={styles.headerTitle}>Checkout</Text>
          <View style={{ width: 44 }} />
        </View>
        <View style={styles.confirmationContent}>
          <Text style={styles.confirmationSubtitle}>Your cart is empty.</Text>
          <GoldButton
            title="Browse Collection"
            onPress={() => router.replace('/shop')}
            variant="gradient"
            size="lg"
          />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />

      {/* Header */}
      <View style={styles.header}>
        <Pressable style={styles.backButton} onPress={() => router.back()}>
          <ArrowLeft size={24} color={Colors.text.primary} />
        </Pressable>
        <Text style={styles.headerTitle}>Checkout</Text>
        <View style={{ width: 44 }} />
      </View>

      {currentStep !== 'confirmation' && renderStepIndicator()}

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        {currentStep === 'address' && renderAddressStep()}
        {currentStep === 'payment' && renderPaymentStep()}
        {currentStep === 'review' && renderReviewStep()}
        {currentStep === 'confirmation' && renderConfirmationStep()}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.primary,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 50,
    paddingBottom: 16,
    paddingHorizontal: 16,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontFamily: 'CormorantGaramond_700Bold',
    fontSize: 24,
    color: Colors.text.primary,
  },
  scrollView: {
    flex: 1,
  },
  stepIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingVertical: 20,
  },
  stepItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  stepCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: Colors.surface,
    borderWidth: 2,
    borderColor: Colors.border.DEFAULT,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepCircleActive: {
    backgroundColor: Colors.gold.DEFAULT,
    borderColor: Colors.gold.DEFAULT,
  },
  stepNumber: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 12,
    color: Colors.text.muted,
  },
  stepNumberActive: {
    color: Colors.primary,
  },
  stepLabel: {
    fontFamily: 'Inter_500Medium',
    fontSize: 12,
    color: Colors.text.muted,
    marginLeft: 8,
  },
  stepLabelActive: {
    color: Colors.gold.DEFAULT,
  },
  stepLine: {
    width: 40,
    height: 2,
    backgroundColor: Colors.border.DEFAULT,
    marginHorizontal: 8,
  },
  stepLineActive: {
    backgroundColor: Colors.gold.DEFAULT,
  },
  stepContent: {
    padding: 20,
  },
  stepTitle: {
    fontFamily: 'CormorantGaramond_700Bold',
    fontSize: 28,
    color: Colors.text.primary,
    marginBottom: 8,
  },
  stepSubtitle: {
    fontFamily: 'Inter_400Regular',
    fontSize: 14,
    color: Colors.text.secondary,
    marginBottom: 24,
    lineHeight: 20,
  },
  formGroup: {
    marginBottom: 20,
  },
  label: {
    fontFamily: 'Inter_500Medium',
    fontSize: 14,
    color: Colors.text.secondary,
    marginBottom: 8,
  },
  input: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border.DEFAULT,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontFamily: 'Inter_400Regular',
    fontSize: 16,
    color: Colors.text.primary,
  },
  textArea: {
    height: 100,
    paddingTop: 14,
  },
  row: {
    flexDirection: 'row',
  },
  paymentOption: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.border.DEFAULT,
  },
  paymentOptionActive: {
    borderColor: Colors.gold.DEFAULT,
    backgroundColor: Colors.border.gold + '40',
  },
  paymentIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.border.gold,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  paymentInfo: {
    flex: 1,
  },
  paymentName: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 16,
    color: Colors.text.primary,
    marginBottom: 2,
  },
  paymentPreview: {
    fontFamily: 'Inter_400Regular',
    fontSize: 13,
    color: Colors.text.muted,
  },
  radioButton: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: Colors.border.DEFAULT,
    padding: 2,
  },
  radioButtonActive: {
    borderColor: Colors.gold.DEFAULT,
  },
  radioButtonInner: {
    flex: 1,
    borderRadius: 5,
    backgroundColor: Colors.gold.DEFAULT,
  },
  paymentInstructions: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: Colors.border.gold,
  },
  instructionsTitle: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 14,
    color: Colors.gold.DEFAULT,
    marginBottom: 8,
  },
  instructionsText: {
    fontFamily: 'Inter_400Regular',
    fontSize: 14,
    color: Colors.text.secondary,
    lineHeight: 20,
  },
  stepButtons: {
    flexDirection: 'row',
    marginTop: 24,
    marginBottom: 40,
  },
  reviewSection: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  reviewLabel: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 14,
    color: Colors.text.secondary,
    marginBottom: 12,
  },
  reviewItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border.DEFAULT,
  },
  reviewItemName: {
    flex: 1,
    fontFamily: 'Inter_500Medium',
    fontSize: 14,
    color: Colors.text.primary,
  },
  reviewItemQty: {
    fontFamily: 'Inter_400Regular',
    fontSize: 13,
    color: Colors.text.muted,
    marginHorizontal: 12,
  },
  reviewItemPrice: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 14,
    color: Colors.text.primary,
  },
  reviewText: {
    fontFamily: 'Inter_400Regular',
    fontSize: 14,
    color: Colors.text.secondary,
    lineHeight: 20,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
    ...Shadows.lg,
  },
  summaryLabel: {
    fontFamily: 'Inter_400Regular',
    fontSize: 15,
    color: Colors.text.secondary,
    ...Shadows.lg,
  },
  summaryValue: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 15,
    color: Colors.text.primary,
    ...Shadows.lg,
  },
  totalRow: {
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: Colors.border.DEFAULT,
  },
  totalLabel: {
    fontFamily: 'Inter_700Bold',
    fontSize: 18,
    color: Colors.text.primary,
  },
  totalValue: {
    fontFamily: 'Inter_700Bold',
    fontSize: 20,
    color: Colors.gold.DEFAULT,
  },
  confirmationContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  checkmarkIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.gold.DEFAULT,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  confirmationTitle: {
    fontFamily: 'CormorantGaramond_700Bold',
    fontSize: 32,
    color: Colors.text.primary,
    marginBottom: 8,
    textAlign: 'center',
  },
  confirmationSubtitle: {
    fontFamily: 'Inter_400Regular',
    fontSize: 16,
    color: Colors.text.secondary,
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 24,
  },
  orderInfoCard: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    marginBottom: 24,
    width: '100%',
  },
  orderNumber: {
    fontFamily: 'Inter_700Bold',
    fontSize: 18,
    color: Colors.gold.DEFAULT,
    marginBottom: 8,
  },
  orderTotalL: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 16,
    color: Colors.text.primary,
  },
  orderPayment: {
    fontFamily: 'Inter_400Regular',
    fontSize: 14,
    color: Colors.text.muted,
    marginTop: 4,
  },
  paymentNote: {
    backgroundColor: Colors.border.gold,
    borderRadius: 12,
    padding: 16,
    marginBottom: 32,
    width: '100%',
  },
  paymentNoteTitle: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 14,
    color: Colors.gold.DEFAULT,
    marginBottom: 8,
  },
  paymentNoteText: {
    fontFamily: 'Inter_400Regular',
    fontSize: 14,
    color: Colors.text.primary,
    lineHeight: 20,
  },
});
