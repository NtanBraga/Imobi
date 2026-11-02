import { useMap } from '@/hooks';
import { ModoVisualizacao } from '@/models';
import { Text, TouchableOpacity, View } from 'react-native';
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
    <View>
      <MapView
        provider={PROVIDER_GOOGLE}
        initialRegion={initialRegion}
        showsUserLocation={false} //Aguardando GPS usuario
        showsCompass={false}
        showsMyLocationButton={false}
        //TODO: zoom e angulo da camera
      />

      {/*Controles*/}
      <View>
        <View>
          {/*Alterar transito e a pe*/}
          <View>
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
