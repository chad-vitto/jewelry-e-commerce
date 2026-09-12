import * as Clipboard from 'expo-clipboard';
import { useEffect, useState } from 'react';
import { formatCurrency, PAYMENT_METHODS, Shadows } from '@/constants';
import { GoldButton } from '@/components/GoldGradient';
import { Order, PaymentMethodType } from '@/types';
import { ShippingAddressCard } from '@/components/orders/ShippingAddressCard';
import { Stack, useRouter } from 'expo-router';
import { supabase } from '@/lib/supabase';
import { useAuth, useCart, useAddresses } from '@/hooks';
import { useTheme } from '@/hooks/useTheme';
import type { AppColors } from '@/constants/themes';
import { View, Text, StyleSheet, ScrollView, Pressable, Alert } from 'react-native';
import { ArrowLeft, Building, Check, CreditCard, Pencil, Smartphone, User, MapPin, Phone, CheckCircle2, Copy, ShieldCheck, Clock3 } from 'lucide-react-native';
import { toShippingAddressDisplay } from '@/utils/address';
import { CheckoutOrderCard } from '@/components/orders/CheckoutOrderCard';
import { CheckoutSummaryCard } from '@/components/orders/CheckoutSummaryCard';
import { AddressForm } from '@/components/address/AddressForm';

type CheckoutStep = 'address' | 'payment' | 'review' | 'confirmation';

