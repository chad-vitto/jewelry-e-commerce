import { PaymentMethod } from '@/types';

export const PAYMENT_METHODS: PaymentMethod[] = [
  {
    id: 'gcash',
    name: 'GCash',
    icon: 'smartphone',
    instructions: 'Send payment to GCash number: 0917-123-4567\n\nAccount Name: Reloved Gold Collections PH\n\nPlease send your Order Number as reference.',
    accountNumber: '0917-123-4567',
    accountName: 'Reloved GOld Collections PH',
  },
  {
    id: 'paymaya',
    name: 'PayMaya',
    icon: 'credit-card',
    instructions: 'Send payment to PayMaya number: 0928-765-4321\n\nAccount Name: Reloved GOld Collections PH\n\nPlease send your Order Number as reference.',
    accountNumber: '0928-765-4321',
    accountName: 'Reloved GOld Collections PH',
  },
  {
    id: 'bank_transfer',
    name: 'Bank Transfer',
    icon: 'building',
    instructions: 'Bank: BDO Unibank\nAccount Name: Reloved GOld Collections Philippines Inc.\nAccount Number: 0012-3456-7890\n\nPlease email proof of payment to payments@RelovedjGoldCollectionss.ph',
    accountNumber: '0012-3456-7890',
    accountName: 'Reloved GOld Collections Philippines Inc.',
    bankName: 'BDO Unibank',
  },
];

export const SHIPPING_FEE_PHP = 150;

export const FREE_SHIPPING_THRESHOLD_PHP = 10000;

export const formatCurrency = (amount: number): string => {
  return `₱${amount.toLocaleString('en-PH')}`;
};

export const formatCurrencyWithDecimals = (amount: number): string => {
  return `₱${amount.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};
