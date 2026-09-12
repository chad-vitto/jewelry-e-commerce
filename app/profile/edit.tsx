import * as ImagePicker from 'expo-image-picker';
import { useState } from 'react';
import { ArrowLeft, Camera, User } from 'lucide-react-native';
import { GoldButton } from '@/components';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/store';
import { useImageUpload } from '@/hooks';
import { useTheme } from '@/hooks/useTheme';
import type { AppColors } from '@/constants/themes';
import { useRouter } from 'expo-router';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Image,
  TextInput,
  Alert,
} from 'react-native';

export default function EditProfileScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const styles = createStyles(colors);
  const { user, fetchProfile } = useAuthStore();

  const [fullName, setFullName] = useState(user?.full_name ?? '');

  const [phone, setPhone] = useState(user?.phone_number ?? '');

  const [avatar, setAvatar] = useState(user?.avatar_url ?? '');

  const { uploadImage, uploading } = useImageUpload();

  const handleSave = async () => {
    if (!user) return;

    try {
      let avatarUrl = user.avatar_url;

      // Upload new avatar if user selected one
      if (avatar && avatar.startsWith('file://')) {
        avatarUrl = await uploadImage(
          {
            uri: avatar,
            name: `avatar-${user.id}.jpg`,
            type: 'image/jpeg',
          },
          'avatars',
        );

        if (!avatarUrl) {
          throw new Error('Avatar upload failed');
        }
      }

      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: fullName.trim(),
          phone_number: phone.trim() || null,
          avatar_url: avatarUrl,
        })
        .eq('id', user.id);

      if (error) throw error;

      await fetchProfile();
      router.back();
    } catch (err) {
      console.error(err);
      Alert.alert(
        'Unable to save profile',
        err instanceof Error ? err.message : 'Something went wrong',
      );
    }
  };

  const pickAvatar = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permission.granted) return;

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled) {
      setAvatar(result.assets[0].uri);
    }
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.header}>
        <Pressable style={styles.backButton} onPress={() => router.back()}>
          <ArrowLeft size={22} color={colors.text.primary} />
        </Pressable>

        <Text style={styles.title}>Edit Profile</Text>

        <View style={{ width: 40 }} />
      </View>

      <View style={styles.avatarSection}>
        <Pressable style={styles.avatarContainer} onPress={pickAvatar}>
          {avatar ? (
            <Image source={{ uri: avatar }} style={styles.avatar} />
          ) : (
            <User size={42} color={colors.gold.DEFAULT} />
          )}

          <View style={styles.cameraBadge}>
            <Camera size={16} color={colors.primary} />
          </View>
        </Pressable>
      </View>

      <Pressable onPress={pickAvatar}>
        <Text style={styles.changePhoto}>Change Profile Photo</Text>
      </Pressable>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Personal Information</Text>

        <View style={styles.field}>
          <Text style={styles.label}>Full Name</Text>

          <TextInput
            value={fullName}
            onChangeText={setFullName}
            placeholder="Enter your full name"
            placeholderTextColor={colors.text.muted}
            style={styles.input}
          />
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Email</Text>

          <TextInput
            value={user?.email ?? ''}
            editable={false}
            style={[styles.input, styles.disabledInput]}
          />
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Phone Number</Text>

          <TextInput
            value={phone}
            onChangeText={setPhone}
            keyboardType="phone-pad"
            placeholder="+63 912 345 6789"
            placeholderTextColor={colors.text.muted}
            style={styles.input}
          />
        </View>
      </View>

      <GoldButton
        title="Save Changes"
        onPress={handleSave}
        loading={uploading}
      />
    </ScrollView>
  );
}

const createStyles = (colors: AppColors) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.primary,
  },

  content: {
    padding: 20,
    paddingBottom: 50,
  },

  header: {
    flexDirection: 'row',

    alignItems: 'center',

    justifyContent: 'space-between',

    marginBottom: 28,
  },

  title: {
    fontFamily: 'CormorantGaramond_700Bold',
    fontSize: 28,

    color: colors.text.primary,
  },

  backButton: {
    width: 40,
    height: 40,

    borderRadius: 20,

    backgroundColor: colors.surface,

    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarSection: {
    alignItems: 'center',

    marginBottom: 32,
  },

  avatarContainer: {
    width: 110,
    height: 110,

    borderRadius: 55,

    backgroundColor: colors.surface,

    borderWidth: 2,
    borderColor: colors.gold.DEFAULT,

    justifyContent: 'center',
    alignItems: 'center',

    overflow: 'hidden',
  },

  avatar: {
    width: '100%',
    height: '100%',
  },

  cameraBadge: {
    position: 'absolute',

    right: 4,
    bottom: 4,

    width: 30,
    height: 30,

    borderRadius: 15,

    backgroundColor: colors.gold.DEFAULT,

    justifyContent: 'center',
    alignItems: 'center',
  },

  changePhoto: {
    marginTop: 12,

    fontFamily: 'Inter_500Medium',
    fontSize: 14,

    color: colors.gold.DEFAULT,
  },
  card: {
    backgroundColor: colors.surface,

    borderRadius: 20,

    padding: 20,

    marginBottom: 24,
  },

  sectionTitle: {
    fontFamily: 'CormorantGaramond_700Bold',
    fontSize: 22,

    color: colors.text.primary,

    marginBottom: 20,
  },
  field: {
    marginBottom: 20,
  },

  label: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 13,
    color: colors.gold.DEFAULT,

    marginBottom: 8,
  },

  input: {
    backgroundColor: colors.primary,

    borderRadius: 14,

    borderWidth: 1,
    borderColor: colors.border.DEFAULT,

    paddingHorizontal: 16,
    paddingVertical: 14,

    fontFamily: 'Inter_400Regular',
    fontSize: 16,

    color: colors.text.primary,
  },

  disabledInput: {
    opacity: 0.65,
  },
});
