import { useMap } from '@/hooks';
import { ModoLocomocao, ModoVisualizacao } from '@/models';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import MapView, { PROVIDER_GOOGLE } from 'react-native-maps';

export default function Map() {
  const { modoLocomocao, setModoLocomocao, modoVisualizacao, setModoVisualizacao } = useMap();

  //Mock enquanto GPS usuario nao esta feito
  const initialRegion = {
    latitude: -30.269359,
    longitude: -51.299773,
    latitudeDelta: 0.05,
    longitudeDelta: 0.05,
  };

  return (
    <View style={styles.container}>
      <MapView
        style={StyleSheet.absoluteFill}
        provider={PROVIDER_GOOGLE}
        initialRegion={initialRegion}
        showsUserLocation={false} //Aguardando GPS usuario
        showsCompass={false}
        showsMyLocationButton={false}
        //TODO: zoom e angulo da camera
      />

      {/*Controles*/}
      <View style={styles.topControls}>
        <View style={styles.toggleGroup}>
          {/*Alterar transito e a pe*/}
          <View style={styles.row}>
            <TouchableOpacity
              style={[
                styles.modeButton,
                modoLocomocao === ModoLocomocao.TRANSITO && styles.activateModeButton,
              ]}
              onPress={() => setModoLocomocao(ModoLocomocao.TRANSITO)}
            >
              <Text
                style={[
                  styles.modeText,
                  modoLocomocao === ModoLocomocao.TRANSITO && styles.activateModeText,
                ]}
              >
                Carro
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.modeButton,
                modoLocomocao === ModoLocomocao.A_PE && styles.activateModeButton,
              ]}
              onPress={() => setModoLocomocao(ModoLocomocao.A_PE)}
            >
              <Text
                style={[
                  styles.modeText,
                  modoLocomocao === ModoLocomocao.A_PE && styles.activateModeText,
                ]}
              >
                A pé
              </Text>
            </TouchableOpacity>
          </View>

          {/*Alterar Modo Off e Modo On*/}
          <TouchableOpacity style={styles.gamificationToggle} onPress={setModoVisualizacao}>
            <Text>{modoVisualizacao === ModoVisualizacao.ON ? 'Modo On' : 'Modo Off'}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  topControls: {
    position: 'absolute',
    top: 60,
    left: 20,
    right: 20,
    zIndex: 10,
  },
  toggleGroup: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(255,255,255,0.9)',
    padding: 15,
    borderRadius: 10,
  },
  row: {
    flexDirection: 'row',
    gap: 15,
  },

  modeButton: {
    padding: 10,
    borderRadius: 12,
    backgroundColor: 'transparent',
  },

  activateModeButton: {
    backgroundColor: '#36578f',
  },

  modeText: {
    fontWeight: 600,
  },

  activateModeText: {
    color: 'white',
  },

  gamificationToggle: {
    padding: 10,
    justifyContent: 'center',
  },
});
