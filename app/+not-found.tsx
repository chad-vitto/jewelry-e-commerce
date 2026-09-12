import { Link, Stack } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';
import { useTheme } from '@/hooks/useTheme';
import type { AppColors } from '@/constants/themes';

export default function NotFoundScreen() {
  const { colors } = useTheme();
  const styles = createStyles(colors);

  return (
    <>
      <Stack.Screen options={{ title: 'Oops!' }} />
      <View style={styles.container}>
        <Text style={styles.text}>This screen doesn&apos;t exist.</Text>
        <Link href="/" style={styles.link}>
          <Text>Go to home screen!</Text>
        </Link>
      </View>
    </>
  );
}

const createStyles = (colors: AppColors) => StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    backgroundColor: colors.primary,
  },
  text: {
    fontSize: 20,
    fontWeight: 600,
    color: colors.text.primary,
  },
  link: {
    marginTop: 15,
    paddingVertical: 15,
    color: colors.gold.DEFAULT,
  },
});
