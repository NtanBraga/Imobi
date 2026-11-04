import { useLocation, useMap, useUI } from '@/hooks';
import { ModoLocomocao, ModoVisualizacao } from '@/models';
import { useEffect, useRef, useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';

export default function Map() {
  const { modoLocomocao, setModoLocomocao, modoVisualizacao, setModoVisualizacao } = useMap();
  const { location } = useLocation();
  const mapRef = useRef<MapView>(null); // Referencia para manipular a camera
  const { abrirTab, tabAtiva } = useUI();

  //Mock de movimento GPS --DEV
  const [devOffset, setDevOffset] = useState({ lat: 0, lng: 0 });
  const moveInterval = useRef<ReturnType<typeof setTimeout> | null>(null);

  //Movimento --DEV
  const startMoving = (dLat: number, dLng: number) => {
    stopMoving();
    moveInterval.current = setInterval(() => {
      setDevOffset((prev) => ({ lat: prev.lat + dLat, lng: prev.lng + dLng }));
    }, 40);
  };

  const stopMoving = () => {
    if (moveInterval.current) {
      clearInterval(moveInterval.current);
      moveInterval.current = null;
    }
  };

  //Posicao final (combinar gps real com deslocamento dev)
  const currentLocation = location
    ? {
        latitude: location.latitude + devOffset.lat,
        longitude: location.longitude + devOffset.lng,
      }
    : null;

  //Atualizar camera quando localizacao falsa/real mudar
  useEffect(() => {
    if (currentLocation && mapRef.current) {
      // Delta maior = Zoom menor; Delta menor = Zoom maior
      //Zoom menor para Carro, Zoom maior para A pé
      const deltaZoom = modoLocomocao == ModoLocomocao.TRANSITO ? 0.0015 : 0.003;

      mapRef.current.animateToRegion(
        {
          latitude: currentLocation.latitude,
          longitude: currentLocation.longitude,
          latitudeDelta: deltaZoom,
          longitudeDelta: deltaZoom,
        },
        1000,
      ); // 1000ms para animar
    }
  }, [currentLocation?.latitude, currentLocation?.longitude, modoLocomocao]);

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
        showsUserLocation={!__DEV__}
        showsCompass={false}
        showsMyLocationButton={false}
        //TODO: angulo da camera
      >
        {/*Marcador Dev*/}
        {__DEV__ && currentLocation && (
          <Marker coordinate={currentLocation} anchor={{ x: 0.5, y: 0.5 }}>
            <View style={styles.blueDotContainer}>
              {/*Aura de precisao*/}
              <View style={styles.blueDotAura} />

              {/*Nucleo*/}
              <View style={styles.blueDotCore} />
            </View>
          </Marker>
        )}
      </MapView>

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

      {/*D-PAD DEVELOPER*/}
      {__DEV__ && tabAtiva === 'NENHUM' && (
        <View style={styles.dpadContainer}>
          <TouchableOpacity
            style={styles.dpadBtn}
            onPressIn={() => startMoving(0.00001, 0)}
            onPressOut={stopMoving}
            activeOpacity={0.6}
          >
            <Text style={styles.dpadText}>⬆️</Text>
          </TouchableOpacity>

          <View style={styles.dpadRow}>
            <TouchableOpacity
              style={styles.dpadBtn}
              onPressIn={() => startMoving(0, -0.00001)}
              onPressOut={stopMoving}
              activeOpacity={0.6}
            >
              <Text style={styles.dpadText}>⬅️</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.dpadBtn}
              onPressIn={() => startMoving(0, 0.00001)}
              onPressOut={stopMoving}
              activeOpacity={0.6}
            >
              <Text style={styles.dpadText}>➡️</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={styles.dpadBtn}
            onPressIn={() => startMoving(-0.00001, 0)}
            onPressOut={stopMoving}
            activeOpacity={0.6}
          >
            <Text style={styles.dpadText}>⬇️</Text>
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
  blueDotContainer: {
    width: 48,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
  },
  blueDotAura: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    borderRadius: 24,
    backgroundColor: 'rgba(66, 133, 244, 0.2)',
  },
  blueDotCore: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#4285F4',
    borderWidth: 3,
    borderColor: 'white',
    elevation: 5,
    shadowColor: 'black',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
  },
  dpadContainer: {
    position: 'absolute',
    bottom: 120,
    alignSelf: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.7)',
    padding: 2,
    borderRadius: 60,
    zIndex: 5,
  },
  dpadRow: {
    flexDirection: 'row',
    gap: 35,
    marginVertical: 4,
  },
  dpadBtn: {
    backgroundColor: 'white',
    padding: 12,
    borderRadius: 10,
  },
  dpadText: {
    fontSize: 16,
  },
});
