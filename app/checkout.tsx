import * as Clipboard from 'expo-clipboard';
import React, { useEffect, useState } from 'react';
import {
  Colors,
  formatCurrency,
  PAYMENT_METHODS,
  Shadows
} from '@/constants';
import { GoldButton } from '@/components/GoldGradient';
import { Image } from 'expo-image';
import { Order, PaymentMethodType, ShippingAddressForm } from '@/types';
import { Stack, useRouter } from 'expo-router';
import { supabase } from '@/lib/supabase';
import { useAuth, useCart } from '@/hooks';


import {
  ArrowLeft,
  Building,
  Check,
  CreditCard,
  Pencil,
  Smartphone,
  User,
  MapPin,
  Phone,
  CheckCircle2,
  Copy,
  ShoppingCart,
  ShieldCheck,
  Clock3,
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

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/auth/sign-in');
    }
  }, [isAuthenticated, router]);

  // Form state
  const [address, setAddress] = useState<ShippingAddressForm>({
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
  const [loadingAddress, setLoadingAddress] = useState(true);
  const [isEditingAddress, setIsEditingAddress] = useState(false);
  const [shippingAddressId, setShippingAddressId] = useState<string | null>(
    null,
  );

  const canProceedToPayment =
    address.full_name &&
    address.phone_number &&
    address.address_line1 &&
    address.city &&
    address.province &&
    address.postal_code;

  useEffect(() => {
    if (!user) return;

    const fetchDefaultAddress = async () => {
      setLoadingAddress(true);

      const { data, error } = await supabase
        .from('shipping_addresses')
        .select('*')
        .eq('customer_id', user.id)
        .eq('is_default', true)
        .order('updated_at', { ascending: false })
        .limit(1)
        .single();

      if (error) {
        if (error.code !== 'PGRST116') {
          console.error('Load Address Error:', error);
        }

        setLoadingAddress(false);
        return;
      }

      setShippingAddressId(data.id);

      setAddress({
        full_name: data.full_name,
        phone_number: data.phone_number,
        address_line1: data.address_line1,
        address_line2: data.address_line2 ?? '',
        city: data.city,
        province: data.province,
        postal_code: data.postal_code,
      });

      setLoadingAddress(false);
    };

    fetchDefaultAddress();
  }, [user]);

  const hasSavedAddress = !!shippingAddressId;
  const showAddressForm = !hasSavedAddress || isEditingAddress;
  const isEditingSavedAddress = Boolean(shippingAddressId && isEditingAddress);

  const saveShippingAddress = async () => {
    if (!user) {
      throw new Error('User not found.');
    }

    if (shippingAddressId) {
      const { data, error } = await supabase
        .from('shipping_addresses')
        .update({
          full_name: address.full_name,
          phone_number: address.phone_number,
          address_line1: address.address_line1,
          address_line2: address.address_line2 || null,
          city: address.city,
          province: address.province,
          postal_code: address.postal_code,
        })
        .eq('id', shippingAddressId)
        .eq('customer_id', user.id)
        .select()
        .single();

      if (error) throw error;

      return data;
    }

    const { data, error } = await supabase
      .from('shipping_addresses')
      .insert({
        customer_id: user.id,
        label: 'Home',
        full_name: address.full_name,
        phone_number: address.phone_number,
        address_line1: address.address_line1,
        address_line2: address.address_line2 || null,
        city: address.city,
        province: address.province,
        postal_code: address.postal_code,
        is_default: true,
      })
      .select()
      .single();

    if (error) throw error;

    setShippingAddressId(data.id);

    return data;
  };

  const handleSaveAddress = async () => {
    try {
      setIsLoading(true);

      await saveShippingAddress();

      setIsEditingAddress(false);

      Alert.alert('Success', 'Shipping address updated successfully.');
    } catch (error) {
      console.error(error);

      Alert.alert('Error', 'Unable to update your shipping address.');
    } finally {
      setIsLoading(false);
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
    setIsLoading(true);
    try {
      const shippingAddress = await saveShippingAddress();

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

      clearCart();

      setCurrentStep('confirmation');
    } catch (error) {
      console.error('Place Order Error:', error);
      Alert.alert('Error', 'Unable to place order. Please try again.');
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

      {!showAddressForm ? (
        <View style={styles.savedAddressCard}>
          <View style={styles.savedAddressHeader}>
            <View style={styles.nameRow}>
              <User size={18} color={Colors.gold.DEFAULT} />
              <Text style={styles.savedName}>{address.full_name}</Text>
            </View>

            <Pressable
              onPress={() => setIsEditingAddress(true)}
              style={styles.changeChip}
            >
              <Text style={styles.changeText}>Change</Text>
              <Pencil size={16} color={Colors.gold.DEFAULT} />
            </Pressable>
          </View>

          <View style={styles.divider} />

          <View style={[styles.infoRow, styles.lastInfoRow]}>
            <MapPin
              size={18}
              color={Colors.gold.DEFAULT}
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
              color={Colors.gold.DEFAULT}
              style={styles.infoIcon}
            />

            <Text style={styles.savedText}>{address.phone_number}</Text>
          </View>
          <View style={styles.divider} />

          <View style={styles.defaultAddressRow}>
            <CheckCircle2 size={16} color={Colors.gold.DEFAULT} />
            <Text style={styles.defaultAddressText}>
              Default Shipping Address
            </Text>
          </View>
        </View>
      ) : (
        <>
          <View style={styles.formGroup}>
            <Text style={styles.label}>Full Name *</Text>
            <TextInput
              style={styles.input}
              value={address.full_name}
              onChangeText={(text) =>
                setAddress({ ...address, full_name: text })
              }
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
                onChangeText={(text) =>
                  setAddress({ ...address, province: text })
                }
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
              onChangeText={(text) =>
                setAddress({ ...address, postal_code: text })
              }
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
        </>
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
              loading={isLoading}
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
              <Smartphone size={24} color={Colors.gold.DEFAULT} />
            )}
            {method.id === 'maya' && (
              <CreditCard size={24} color={Colors.gold.DEFAULT} />
            )}
            {method.id === 'bank_transfer' && (
              <Building size={24} color={Colors.gold.DEFAULT} />
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
            <Copy size={16} color={Colors.gold.DEFAULT} />
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
      <View style={styles.reviewSection}>
        <View style={styles.reviewHeader}>
          <Text style={styles.reviewLabel}>Items ({items.length})</Text>

          <Pressable
            style={styles.changeButton}
            onPress={() => router.push('/cart')}
          >
            <Text style={styles.changeText}>Edit Cart</Text>
            <ShoppingCart size={16} color={Colors.gold.DEFAULT} />
          </Pressable>
        </View>
        {items.map((item, index) => {
          const imageUri =
            item.product.product_images?.[0]?.image_url ||
            'https://images.pexels.com/photos/269228/pexels-photo-269228.jpeg?auto=compress&cs=tinysrgb&w=200';

          return (
            <React.Fragment key={item.product.id}>
              <View style={styles.reviewItem}>
                <View style={styles.imageWrapper}>
                  <Image
                    source={{ uri: imageUri }}
                    style={styles.reviewItemImage}
                    contentFit="cover"
                  />
                </View>

                <View style={styles.reviewItemInfo}>
                  <Text style={styles.reviewItemName} numberOfLines={2}>
                    {item.product.name}
                  </Text>
                  <Text style={styles.reviewItemDetails}>
                    {item.product.gold_purity && `${item.product.gold_purity}`}
                    {item.product.gold_purity && item.product.weight_grams
                      ? ' • '
                      : ''}
                    {item.product.weight_grams &&
                      `${item.product.weight_grams}g`}
                  </Text>
                  {item.quantity > 1 && (
                    <View style={styles.reviewItemMeta}>
                      <Text style={styles.reviewItemQty}>
                        Qty × {item.quantity}
                      </Text>

                      <Text style={styles.reviewItemUnitPrice}>
                        {formatCurrency(item.product.price_php)} each
                      </Text>
                    </View>
                  )}
                </View>

                <Text style={styles.reviewItemPrice}>
                  {formatCurrency(item.product.price_php * item.quantity)}
                </Text>
              </View>

              {index < items.length - 1 && (
                <View style={styles.reviewDivider} />
              )}
            </React.Fragment>
          );
        })}
      </View>

      {/* Shipping Address */}
      <View style={styles.reviewSection}>
        <View style={styles.reviewHeader}>
          <Text style={styles.reviewLabel}>Shipping Address</Text>

          <Pressable
            style={styles.changeButton}
            onPress={() => setCurrentStep('address')}
          >
            <Text style={styles.changeText}>Change</Text>
            <Pencil size={16} color={Colors.gold.DEFAULT} />
          </Pressable>
        </View>
        <Text style={styles.reviewName}>{address.full_name}</Text>
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
        <View style={styles.reviewHeader}>
          <Text style={styles.reviewLabel}>Payment Method</Text>

          <Pressable
            style={styles.changeButton}
            onPress={() => setCurrentStep('payment')}
          >
            <Text style={styles.changeText}>Change</Text>
            <Pencil size={16} color={Colors.gold.DEFAULT} />
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
            <Copy size={16} color={Colors.gold.DEFAULT} />
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
        <ShieldCheck size={16} color={Colors.gold.DEFAULT} />
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
            loading={isLoading}
          />
        </View>
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
        Thank you for choosing our collection. Your order has been received and
        is being prepared.
      </Text>

      {orderPlaced && (
        <View style={styles.orderInfoCard}>
          <Text style={styles.orderCardTitle}>ORDER SUMMARY</Text>

          <Text style={styles.orderNumber}>#{orderPlaced.id.slice(0, 12)}</Text>

          <View style={styles.orderDivider} />

          <Text style={styles.orderTotalLabel}>Total Amount</Text>

          <Text style={styles.orderAmount}>
            {formatCurrency(orderPlaced.total_amount_php)}
          </Text>

          <Text style={styles.orderPayment}>
            Payment Method:{' '}
            {
              PAYMENT_METHODS.find((m) => m.id === orderPlaced.payment_method)
                ?.name
            }
          </Text>
        </View>
      )}
      <View style={styles.paymentNote}>
        <View style={styles.paymentNoteTitleRow}>
          <Clock3
            size={16}
            color={Colors.gold.DEFAULT}
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
  savedAddressCard: {
    padding: 18,
    borderRadius: 16,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border.DEFAULT,
  },

  savedName: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.text.primary,
    marginBottom: 10,
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
    backgroundColor: Colors.gold.light + '20',
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
    backgroundColor: Colors.gold.light, // or a very light gold tint
    gap: 6,
  },
  changeText: {
    color: Colors.gold.DEFAULT,
    fontWeight: '600',
    fontSize: 15,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.border.gold,
    marginTop: 5,
    marginBottom: 12,
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
    color: Colors.text.secondary,
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
  imageWrapper: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  lastInfoRow: {
    marginBottom: 8,
  },
  savedText: {
    flex: 1,
    fontSize: 15,
    lineHeight: 22,
    color: Colors.text.secondary,
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
    marginBottom: 16,
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
    padding: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: Colors.border.DEFAULT,
  },
  paymentOptionActive: {
    borderColor: Colors.gold.DEFAULT,
    backgroundColor: Colors.gold.light + '20',
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
    fontSize: 18,
    color: Colors.text.primary,
    marginBottom: 0,
  },
  paymentPreview: {
    fontFamily: 'Inter_400Regular',
    fontSize: 16,
    color: Colors.text.muted,
  },
  paymentLabel: {
    marginTop: 6,
    fontSize: 11,
    fontFamily: 'Inter_500Medium',
    color: Colors.text.muted,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
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
    padding: 12,
    marginBottom: 16,
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
  copyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 24,
    gap: 8,
  },

  copyText: {
    color: Colors.gold.DEFAULT,
    fontFamily: 'Inter_600SemiBold',
    fontSize: 16,
  },
  copyButtonContainer: {
    marginTop: 20,
  },
  stepButtons: {
    flexDirection: 'row',
    marginTop: 24,
    marginBottom: 40,
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
  itemImage: {
    width: 100,
    height: 100,
    borderRadius: 12,
  },
  reviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
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
  reviewName: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 15,
    color: Colors.text.primary,
    marginBottom: 6,
  },
  reviewText: {
    fontFamily: 'Inter_400Regular',
    fontSize: 14,
    color: Colors.text.secondary,
    lineHeight: 20,
  },
  reviewItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  reviewItemImage: {
    width: 64,
    height: 64,
    borderRadius: 12,
    marginRight: 16,
  },
  reviewItemInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  reviewItemName: {
    fontSize: 16,
    fontFamily: 'Inter_600SemiBold',
    color: Colors.text.primary,
  },
  reviewItemDetails: {
    fontFamily: 'Inter_400Regular',
    fontSize: 13,
    color: Colors.text.muted,
    marginTop: 4,
  },
  reviewItemPrice: {
    marginTop: 8,
    marginLeft: 16,
    fontSize: 16,
    alignSelf: 'center',
    fontFamily: 'Inter_700Bold',
    color: Colors.gold.DEFAULT,
  },
  reviewItemMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
    gap: 10,
  },
  reviewItemQty: {
    fontSize: 13,
    color: Colors.text.secondary,
  },

  reviewItemUnitPrice: {
    fontSize: 12,
    color: Colors.text.muted,
  },
  reviewDivider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: Colors.gold.DEFAULT,
    marginVertical: 8,
    marginLeft: 76,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
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
    borderTopWidth: 1,
    borderTopColor: Colors.gold.muted,
    marginTop: 16,
    paddingTop: 16,
  },
  totalLabel: {
    fontSize: 18,
    fontFamily: 'PlayfairDisplay_700Bold',
    color: Colors.text.primary,
  },
  totalValue: {
    fontSize: 26,
    fontFamily: 'Inter_700Bold',
    color: Colors.gold.DEFAULT,
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
    color: Colors.text.muted,
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
    backgroundColor: Colors.gold.DEFAULT,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  confirmationTitle: {
    fontFamily: 'CormorantGaramond_700Bold',
    fontSize: 36,
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
  orderCardTitle: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 12,
    letterSpacing: 1.2,
    color: Colors.gold.DEFAULT,
    marginBottom: 12,
  },
  orderNumber: {
    fontFamily: 'Inter_700Bold',
    fontSize: 18,
    color: Colors.text.primary,
    marginBottom: 16,
  },
  orderDivider: {
    width: '100%',
    height: 1,
    backgroundColor: Colors.border.gold,
    marginBottom: 16,
  },
  orderAmount: {
    fontFamily: 'Inter_700Bold',
    fontSize: 26,
    color: Colors.gold.DEFAULT,
    marginTop: 6,
    marginBottom: 12,
  },
  orderInfoCard: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    marginBottom: 24,
    width: '100%',
  },
  orderTotalLabel: {
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
  paymentMethodRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderTopColor: Colors.border.gold,
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: 1,
    gap: 2,
  },

  paymentMethodLabel: {
    fontSize: 14,
    color: Colors.text.secondary,
    fontFamily: 'Inter_400Regular',
  },

  paymentMethodValue: {
    fontSize: 14,
    color: Colors.gold.DEFAULT,
    fontFamily: 'Inter_600SemiBold',
  },
  paymentNoteTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 10,
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
  },
  paymentNoteText: {
    fontFamily: 'Inter_400Regular',
    fontSize: 14,
    color: Colors.text.primary,
    lineHeight: 22,
  },
  accountLabel: {
    marginTop: 8,
    fontSize: 12,
    fontFamily: 'Inter_500Medium',
    color: Colors.text.muted,
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
    color: Colors.gold.DEFAULT,
  },
});
