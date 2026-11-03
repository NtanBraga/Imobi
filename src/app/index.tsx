import { useWallet } from '@/hooks';
import { CarteiraBottomSheet } from '@/screens/Carteira_bottom_sheet';
import { LojaBottomSheet } from '@/screens/Loja_bottom_sheet';
import Map from '@/screens/Map';
import { OcorrenciaBottomSheet } from '@/screens/Ocorrencia_bottom_sheet';
import { BottomSheetModalProvider } from '@gorhom/bottom-sheet';
import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';

export default function HomeScreen() {
  const { carregarSaldo } = useWallet();

  //Buscar meodas salvas no SQLITE
  useEffect(() => {
    carregarSaldo();
  }, []);

  return (
    <BottomSheetModalProvider>
      <View style={styles.container}>
        <Map></Map>
        <OcorrenciaBottomSheet></OcorrenciaBottomSheet>
        <CarteiraBottomSheet></CarteiraBottomSheet>
        <LojaBottomSheet></LojaBottomSheet>
      </View>
    </BottomSheetModalProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
