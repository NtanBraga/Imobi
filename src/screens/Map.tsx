import { useMap } from '@/hooks';
import { ModoVisualizacao } from '@/models';
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
    <View style={styles.constainer}>
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
            <TouchableOpacity>
              <Text>Carro</Text>
            </TouchableOpacity>

            <TouchableOpacity>
              <Text>A pé</Text>
            </TouchableOpacity>
          </View>

          {/*Alterar Modo Off e Modo On*/}
          <TouchableOpacity>
            <Text>{modoVisualizacao === ModoVisualizacao.ON ? 'Modo On' : 'Modo Off'}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  constainer: {
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
});
