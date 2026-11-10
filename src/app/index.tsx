import { useUser, useWallet } from '@/hooks';
import { CarteiraBottomSheet } from '@/screens/Carteira_bottom_sheet';
import { LojaBottomSheet } from '@/screens/Loja_bottom_sheet';
import Map from '@/screens/Map';
import { OcorrenciaBottomSheet } from '@/screens/Ocorrencia_bottom_sheet';
import { RotaButtomSheet } from '@/screens/Rota_bottom_sheet';
import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';

export default function HomeScreen() {
  const { carregarSaldo } = useWallet();
  const { setUsuario } = useUser();

  //Buscar meodas salvas e usuario no SQLITE
  useEffect(() => {
    carregarSaldo();
    setUsuario();
  }, []);

  return (
    <View style={styles.container}>
      <Map></Map>
      <OcorrenciaBottomSheet></OcorrenciaBottomSheet>
      <CarteiraBottomSheet></CarteiraBottomSheet>
      <LojaBottomSheet></LojaBottomSheet>
      <RotaButtomSheet></RotaButtomSheet>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
