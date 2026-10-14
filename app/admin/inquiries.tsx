import { memo, useCallback, useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, Pressable } from 'react-native';
import { useRouter, Stack } from 'expo-router';
import { useAdminInquiries } from '@/hooks';
import { InquiryStatusBadge } from '@/components';
import { useTheme } from '@/hooks/useTheme';
import type { AppColors } from '@/constants/themes';
import { ChevronLeft, Inbox, Clock } from 'lucide-react-native';
import { Inquiry, InquiryStatus } from '@/types';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const STATUS_FILTERS: { value: InquiryStatus | 'all'; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'new', label: 'New' },
  { value: 'read', label: 'Read' },
  { value: 'replied', label: 'Replied' },
];

export default function AdminInquiriesScreen() {
  const { colors } = useTheme();
  const styles = createStyles(colors);
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { inquiries, fetchInquiries } = useAdminInquiries();
  const [selectedStatus, setSelectedStatus] = useState<InquiryStatus | 'all'>(
    'all',
  );

  useEffect(() => {
    fetchInquiries();
  }, [fetchInquiries]);

  const filteredInquiries =
    selectedStatus === 'all'
      ? inquiries
      : inquiries.filter((i) => i.status === selectedStatus);

  const handleInquiryPress = useCallback((inquiry: Inquiry) => {
    router.push({
      pathname: "/admin/inquiries/[id]" as any,
      params: { id: inquiry.id },
    });
  }, [router]);

  const renderInquiry = useCallback(({ item }: { item: Inquiry }) => (
    <AdminInquiryRow inquiry={item} onPress={handleInquiryPress} />
  ), [handleInquiryPress]);

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />

      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
        <Pressable style={styles.backButton} onPress={() => router.back()}>
          <ChevronLeft size={24} color={colors.text.primary} />
        </Pressable>
        <Text style={styles.headerTitle}>Inquiries</Text>
        <View style={{ width: 44 }} />
      </View>

      {/* Filters */}
      <FlatList
        data={STATUS_FILTERS}
        keyExtractor={(item) => item.value}
        horizontal
        style={styles.filterList}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filterContainer}
        renderItem={({ item }) => {
          const isSelected = selectedStatus === item.value;
          const count =
            item.value === 'all'
              ? inquiries.length
              : inquiries.filter((i) => i.status === item.value).length;

          return (
            <Pressable
              style={[styles.filterPill, isSelected && styles.filterPillActive]}
              onPress={() => setSelectedStatus(item.value)}
            >
              <Text
                style={[
                  styles.filterText,
                  isSelected && styles.filterTextActive,
                ]}
              >
                {item.label}
              </Text>
              <View
                style={[
                  styles.filterBadge,
                  isSelected && styles.filterBadgeActive,
                ]}
              >
                <Text
                  style={[
                    styles.filterBadgeText,
                    isSelected && styles.filterBadgeTextActive,
                  ]}
                >
                  {count}
                </Text>
              </View>
            </Pressable>
          );
        }}
      />

      {/* Inquiries List */}
      <FlatList
        data={filteredInquiries}
        keyExtractor={(item) => item.id}
        renderItem={renderInquiry}
        contentContainerStyle={[styles.listContent, { paddingBottom: insets.bottom + 16 }]}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Inbox size={48} color={colors.text.muted} />
            <Text style={styles.emptyText}>No inquiries found</Text>
          </View>
        }
      />
    </View>
  );
}

interface AdminInquiryRowProps {
  inquiry: Inquiry;
  onPress: (inquiry: Inquiry) => void;
}

