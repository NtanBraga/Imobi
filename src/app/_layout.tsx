import { initializeDatabase } from '@/database';
import { Stack } from 'expo-router';
import { useEffect } from 'react';
import 'react-native-gesture-handler';

export default function StackLayout() {
  useEffect(() => {
    initializeDatabase();
  }, []);

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
    </Stack>
  );
}
