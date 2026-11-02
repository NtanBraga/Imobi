import { GestureHandlerRootView } from 'react-native-gesture-handler';

import { initializeDatabase } from '@/database';
import { BottomSheetModalProvider } from '@gorhom/bottom-sheet';
import { Stack } from 'expo-router';
import { useEffect } from 'react';
import { StyleSheet } from 'react-native';

export default function StackLayout() {
  useEffect(() => {
    initializeDatabase();
  }, []);

  return (
    <GestureHandlerRootView style={styles.container}>
      <BottomSheetModalProvider>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="index" />
        </Stack>
      </BottomSheetModalProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
