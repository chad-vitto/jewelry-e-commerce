import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, Pressable } from 'react-native';
import { useRouter, Stack } from 'expo-router';
import { useAdminInquiries } from '@/hooks';
import { InquiryStatusBadge } from '@/components';
import { Colors } from '@/constants';
import { ArrowLeft, Inbox, Mail, Clock } from 'lucide-react-native';
import { Inquiry, InquiryStatus } from '@/types';

const STATUS_FILTERS: { value: InquiryStatus | 'all'; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'new', label: 'New' },
  { value: 'read', label: 'Read' },
  { value: 'replied', label: 'Replied' },
];

export default function AdminInquiriesScreen() {
  const router = useRouter();
  const { inquiries, isLoading, fetchInquiries } = useAdminInquiries();
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

  const handleInquiryPress = (inquiry: Inquiry) => {
    router.push({
      pathname: "/admin/inquiries/[id]" as any,
      params: { id: inquiry.id },
    });
  };

  const renderInquiry = ({ item }: { item: Inquiry }) => (
    <Pressable
      style={[
        styles.inquiryCard,
        item.status === 'new' && styles.newInquiryCard,
      ]}
      onPress={() => handleInquiryPress(item)}
    >
      <View style={styles.inquiryHeader}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {item.customer_name.charAt(0).toUpperCase()}
          </Text>
        </View>
        <View style={styles.inquiryInfo}>
          <Text style={styles.customerName}>{item.customer_name}</Text>
          <Text style={styles.subjectLine} numberOfLines={1}>
            {item.subject}
          </Text>
        </View>
        <InquiryStatusBadge status={item.status} />
      </View>

      <Text style={styles.messagePreview} numberOfLines={2}>
        {item.message}
      </Text>

      <View style={styles.inquiryFooter}>
        <View style={styles.dateContainer}>
          <Clock size={14} color={Colors.text.muted} />
          <Text style={styles.dateText}>
            {new Date(item.created_at).toLocaleDateString('en-PH', {
              month: 'short',
              day: 'numeric',
            })}
          </Text>
        </View>
        {item.product_id && (
          <Text style={styles.productRef}>Product inquiry</Text>
        )}
      </View>
    </Pressable>
  );

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />

      {/* Header */}
      <View style={styles.header}>
        <Pressable style={styles.backButton} onPress={() => router.back()}>
          <ArrowLeft size={24} color={Colors.text.primary} />
        </Pressable>
        <Text style={styles.headerTitle}>Inquiries</Text>
        <View style={{ width: 44 }} />
      </View>

      {/* Filters */}
      <FlatList
        data={STATUS_FILTERS}
        keyExtractor={(item) => item.value}
        horizontal
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
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Inbox size={48} color={Colors.text.muted} />
            <Text style={styles.emptyText}>No inquiries found</Text>
          </View>
        }
      />
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
  filterContainer: {
    paddingHorizontal: 12,
    paddingBottom: 12,
    gap: 8,
  },
  filterPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 20,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border.DEFAULT,
    gap: 6,
  },
  filterPillActive: {
    backgroundColor: Colors.gold.DEFAULT,
    borderColor: Colors.gold.DEFAULT,
  },
  filterText: {
    fontFamily: 'Inter_500Medium',
    fontSize: 13,
    color: Colors.text.secondary,
  },
  filterTextActive: {
    color: Colors.primary,
  },
  filterBadge: {
    backgroundColor: Colors.border.DEFAULT,
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  filterBadgeActive: {
    backgroundColor: Colors.primary + '40',
  },
  filterBadgeText: {
    fontFamily: 'Inter_700Bold',
    fontSize: 11,
    color: Colors.text.secondary,
  },
  filterBadgeTextActive: {
    color: Colors.primary,
  },
  listContent: {
    padding: 16,
  },
  inquiryCard: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  newInquiryCard: {
    borderWidth: 2,
    borderColor: Colors.gold.DEFAULT,
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
    backgroundColor: Colors.gold.DEFAULT,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  avatarText: {
    fontFamily: 'Inter_700Bold',
    fontSize: 16,
    color: Colors.primary,
  },
  inquiryInfo: {
    flex: 1,
  },
  customerName: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 15,
    color: Colors.text.primary,
    marginBottom: 2,
  },
  subjectLine: {
    fontFamily: 'Inter_400Regular',
    fontSize: 13,
    color: Colors.text.secondary,
  },
  messagePreview: {
    fontFamily: 'Inter_400Regular',
    fontSize: 14,
    color: Colors.text.secondary,
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
    color: Colors.text.muted,
  },
  productRef: {
    fontFamily: 'Inter_500Medium',
    fontSize: 12,
    color: Colors.gold.DEFAULT,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontFamily: 'Inter_500Medium',
    fontSize: 16,
    color: Colors.text.muted,
    marginTop: 12,
  },
});
