import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  ActivityIndicator,
  Alert,
  RefreshControl,
  ActionSheetIOS,
} from 'react-native';
import { useRouter, Stack } from 'expo-router';
import { useAdminUsers } from '@/hooks';
import { Colors } from '@/constants';
import {
  ArrowLeft,
  Users,
  Shield,
  UserCheck,
  User as UserIcon,
} from 'lucide-react-native';
import { UserRole } from '@/types';
import { useAuthStore } from '@/store/authStore';
import AccessDenied from '@/components/AccessDenied';

export default function AdminUsersScreen() {
  const router = useRouter();
  const { users, isLoading, error, fetchUsers, updateUserRole } = useAdminUsers();
  const [selectedRole, setSelectedRole] = useState<{ userId: string; role: UserRole } | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const { user } = useAuthStore();

  useEffect(() => {
    fetchUsers();
  }, []);

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    fetchUsers().finally(() => setRefreshing(false));
  }, [fetchUsers]);
  
  if (user?.role !== 'admin') {
    return ( 
      <AccessDenied />
    );
  }

  const handleRoleChange = (userId: string, newRole: UserRole) => {
    Alert.alert(
      'Change User Role',
      `Are you sure you want to change this user's role to "${newRole}"?`,
      [
        {
          text: 'Cancel',
          onPress: () => {},
          style: 'cancel',
        },
        {
          text: 'Change',
          onPress: async () => {
            setIsUpdating(true);
            const success = await updateUserRole(userId, newRole);
            setIsUpdating(false);
            if (success) {
              Alert.alert('Success', 'User role updated successfully');
            } else {
              Alert.alert('Error', 'Failed to update user role');
            }
          },
          style: 'default',
        },
      ]
    );
  };

  const getRoleIcon = (role: UserRole) => {
    switch (role) {
      case 'admin':
        return <Shield size={20} color={Colors.status.error} />;
      case 'staff':
        return <UserCheck size={20} color={Colors.gold.DEFAULT} />;
      default:
        return <UserIcon size={20} color={Colors.text.muted} />;
    }
  };

  const getRoleColor = (role: UserRole) => {
    switch (role) {
      case 'admin':
        return Colors.status.error;
      case 'staff':
        return Colors.gold.DEFAULT;
      default:
        return Colors.text.muted;
    }
  };

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />

      {/* Header */}
      <View style={styles.header}>
        <Pressable style={styles.backButton} onPress={() => router.back()}>
          <ArrowLeft size={24} color={Colors.text.primary} />
        </Pressable>
        <View style={styles.headerTitle}>
          <Users size={28} color={Colors.gold.DEFAULT} />
          <Text style={styles.title}>Manage Users</Text>
        </View>
        <View style={{ width: 40 }} />
      </View>

      {error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}

      {isLoading && !refreshing ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.gold.DEFAULT} />
        </View>
      ) : (
        <ScrollView
          style={styles.scrollView}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          showsVerticalScrollIndicator={false}
        >
          {users.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Users size={48} color={Colors.text.muted} />
              <Text style={styles.emptyText}>No users found</Text>
            </View>
          ) : (
            <View style={styles.usersContainer}>
              <Text style={styles.userCountText}>{users.length} users total</Text>
              {users.map((user) => (
                <View key={user.id} style={styles.userCard}>
                  <View style={styles.userInfo}>
                    <View style={styles.userHeader}>
                      <Text style={styles.userName}>{user.full_name}</Text>
                      <View style={[styles.roleBadge, { borderColor: getRoleColor(user.role) }]}>
                        {getRoleIcon(user.role)}
                        <Text style={[styles.roleText, { color: getRoleColor(user.role) }]}>
                          {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                        </Text>
                      </View>
                    </View>
                    <Text style={styles.userEmail}>{user.email}</Text>
                    {user.phone_number && (
                      <Text style={styles.userPhone}>{user.phone_number}</Text>
                    )}
                    <Text style={styles.joinDate}>
                      Joined {new Date(user.created_at).toLocaleDateString('en-PH')}
                    </Text>
                  </View>

                  {/* Role Change Buttons */}
                  <View style={styles.roleButtonsContainer}>
                    <Pressable
                      style={[
                        styles.roleButton,
                        user.role === 'customer' && styles.roleButtonActive,
                      ]}
                      onPress={() => handleRoleChange(user.id, 'customer')}
                      disabled={isUpdating}
                    >
                      <Text
                        style={[
                          styles.roleButtonText,
                          user.role === 'customer' && styles.roleButtonTextActive,
                        ]}
                      >
                        Customer
                      </Text>
                    </Pressable>

                    <Pressable
                      style={[
                        styles.roleButton,
                        user.role === 'staff' && styles.roleButtonActive,
                      ]}
                      onPress={() => handleRoleChange(user.id, 'staff')}
                      disabled={isUpdating}
                    >
                      <Text
                        style={[
                          styles.roleButtonText,
                          user.role === 'staff' && styles.roleButtonTextActive,
                        ]}
                      >
                        Staff
                      </Text>
                    </Pressable>

                    <Pressable
                      style={[
                        styles.roleButton,
                        user.role === 'admin' && styles.roleButtonActive,
                      ]}
                      onPress={() => handleRoleChange(user.id, 'admin')}
                      disabled={isUpdating}
                    >
                      <Text
                        style={[
                          styles.roleButtonText,
                          user.role === 'admin' && styles.roleButtonTextActive,
                        ]}
                      >
                        Admin
                      </Text>
                    </Pressable>
                  </View>
                </View>
              ))}
            </View>
          )}
          <View style={{ height: 40 }} />
        </ScrollView>
      )}
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
    paddingHorizontal: 16,
    paddingTop: 50,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.surface,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  title: {
    fontFamily: 'CormorantGaramond_700Bold',
    fontSize: 24,
    color: Colors.text.primary,
  },
  errorContainer: {
    backgroundColor: Colors.status.error + '20',
    borderLeftWidth: 4,
    borderLeftColor: Colors.status.error,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 8,
  },
  errorText: {
    fontFamily: 'Inter_400Regular',
    fontSize: 14,
    color: Colors.status.error,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollView: {
    flex: 1,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontFamily: 'Inter_400Regular',
    fontSize: 16,
    color: Colors.text.muted,
    marginTop: 12,
  },
  usersContainer: {
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  userCountText: {
    fontFamily: 'Inter_500Medium',
    fontSize: 12,
    color: Colors.text.muted,
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  userCard: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  userInfo: {
    marginBottom: 16,
  },
  userHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  userName: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 16,
    color: Colors.text.primary,
    flex: 1,
  },
  roleBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
  },
  roleText: {
    fontFamily: 'Inter_500Medium',
    fontSize: 12,
  },
  userEmail: {
    fontFamily: 'Inter_400Regular',
    fontSize: 14,
    color: Colors.text.muted,
    marginBottom: 4,
  },
  userPhone: {
    fontFamily: 'Inter_400Regular',
    fontSize: 14,
    color: Colors.text.muted,
    marginBottom: 4,
  },
  joinDate: {
    fontFamily: 'Inter_400Regular',
    fontSize: 12,
    color: Colors.text.muted,
  },
  roleButtonsContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  roleButton: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.gold.DEFAULT,
    backgroundColor: 'transparent',
    alignItems: 'center',
  },
  roleButtonActive: {
    backgroundColor: Colors.gold.DEFAULT,
  },
  roleButtonText: {
    fontFamily: 'Inter_500Medium',
    fontSize: 12,
    color: Colors.gold.DEFAULT,
  },
  roleButtonTextActive: {
    color: Colors.primary,
  },
});
