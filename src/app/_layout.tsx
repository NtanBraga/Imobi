import { GestureHandlerRootView } from 'react-native-gesture-handler';

import { initializeDatabase } from '@/database';
import { BottomSheetModalProvider } from '@gorhom/bottom-sheet';
import { Stack } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';

export default function StackLayout() {
  const [isDbReady, setIsDbReady] = useState(false);

  useEffect(() => {
    const prepararBancoDeDados = async () => {
      try {
        await initializeDatabase();
      } catch (e) {
        console.error('Falha ao criar tabelas: ', e);
      } finally {
        setIsDbReady(true);
      }
    };
    prepararBancoDeDados();
  }, []);

  if (!isDbReady) {
    return (
      <View style={[styles.container, styles.loadingCenter]}>
        <ActivityIndicator size="large" color="#2a9d8f"></ActivityIndicator>
      </View>
    );
  }

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
  loadingCenter: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'white',
  },
});