export default function CheckoutScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const styles = createStyles(colors);
  const { user, isAuthenticated } = useAuth();
  const { address, setAddress, shippingAddressId, isLoading: isAddressLoading, loadDefaultAddress, saveAddress, currentAddress, } = useAddresses(user?.id)
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);

  const { items, subtotal, shippingFee, total, clearCart } = useCart();

  const [currentStep, setCurrentStep] = useState<CheckoutStep>('address');
  const [orderPlaced, setOrderPlaced] = useState<Order | null>(null);
  const [orderedItemCount, setOrderedItemCount] = useState(0);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/auth/sign-in');
    }
  }, [isAuthenticated, router]);


  const [selectedPayment, setSelectedPayment] = useState<PaymentMethodType>('gcash');
  const [email, setEmail] = useState(user?.email || '');
  const [notes, setNotes] = useState('');
  const [isEditingAddress, setIsEditingAddress] = useState(false);


  const shippingAddressDisplay = toShippingAddressDisplay(address);

  const canProceedToPayment =
    address.full_name &&
    address.phone_number &&
    address.address_line1 &&
    address.city &&
    address.province &&
    address.postal_code;

  useEffect(() => {
    void loadDefaultAddress();
  }, [loadDefaultAddress]);

  const hasSavedAddress = !!shippingAddressId;
  const showAddressForm = !hasSavedAddress || isEditingAddress;
  const isEditingSavedAddress = Boolean(shippingAddressId && isEditingAddress);



  const handleSaveAddress = async () => {
    try {

      await saveAddress({
        address,
        label: currentAddress?.label ?? 'Home',
        is_default: currentAddress?.is_default ?? true,
      });

      setIsEditingAddress(false);

      Alert.alert('Success', 'Shipping address updated successfully.');
    } catch (error) {
      console.error(error);

      Alert.alert('Error', 'Unable to update your shipping address.');
    } finally {
    }
  };

  const confirmPlaceOrder = () => {
    Alert.alert(
      'Place Secure Order?',
      'Your order will be submitted and you will receive payment instructions after checkout.',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Place Order',
          onPress: handlePlaceOrder,
        },
      ],
    );
  };

  const handlePlaceOrder = async () => {
    if (!canProceedToPayment) {
      Alert.alert('Error', 'Please fill in all required fields.');
      return;
    }
    if (!user) {
      Alert.alert('Error', 'Please log in first.');
      return;
    }
    setIsPlacingOrder(true);
    try {
      const shippingAddress = await saveAddress({
        address,
        label: currentAddress?.label ?? 'Home',
        is_default: currentAddress?.is_default ?? true,
      });

      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert({
          customer_id: user.id,
          shipping_address_id: shippingAddress?.id,

          subtotal_php: subtotal,
          shipping_fee_php: shippingFee,
          total_amount_php: total,

          payment_method: selectedPayment,
          payment_status: 'pending',
          payment_reference: null,
          order_status: 'pending',

          notes: notes || null,
        })
        .select()
        .single();

      if (orderError) {
        console.error('Order Error:', orderError);
        Alert.alert('Error', orderError.message);
        return;
      }

      if (!shippingAddress) {
        Alert.alert('Error', 'Unable to save shipping address.');
        return;
      }

      const orderItems = items.map((item) => ({
        order_id: order.id,
        product_id: item.product.id,
        product_name: item.product.name,
        price_php: item.product.price_php,
        quantity: item.quantity,
        subtotal_php: item.product.price_php * item.quantity,
      }));

      const { error: orderItemsError } = await supabase
        .from('order_items')
        .insert(orderItems);

      if (orderItemsError) {
        console.error('Order Items Error:', orderItemsError);
        Alert.alert('Order Items Error', orderItemsError.message);
        return;
      }

      setOrderPlaced(order as Order);

      const totalItems = items.reduce(
        (sum, item) => sum + item.quantity, 0);

      setOrderedItemCount(totalItems);

      clearCart();

      setCurrentStep('confirmation');
    } catch (error) {
      console.error('Place Order Error:', error);
      Alert.alert('Error', 'Unable to place order. Please try again.');
    } finally {
      setIsPlacingOrder(false);
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
                <Check size={14} color={colors.primary} />
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

  {/* Shipping Address Next to Proceed to Checkout */ }
  const renderAddressStep = () => (
    <View style={styles.stepContent}>
      <Text style={styles.stepTitle}>Shipping Address</Text>

      {!showAddressForm ? (
        <View style={styles.savedAddressCard}>
          <View style={styles.savedAddressHeader}>
            <View style={styles.nameRow}>
              <User size={22} color={colors.gold.DEFAULT} />
              <Text style={styles.savedName}>{address.full_name}</Text>
            </View>

            <Pressable
              onPress={() => setIsEditingAddress(true)}
              style={styles.changeChip}
            >
              <Text style={styles.changeText}>Change</Text>
              <Pencil size={16} color={colors.gold.DEFAULT} />
            </Pressable>
          </View>

          <View style={styles.divider} />

          <View style={[styles.infoRow, styles.lastInfoRow]}>
            <MapPin
              size={18}
              color={colors.gold.DEFAULT}
              style={styles.infoIcon}
            />

            <View style={{ flex: 1 }}>
              <Text style={styles.savedText}>{address.address_line1}</Text>

              {!!address.address_line2 && (
                <Text style={styles.savedText}>{address.address_line2}</Text>
              )}

              <Text style={styles.savedText}>
                {address.city}, {address.province} {address.postal_code}
              </Text>
            </View>
          </View>
          <View style={[styles.infoRow, styles.lastInfoRow]}>
            <Phone
              size={18}
              color={colors.gold.DEFAULT}
              style={styles.infoIcon}
            />

            <Text style={styles.savedText}>{address.phone_number}</Text>
          </View>
          <View style={styles.divider} />

          <View style={styles.defaultAddressRow}>
            <CheckCircle2 size={16} color={colors.gold.DEFAULT} />
            <Text style={styles.defaultAddressText}>
              Default Shipping Address
            </Text>
          </View>
        </View>
      ) : (
        <AddressForm
          value={address}
          onChange={setAddress}
          errors={{}}
        />
      )}

      {isEditingSavedAddress ? (
        <View style={styles.actionButtons}>
          <View style={styles.actionButton}>
            <GoldButton
              title="Cancel"
              variant="outline"
              size="lg"
              onPress={() => setIsEditingAddress(false)}
            />
          </View>

          <View style={styles.actionButton}>
            <GoldButton
              title="Save Changes"
              variant="gradient"
              size="lg"
              loading={isAddressLoading}
              onPress={handleSaveAddress}
            />
          </View>
        </View>
      ) : (
        <View style={styles.continueButtonContainer}>
          <GoldButton
            title="Continue to Payment"
            variant="gradient"
            size="lg"
            disabled={!canProceedToPayment}
            onPress={() => setCurrentStep('payment')}
          />
        </View>
      )}
    </View>
  );

  const handleCopyAccountNumber = async () => {
    const accountNumber = PAYMENT_METHODS.find(
      (m) => m.id === selectedPayment,
    )?.accountNumber;

    if (!accountNumber) return;

    await Clipboard.setStringAsync(accountNumber);

    Alert.alert('Copied!', 'Account number copied to clipboard.');
  };

  const renderPaymentStep = () => (
    <View style={styles.stepContent}>
      <Text style={styles.stepTitle}>Payment Method</Text>
      <Text style={styles.stepSubtitle}>
        Choose your preferred payment method. After placing your order,
        you&apos;ll receive the details needed to complete your payment.
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
              <Smartphone size={24} color={colors.gold.DEFAULT} />
            )}
            {method.id === 'maya' && (
              <CreditCard size={24} color={colors.gold.DEFAULT} />
            )}
            {method.id === 'bank_transfer' && (
              <Building size={24} color={colors.gold.DEFAULT} />
            )}
          </View>
          <View style={styles.paymentInfo}>
            <Text style={styles.paymentName}>{method.name}</Text>

            <Text style={styles.paymentLabel}>Account Number</Text>

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
          <Pressable style={styles.copyRow} onPress={handleCopyAccountNumber}>
            <Copy size={16} color={colors.gold.DEFAULT} />
            <Text style={styles.copyText}>Copy Account Number</Text>
          </Pressable>
        </View>
      )}

      <View style={styles.actionButtons}>
        <View style={styles.actionButton}>
          <GoldButton
            title="Back to Address"
            onPress={() => setCurrentStep('address')}
            variant="outline"
            size="lg"
          />
        </View>
        <View style={styles.actionButton}>
          <GoldButton
            title="Review Order"
            onPress={() => setCurrentStep('review')}
            variant="gradient"
            size="lg"
          />
        </View>
      </View>
    </View>
  );

  const renderReviewStep = () => (
    <View style={styles.stepContent}>
      <Text style={styles.stepTitle}>Review Your Order</Text>

      {/* Items Summary */}
      <CheckoutOrderCard
        items={items}
        onEditCart={() => router.push('/cart')}
      />

      {/* Shipping Address Inside Review Your Order */}
      <ShippingAddressCard
        address={shippingAddressDisplay}
        rightContent={
          <Pressable
            onPress={() => {
              setIsEditingAddress(true);
              setCurrentStep('address');
            }}
            style={styles.changeButton}
          >
            <Text style={styles.changeText}>
              Change
            </Text>

            <Pencil
              size={15}
              color={colors.gold.DEFAULT}
            />
          </Pressable>
        }
        footer={
          <View style={styles.defaultAddressRow}>
            <CheckCircle2
              size={16}
              color={colors.gold.DEFAULT}
            />

            <Text style={styles.defaultAddressText}>
              Default Shipping Address
            </Text>
          </View>
        }
        style={{ backgroundColor: colors.surface }}
      />

      {/* Payment Method */}
      <View style={styles.reviewSection}>
        <View style={styles.reviewHeader}>
          <Text style={styles.reviewLabel}>Payment Method</Text>

          <Pressable
            style={styles.changeButton}
            onPress={() => setCurrentStep('payment')}
          >
            <Text style={styles.changeText}>Change</Text>
            <Pencil size={16} color={colors.gold.DEFAULT} />
          </Pressable>
        </View>
        <Text style={styles.reviewText}>
          {PAYMENT_METHODS.find((m) => m.id === selectedPayment)?.name}
        </Text>
        <Text style={styles.accountLabel}>Account Number</Text>
        <View style={styles.accountRow}>
          <Text style={styles.accountNumber}>
            {
              PAYMENT_METHODS.find((m) => m.id === selectedPayment)
                ?.accountNumber
            }
          </Text>

          <Pressable onPress={handleCopyAccountNumber}>
            <Copy size={16} color={colors.gold.DEFAULT} />
          </Pressable>
        </View>
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
      <View style={styles.secureNote}>
        <ShieldCheck size={16} color={colors.gold.DEFAULT} />
        <Text style={styles.secureText}>
          Your order details will be securely processed.
        </Text>
      </View>
      <View style={styles.actionButtons}>
        <View style={styles.actionButton}>
          <GoldButton
            title="Back to Payment"
            onPress={() => setCurrentStep('payment')}
            variant="outline"
            size="lg"
          />
        </View>
        <View style={styles.actionButton}>
          <GoldButton
            title="Place Order"
            onPress={confirmPlaceOrder}
            variant="gradient"
            size="lg"
            loading={isPlacingOrder}
          />
        </View>
      </View>
    </View>
  );

  const renderConfirmationStep = () => (
    <View style={styles.confirmationContent}>
      <View style={styles.checkmarkIcon}>
        <Check size={48} color={colors.primary} />
      </View>
      <Text style={styles.confirmationTitle}>Order Confirmed!</Text>
      <Text style={styles.confirmationSubtitle}>
        Thank you for choosing our collection. Your order has been received and
        is being prepared.
      </Text>

      {orderPlaced && (
        <CheckoutSummaryCard
          orderNumber={orderPlaced.id.slice(0, 12).toUpperCase()}
          total={orderPlaced.total_amount_php}
          paymentMethod={
            PAYMENT_METHODS.find(
              (m) => m.id === orderPlaced.payment_method,
            )?.name ?? ''
          }
          itemCount={orderedItemCount}
        />
      )}
      <View style={styles.paymentNote}>
        <View style={styles.paymentNoteTitleRow}>
          <Clock3
            size={16}
            color={colors.gold.DEFAULT}
            style={{ marginTop: 1 }}
          />
          <Text style={styles.paymentNoteTitle}>Next Steps</Text>
        </View>

        <Text style={styles.paymentNoteText}>
          Please complete your payment within 24 hours using your selected
          payment method. Once payment is verified, we will begin preparing your
          order.
        </Text>

        <View style={styles.paymentMethodRow}>
          <Text style={styles.paymentMethodLabel}>Payment:</Text>

          <Text style={styles.paymentMethodValue}>
            {
              PAYMENT_METHODS.find((m) => m.id === orderPlaced?.payment_method)
                ?.name
            }
          </Text>
        </View>
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
            <ArrowLeft size={24} color={colors.text.primary} />
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
          <ArrowLeft size={24} color={colors.text.primary} />
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

const createStyles = (colors: AppColors) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.primary,
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
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontFamily: 'CormorantGaramond_700Bold',
    fontSize: 24,
    color: colors.text.primary,
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
    backgroundColor: colors.surface,
    borderWidth: 2,
    borderColor: colors.border.DEFAULT,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepCircleActive: {
    backgroundColor: colors.gold.DEFAULT,
    borderColor: colors.gold.DEFAULT,
  },
  stepNumber: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 12,
    color: colors.text.muted,
  },
  stepNumberActive: {
    color: colors.primary,
  },
  stepLabel: {
    fontFamily: 'Inter_500Medium',
    fontSize: 12,
    color: colors.text.muted,
    marginLeft: 8,
  },
  stepLabelActive: {
    color: colors.gold.DEFAULT,
  },
  stepLine: {
    width: 40,
    height: 2,
    backgroundColor: colors.border.DEFAULT,
    marginHorizontal: 8,
  },
  stepLineActive: {
    backgroundColor: colors.gold.DEFAULT,
  },
  savedAddressCard: {
    padding: 18,
    borderRadius: 16,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border.DEFAULT,
  },

  savedName: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.text.primary,
  },
  savedAddressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  changeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.gold.light + '20',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    gap: 5,
  },
  changeChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: colors.gold.light, // or a very light gold tint
    gap: 6,
  },
  changeText: {
    color: colors.gold.DEFAULT,
    fontWeight: '600',
    fontSize: 15,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border.gold,
    opacity: 0.5,
    marginTop: 2,
    marginBottom: 8,
  },
  defaultAddressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
  },
  defaultAddressText: {
    marginLeft: 8,
    fontSize: 14,
    fontWeight: '600',
    color: colors.text.secondary,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginTop: 8,
  },
  infoIcon: {
    marginTop: 2,
    marginRight: 12,
  },
  lastInfoRow: {
    marginBottom: 8,
  },
  savedText: {
    flex: 1,
    fontSize: 15,
    lineHeight: 22,
    color: colors.text.secondary,
  },
  stepContent: {
    padding: 20,
  },
  stepTitle: {
    fontFamily: 'CormorantGaramond_700Bold',
    fontSize: 28,
    color: colors.text.primary,
    marginBottom: 8,
  },
  stepSubtitle: {
    fontFamily: 'Inter_400Regular',
    fontSize: 14,
    color: colors.text.secondary,
    marginBottom: 16,
    lineHeight: 20,
  },
  formGroup: {
    marginBottom: 20,
  },
  label: {
    fontFamily: 'Inter_500Medium',
    fontSize: 14,
    color: colors.text.secondary,
    marginBottom: 8,
  },
  input: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border.DEFAULT,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontFamily: 'Inter_400Regular',
    fontSize: 16,
    color: colors.text.primary,
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
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: colors.border.DEFAULT,
  },
  paymentOptionActive: {
    borderColor: colors.gold.DEFAULT,
    backgroundColor: colors.gold.light + '20',
  },
  paymentIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.border.gold,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  paymentInfo: {
    flex: 1,
  },
  paymentName: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 18,
    color: colors.text.primary,
    marginBottom: 0,
  },
  paymentPreview: {
    fontFamily: 'Inter_400Regular',
    fontSize: 16,
    color: colors.text.muted,
  },
  paymentLabel: {
    marginTop: 6,
    fontSize: 11,
    fontFamily: 'Inter_500Medium',
    color: colors.text.muted,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  radioButton: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: colors.border.DEFAULT,
    padding: 2,
  },
  radioButtonActive: {
    borderColor: colors.gold.DEFAULT,
  },
  radioButtonInner: {
    flex: 1,
    borderRadius: 5,
    backgroundColor: colors.gold.DEFAULT,
  },
  paymentInstructions: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.border.gold,
  },
  instructionsTitle: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 14,
    color: colors.gold.DEFAULT,
    marginBottom: 8,
  },
  instructionsText: {
    fontFamily: 'Inter_400Regular',
    fontSize: 14,
    color: colors.text.secondary,
    lineHeight: 20,
  },
  copyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 24,
    gap: 8,
  },

  copyText: {
    color: colors.gold.DEFAULT,
    fontFamily: 'Inter_600SemiBold',
    fontSize: 16,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 24,
  },
  actionButton: {
    flex: 1,
  },
  continueButtonContainer: {
    marginTop: 24,
  },
  reviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  reviewSection: {
    backgroundColor: colors.surfaceLight,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  reviewLabel: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 14,
    color: colors.text.primary,
    marginBottom: 12,
  },
  reviewText: {
    fontFamily: 'Inter_400Regular',
    fontSize: 14,
    color: colors.text.secondary,
    lineHeight: 20,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  summaryLabel: {
    fontFamily: 'Inter_400Regular',
    fontSize: 15,
    color: colors.text.secondary,
    ...Shadows.lg,
  },
  summaryValue: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 15,
    color: colors.text.primary,
    ...Shadows.lg,
  },
  totalRow: {
    borderTopWidth: 2,
    borderTopColor: colors.gold.muted,
    marginTop: 16,
    paddingTop: 16,
  },
  totalLabel: {
    fontSize: 22,
    fontFamily: 'PlayfairDisplay_700Bold',
    color: colors.text.primary,
  },
  totalValue: {
    fontSize: 24,
    fontFamily: 'Inter_700Bold',
    color: colors.gold.DEFAULT,
  },
  secureNote: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 8,
    marginBottom: 16,
  },

  secureText: {
    fontSize: 12,
    color: colors.text.muted,
  },
  confirmationContent: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 32,
    paddingBottom: 40,
  },
  checkmarkIcon: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: colors.gold.DEFAULT,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  confirmationTitle: {
    fontFamily: 'CormorantGaramond_700Bold',
    fontSize: 36,
    color: colors.text.primary,
    marginBottom: 8,
    textAlign: 'center',
  },
  confirmationSubtitle: {
    fontFamily: 'Inter_400Regular',
    fontSize: 16,
    color: colors.text.secondary,
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 24,
  },
  paymentMethodRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderTopColor: colors.border.gold,
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: 1,
    gap: 2,
  },

  paymentMethodLabel: {
    fontSize: 14,
    color: colors.gold.DEFAULT,
    fontFamily: 'Inter_400Regular',
  },

  paymentMethodValue: {
    fontSize: 14,
    color: colors.text.primary,
    fontFamily: 'Inter_600SemiBold',
  },
  paymentNoteTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 10,
  },
  paymentNote: {
    backgroundColor: colors.border.gold,
    borderRadius: 12,
    padding: 16,
    marginBottom: 32,
    width: '100%',
  },
  paymentNoteTitle: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 14,
    color: colors.gold.DEFAULT,
  },
  paymentNoteText: {
    fontFamily: 'Inter_400Regular',
    fontSize: 14,
    color: colors.text.primary,
    lineHeight: 22,
  },
  accountLabel: {
    marginTop: 8,
    fontSize: 12,
    fontFamily: 'Inter_500Medium',
    color: colors.text.muted,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  accountRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    gap: 15,
  },
  accountNumber: {
    fontSize: 15,
    fontFamily: 'Inter_600SemiBold',
    color: colors.gold.DEFAULT,
  },
});