const AdminInquiryRow = memo(function AdminInquiryRow({ inquiry, onPress }: AdminInquiryRowProps) {
  const { colors } = useTheme();
  const styles = createStyles(colors);

  return (
    <Pressable
      style={[styles.inquiryCard, inquiry.status === 'new' && styles.newInquiryCard]}
      onPress={() => onPress(inquiry)}
    >
      <View style={styles.inquiryHeader}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{inquiry.customer_name.charAt(0).toUpperCase()}</Text>
        </View>
        <View style={styles.inquiryInfo}>
          <Text style={styles.customerName}>{inquiry.customer_name}</Text>
          <Text style={styles.subjectLine} numberOfLines={1}>{inquiry.subject}</Text>
        </View>
        <InquiryStatusBadge status={inquiry.status} />
      </View>

      <Text style={styles.messagePreview} numberOfLines={2}>{inquiry.message}</Text>

      <View style={styles.inquiryFooter}>
        <View style={styles.dateContainer}>
          <Clock size={14} color={colors.text.muted} />
          <Text style={styles.dateText}>
            {new Date(inquiry.created_at).toLocaleDateString('en-PH', {
              month: 'short',
              day: 'numeric',
            })}
          </Text>
        </View>
        {inquiry.product_id && <Text style={styles.productRef}>Product inquiry</Text>}
      </View>
    </Pressable>
  );
}, (previous, next) =>
  previous.onPress === next.onPress &&
  previous.inquiry.id === next.inquiry.id &&
  previous.inquiry.customer_name === next.inquiry.customer_name &&
  previous.inquiry.subject === next.inquiry.subject &&
  previous.inquiry.status === next.inquiry.status &&
  previous.inquiry.message === next.inquiry.message &&
  previous.inquiry.created_at === next.inquiry.created_at &&
  previous.inquiry.product_id === next.inquiry.product_id,
);

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
  filterContainer: {
    paddingHorizontal: 12,
    alignItems: 'center',
    gap: 8,
  },
  filterList: {
    height: 52,
    flexGrow: 0,
  },
  filterPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 14,
    minHeight: 38,
    borderRadius: 20,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border.DEFAULT,
    gap: 6,
  },
  filterPillActive: {
    backgroundColor: colors.gold.DEFAULT,
    borderColor: colors.gold.DEFAULT,
  },
  filterText: {
    fontFamily: 'Inter_500Medium',
    fontSize: 13,
    color: colors.text.secondary,
  },
  filterTextActive: {
    color: colors.primary,
  },
  filterBadge: {
    backgroundColor: colors.border.DEFAULT,
    borderRadius: 10,
    minWidth: 18,
    height: 18,
    paddingHorizontal: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterBadgeActive: {
    backgroundColor: colors.primary + '40',
  },
  filterBadgeText: {
    fontFamily: 'Inter_700Bold',
    fontSize: 11,
    color: colors.text.secondary,
  },
  filterBadgeTextActive: {
    color: colors.primary,
  },
  listContent: {
    padding: 16,
  },
  inquiryCard: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  newInquiryCard: {
    borderWidth: 2,
    borderColor: colors.gold.DEFAULT,
  },
  inquiryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.gold.DEFAULT,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  avatarText: {
    fontFamily: 'Inter_700Bold',
    fontSize: 16,
    color: colors.primary,
  },
  inquiryInfo: {
    flex: 1,
  },
  customerName: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 15,
    color: colors.text.primary,
    marginBottom: 2,
  },
  subjectLine: {
    fontFamily: 'Inter_400Regular',
    fontSize: 13,
    color: colors.text.secondary,
  },
  messagePreview: {
    fontFamily: 'Inter_400Regular',
    fontSize: 14,
    color: colors.text.secondary,
    lineHeight: 20,
    marginBottom: 12,
  },
  inquiryFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  dateText: {
    fontFamily: 'Inter_400Regular',
    fontSize: 12,
    color: colors.text.muted,
  },
  productRef: {
    fontFamily: 'Inter_500Medium',
    fontSize: 12,
    color: colors.gold.DEFAULT,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontFamily: 'Inter_500Medium',
    fontSize: 16,
    color: colors.text.muted,
    marginTop: 12,
  },
});
