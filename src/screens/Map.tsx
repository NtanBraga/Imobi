import { useLocation, useMap, useUI } from '@/hooks';
import { ModoLocomocao, ModoVisualizacao } from '@/models';
import { useEffect, useRef } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import MapView, { PROVIDER_GOOGLE } from 'react-native-maps';

export default function Map() {
  const { modoLocomocao, setModoLocomocao, modoVisualizacao, setModoVisualizacao } = useMap();
  const { location } = useLocation();
  const mapRef = useRef<MapView>(null); // Referencia para manipular a camera
  const { abrirTab, tabAtiva } = useUI();

  useEffect(() => {
    if (location && mapRef.current) {
      // Delta maior = Zoom menor; Delta menor = Zoom maior
      //Zoom menor para Carro, Zoom maior para A pé
      const deltaZoom = modoLocomocao == ModoLocomocao.TRANSITO ? 0.0015 : 0.003;

      mapRef.current.animateToRegion(
        {
          latitude: location.latitude,
          longitude: location.longitude,
          latitudeDelta: deltaZoom,
          longitudeDelta: deltaZoom,
        },
        1000,
      ); // 1000ms para animar
    }
  }, [location, modoLocomocao]);

  //Mock inicial ate o mapa carregar o gps
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
        ref={mapRef}
        provider={PROVIDER_GOOGLE}
        initialRegion={initialRegion}
        showsUserLocation={true} //Aguardando GPS usuario
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
            <Text style={styles.gamificationToggleText}>
              {modoVisualizacao === ModoVisualizacao.ON ? 'Modo On' : 'Modo Off'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/*Botoes flutuantes*/}
      {tabAtiva === 'NENHUM' && (
        <View style={styles.bottomControls}>
          {/*OCORRENCIA*/}
          <TouchableOpacity
            style={[styles.tabButtons, { backgroundColor: 'cyan' }]}
            onPress={() => abrirTab('LOJA')}
            activeOpacity={0.8}
          >
            <Text style={styles.tabButtonText}>L</Text>
          </TouchableOpacity>

          {/*LOJA*/}
          <TouchableOpacity
            style={[styles.tabButtons, { backgroundColor: 'orange' }]}
            onPress={() => abrirTab('OCORRENCIA')}
            activeOpacity={0.8}
          >
            <Text style={styles.tabButtonText}>O</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tabButtons, { backgroundColor: 'green' }]}
            onPress={() => abrirTab('CARTEIRA')}
            activeOpacity={0.8}
          >
            <Text style={styles.tabButtonText}>C</Text>
          </TouchableOpacity>
        </View>
      )}
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
  gamificationToggleText: {
    fontWeight: 'bold',
    color: '#0f1f7a',
  },
  tabButtons: {
    width: 64,
    height: 64,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
  },
  tabButtonText: {
    fontSize: 30,
    color: 'white',
    fontWeight: 'bold',
  },
  bottomControls: {
    position: 'absolute',
    bottom: 40,
    left: 20,
    right: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    zIndex: 10,
  },
});
