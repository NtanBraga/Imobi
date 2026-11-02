import Map from '@/screens/Map';
import { OcorrenciaBottomSheet } from '@/screens/Ocorrencia_bottom_sheet';
import { BottomSheetModalProvider } from '@gorhom/bottom-sheet';
import { StyleSheet, View } from 'react-native';

export default function HomeScreen() {
  return (
    <BottomSheetModalProvider>
      <View style={styles.container}>
        <Map></Map>
        <OcorrenciaBottomSheet></OcorrenciaBottomSheet>
      </View>
    </BottomSheetModalProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
