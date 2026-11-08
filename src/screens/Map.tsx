import { calcularDistancia } from '@/components/distancia';
import { MAPA_ON_ESTILO } from '@/constants/mapa';
import { RAIO_COLETA_MOEDA_METROS, VALOR_PADRAO_MOEDA } from '@/constants/moedas';
import { db } from '@/database';
import { LojaRepository, MoedaRepository, OcorrenciaRepository } from '@/database/repositories';
import { AvatarRepository } from '@/database/repositories/AvatarRepo';
import { useLocation, useMap, useUI, useUser, useWallet } from '@/hooks';
import {
  Avatar,
  Loja,
  ModoLocomocao,
  ModoVisualizacao,
  Moeda,
  Ocorrencia,
  TipoOcorrencia,
} from '@/models';
import { Lucide } from '@react-native-vector-icons/lucide';
import { useEffect, useRef, useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';

export default function Map() {
  const {
    modoLocomocao,
    setModoLocomocao,
    modoVisualizacao,
    setModoVisualizacao,
    coordenadaFoco,
    setCoordenadaFoco,
  } = useMap();
  const { location } = useLocation();
  const mapRef = useRef<MapView>(null); // Referencia para manipular a camera
  const { abrirTab, tabAtiva, fecharTabs } = useUI();

  //Mock de movimento GPS --DEV
  const [devOffset, setDevOffset] = useState({ lat: 0, lng: 0 });
  const moveInterval = useRef<ReturnType<typeof setTimeout> | null>(null);
  const timerGamificacao = useRef<number>(0);
  const isProcessingGamificacao = useRef<boolean>(false);
  const isEnabledDevMode = true;

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

  //Buscar dados no SQLite quando nenhuma tab ativa (para marcadores)
  const [ocorrencias, setOcorrencias] = useState<Ocorrencia[]>([]);
  const [lojas, setLojas] = useState<Loja[]>([]);
  const { creditar, zerarSaldo } = useWallet();
  const [moedas, setMoedas] = useState<Moeda[]>([]);
  const { usuarioAtivo } = useUser();
  const [avatares, setAvatares] = useState<Avatar[]>([]);

  //Identificar avatar equipado no momento
  const avatarEquipado = avatares.find((av) => av.id === usuarioAtivo?.avatarId);

  //Validação comunitaria
  const [ocorrenciaProxima, setOcorrenciaProxima] = useState<Ocorrencia | null>(null);
  const ocorrenciasValidadas = useRef<Set<string>>(new Set());

  const responderValidacao = async (resposta: 'SIM' | 'NAO') => {
    if (!ocorrenciaProxima) return;

    try {
      const database = await db;
      const idValidacao = Math.random().toString(36).substring(2, 9);

      await database.runAsync(
        'INSERT INTO ConfirmacaoOcorrencia (id, ocorrenciaId, usuarioId, tipo, data) VALUES (?, ?, ?, ?, ?)',
        [idValidacao, ocorrenciaProxima.id, 'user-mvp', resposta, new Date().toISOString()],
      );

      if (resposta == 'NAO') {
        await OcorrenciaRepository.atualizarStatus(
          database,
          ocorrenciaProxima.id,
          'RESOLVIDA' as any,
        );
        setOcorrencias((prev) => prev.filter((oc) => oc.id !== ocorrenciaProxima.id));
      }

      creditar(15);
      ocorrenciasValidadas.current.add(ocorrenciaProxima.id);
      setOcorrenciaProxima(null);

      alert('Obrigado pela ajuda! +15 moedas.');
    } catch (e) {
      console.error('Erro ao validar ocorrencia: ', e);
    }
  };

  useEffect(() => {
    if (tabAtiva === 'NENHUM') {
      const carregarMarcadores = async () => {
        const database = await db;
        const ocorrenciasDB = await OcorrenciaRepository.buscarTodas(database);
        const lojasDB = await LojaRepository.buscarTodas(database);
        const avataresDB = await AvatarRepository.buscarTodos(database);
        let moedasDB = await MoedaRepository.buscarDisponiveis(database);

        //Se nenhuma moeda, porem com localizacao
        // gerar uma quantia exata de moedas no mapa

        if (moedasDB.length === 0 && currentLocation) {
          const novasMoedas: Moeda[] = Array.from({ length: 10 }).map(() => {
            //Deslocamento
            const offsetLat = (Math.random() - 0.5) * 0.004;
            const offsetLng = (Math.random() - 0.5) * 0.004;

            return {
              id: Math.random().toString(36).substring(2, 9),
              valor: VALOR_PADRAO_MOEDA,
              coletada: false,
              latitude: currentLocation.latitude + offsetLat,
              longitude: currentLocation.longitude + offsetLng,
            };
          });
          await MoedaRepository.criarEmLote(database, novasMoedas);
          moedasDB = novasMoedas;
        }

        setOcorrencias(ocorrenciasDB);
        setLojas(lojasDB);
        setAvatares(avataresDB);
        setMoedas(moedasDB);
      };
      carregarMarcadores();
    }
  }, [tabAtiva, location]);

  //Sistema de gamificação (Logica de moedas)
  useEffect(() => {
    if (!currentLocation) return;

    //Evitar spam de verificação de spawn
    const agora = Date.now();
    if (agora - timerGamificacao.current < 1000) return;

    timerGamificacao.current = agora;
    isProcessingGamificacao.current = true;

    //Verifica distancia de moedas e remove do mapa localmente

    const verificarColetas = async () => {
      try {
        let moedasRestantes = [...moedas];
        let estadoAlterado = false;
        const database = await db;

        //Sensor de Ocorrencias Proximas - VALIDACAO
        let alertaEncontrado: Ocorrencia | null = null;

        for (const oc of ocorrencias) {
          if (ocorrenciasValidadas.current.has(oc.id)) continue;

          const dist = calcularDistancia(
            currentLocation.latitude,
            currentLocation.longitude,
            oc.latitude,
            oc.longitude,
          );

          if (dist <= 30) {
            alertaEncontrado = oc;
            break;
          }
        }

        if (alertaEncontrado?.id !== ocorrenciaProxima?.id) {
          setOcorrenciaProxima(alertaEncontrado);
        }

        if (modoVisualizacao === ModoVisualizacao.OFF) return;

        for (const moeda of moedas) {
          const dist = calcularDistancia(
            currentLocation.latitude,
            currentLocation.longitude,
            moeda.latitude,
            moeda.longitude,
          );

          if (dist <= RAIO_COLETA_MOEDA_METROS) {
            await MoedaRepository.marcarComoColetada(database, moeda.id);
            await creditar(moeda.valor);
            // mesmo reclamando que o await não faz sentido
            //é o unico jeito que não ter problemas de sincronização com o db

            moedasRestantes = moedasRestantes.filter((m) => m.id !== moeda.id);
            estadoAlterado = true;
          } else if (dist > 250) {
            //remove moeda se muito longe
            await MoedaRepository.deletar(database, moeda.id);
            moedasRestantes = moedasRestantes.filter((m) => m.id !== moeda.id);
            estadoAlterado = true;
          }
        }

        //Spawn dinamico
        const novasMoedas: Moeda[] = [];
        let qtdAtual = moedasRestantes.length;

        while (qtdAtual < 5) {
          const offsetLat = (Math.random() - 0.5) * 0.004;
          const offsetLng = (Math.random() - 0.5) * 0.004;

          novasMoedas.push({
            id: Math.random().toString(36).substring(2, 9),
            valor: VALOR_PADRAO_MOEDA,
            coletada: false,
            latitude: currentLocation.latitude + offsetLat,
            longitude: currentLocation.longitude + offsetLng,
          });
          qtdAtual++;
        }

        if (qtdAtual >= 5 && qtdAtual < 10) {
          if (Math.random() <= 0.3) {
            const offsetLat = (Math.random() - 0.5) * 0.004;
            const offsetLng = (Math.random() - 0.5) * 0.004;

            novasMoedas.push({
              id: Math.random().toString(36).substring(2, 9),
              valor: VALOR_PADRAO_MOEDA,
              coletada: false,
              latitude: currentLocation.latitude + offsetLat,
              longitude: currentLocation.longitude + offsetLng,
            });
          }
        }

        if (novasMoedas.length > 0) {
          await MoedaRepository.criarEmLote(database, novasMoedas);
          moedasRestantes = [...moedasRestantes, ...novasMoedas];
          estadoAlterado = true;
        }

        if (estadoAlterado) setMoedas(moedasRestantes);
      } catch (e) {
        console.error('Erro na gamificação:', e);
      } finally {
        isProcessingGamificacao.current = false;
      }
    };
    verificarColetas();
  }, [
    currentLocation?.latitude,
    currentLocation?.longitude,
    moedas,
    ocorrencias,
    modoVisualizacao,
  ]);

  //Cores dos marcadores baseado por ocorrencia
  const getCorOcorrencia = (tipo: TipoOcorrencia) => {
    switch (tipo) {
      case TipoOcorrencia.ARVORE_CAIDA:
        return 'green';
      case TipoOcorrencia.BURACO:
        return 'blue';
      case TipoOcorrencia.PEDESTRE_MACHUCADO:
        return 'orange';
      case TipoOcorrencia.RADAR:
        return 'yellow';
      case TipoOcorrencia.ZONA_PERIGO:
        return 'red';
      default:
        return 'red';
    }
  };

  //Deletar todo banco de dados local
  const limparBancodeDados = async () => {
    const database = await db;

    try {
      await database.execAsync(
        `
          DELETE FROM Ocorrencia;
          DELETE FROM Loja;
          DELETE FROM Moeda;
          DELETE FROM Transacao;
          UPDATE Carteira SET saldo = 0;
        `,
      );

      setOcorrencias([]);
      setLojas([]);
      setMoedas([]);

      if (zerarSaldo) zerarSaldo();

      alert('Base de dados limpa com sucesso.');
    } catch (e) {
      console.error('Erro ao limpar banco:', e);
    }
  };

  return (
    <View style={styles.container}>
      <MapView
        style={StyleSheet.absoluteFill}
        ref={mapRef}
        provider={PROVIDER_GOOGLE}
        initialRegion={initialRegion}
        showsUserLocation={!isEnabledDevMode}
        showsCompass={false}
        showsMyLocationButton={false}
        //TODO: angulo da camera
        customMapStyle={modoVisualizacao === ModoVisualizacao.ON ? MAPA_ON_ESTILO : []}
      >
        {/*Marcador Dev*/}
        {isEnabledDevMode && currentLocation && (
          <Marker
            key={`player-${usuarioAtivo?.avatarId || 'default'}`}
            coordinate={currentLocation}
            anchor={{ x: 0.5, y: 0.5 }}
          >
            {/*Nucleo*/}
            <View style={styles.avatarContainer}>
              <Text style={styles.avatarMarketText}>{avatarEquipado?.imagem || '👦'}</Text>
            </View>
          </Marker>
        )}

        {/*Renderizar ocorrencias*/}
        {ocorrencias.map((oc) => (
          <Marker
            key={oc.id}
            coordinate={{ latitude: oc.latitude, longitude: oc.longitude }}
            title={oc.tipo}
            pinColor={getCorOcorrencia(oc.tipo)}
          />
        ))}

        {/*Renderizar lojas*/}
        {modoVisualizacao === ModoVisualizacao.ON &&
          lojas.map((lj) => (
            <Marker
              key={lj.id}
              coordinate={{ latitude: lj.latitude, longitude: lj.longitude }}
              title={lj.nome}
              description={lj.categoria}
              pinColor="cyan"
            />
          ))}

        {/*Renderizar moedas*/}
        {modoVisualizacao === ModoVisualizacao.ON &&
          moedas.map((moeda) => (
            <Marker
              key={moeda.id}
              coordinate={{ latitude: moeda.latitude, longitude: moeda.longitude }}
              title="Moeda"
              description={`+${moeda.valor} moedas`}
            >
              <View style={styles.moedaIcon}>
                <Text style={styles.moedaText}>🪙</Text>
              </View>
            </Marker>
          ))}
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

      {/*Alerta de validacao de ocorrencia*/}
      {ocorrenciaProxima && (
        <View style={styles.validacaoContainer}>
          <Text style={styles.validacaoTitle}>Atenção</Text>
          <Text style={styles.validacaoText}>
            Um(a) {ocorrenciaProxima.tipo.replace('_', ' ').toLowerCase()} foi reportado(a) aqui.
            Ainda existe?
          </Text>
          <View style={styles.validacaoRow}>
            <TouchableOpacity
              style={[styles.validacaoBtn, { backgroundColor: 'green' }]}
              onPress={() => responderValidacao('SIM')}
            >
              <Text style={styles.validacaoBtnText}>Sim</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.validacaoBtn, { backgroundColor: 'red' }]}
              onPress={() => responderValidacao('NAO')}
            >
              <Text style={styles.validacaoBtnText}>Não</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/*Botoes Navegacao*/}
      <View style={styles.bottomNavContainer}>
        <View style={styles.bottomNavBar}>
          {/*Inicio mapa*/}
          <TouchableOpacity style={styles.navItem} onPress={fecharTabs} activeOpacity={0.7}>
            <Lucide name="home" size={24} color={tabAtiva === 'NENHUM' ? '#0d9488' : '#64748b'} />
            <Text style={[styles.navText, tabAtiva === 'NENHUM' && styles.navTextActive]}>
              Início
            </Text>
          </TouchableOpacity>

          {/*Reportar Ocorrencia*/}
          <TouchableOpacity
            style={styles.navItem}
            onPress={() => {
              if (currentLocation) setCoordenadaFoco(currentLocation);
              abrirTab('OCORRENCIA');
            }}
            activeOpacity={0.7}
          >
            <Lucide
              name="message-circle-warning"
              size={24}
              color={tabAtiva === 'OCORRENCIA' ? '#0d9488' : '#64748b'}
            />
            <Text style={[styles.navText, tabAtiva === 'OCORRENCIA' && styles.navTextActive]}>
              Reportar
            </Text>
          </TouchableOpacity>

          {/*Botão central (+)*/}
          <View style={styles.plusButtonWrapper}>
            <TouchableOpacity style={styles.plusButton} onPress={() => {}} activeOpacity={0.85}>
              <Lucide name="plus" size={32} color={'white'} />
            </TouchableOpacity>
          </View>

          {/*Registrar (estabelecimento)*/}
          <TouchableOpacity
            style={styles.navItem}
            onPress={() => {
              if (currentLocation) setCoordenadaFoco(currentLocation);
              abrirTab('LOJA');
            }}
            activeOpacity={0.7}
          >
            <Lucide name="store" size={24} color={tabAtiva === 'LOJA' ? '#0d9488' : '#64748b'} />
            <Text style={[styles.navText, tabAtiva === 'LOJA' && styles.navTextActive]}>
              Registrar
            </Text>
          </TouchableOpacity>

          {/*Perfil*/}
          <TouchableOpacity
            style={styles.navItem}
            onPress={() => {
              abrirTab('CARTEIRA');
            }}
            activeOpacity={0.7}
          >
            <Lucide
              name="laugh"
              size={24}
              color={tabAtiva === 'CARTEIRA' ? '#0d9488' : '#64748b'}
            />
            <Text style={[styles.navText, tabAtiva === 'CARTEIRA' && styles.navTextActive]}>
              Perfil
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/*D-PAD DEVELOPER*/}
      {isEnabledDevMode && tabAtiva === 'NENHUM' && (
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

      {/*BOTAO LIMPAR DB DEVELOPER*/}
      {isEnabledDevMode && tabAtiva === 'NENHUM' && (
        <TouchableOpacity style={styles.deleteDb} onPress={limparBancodeDados}>
          <Text style={styles.deleteDbText}>Limpar DB</Text>
        </TouchableOpacity>
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
  bottomNavContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 10,
  },
  bottomNavBar: {
    flexDirection: 'row',
    backgroundColor: 'white',
    height: 76,
    paddingBottom: 12,
    paddingHorizontal: 10,
    alignItems: 'center',
    justifyContent: 'space-around',
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
    elevation: 16,
    shadowColor: 'black',
    shadowOffset: { width: 0, height: -4 },
    shadowRadius: 8,
  },
  navItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  navText: {
    fontSize: 12,
    color: '$64748b',
    fontWeight: '500',
  },
  navTextActive: {
    color: '0d9488',
    fontWeight: '700',
  },
  plusButtonWrapper: {
    width: 72,
    alignItems: 'center',
    justifyContent: 'center',
  },
  plusButton: {
    top: -18,
    width: 58,
    height: 58,
    borderRadius: 20,
    backgroundColor: '#ef6c35',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 4,
    borderColor: 'white',
    elevation: 8,
    shadowColor: '#ef6c35',
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 6,
  },
  menuButton: {
    backgroundColor: '#0f1f7a',
    paddingVertical: 14,
    paddingHorizontal: 36,
    borderRadius: 30,
    elevation: 8,
    shadowColor: 'black',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
  },
  menuButtonText: {
    fontSize: 18,
    color: 'white',
    fontWeight: 'bold',
  },
  avatarContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 4,
  },
  avatarMarketText: {
    fontSize: 32,
    textAlign: 'center',
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
  deleteDb: {
    position: 'absolute',
    top: 130,
    left: 20,
    backgroundColor: 'red',
    padding: 10,
    borderRadius: 10,
    zIndex: 10,
  },
  deleteDbText: {
    color: 'white',
    fontWeight: 'bold',
  },
  moedaIcon: {
    backgroundColor: 'gold',
    padding: 5,
    borderRadius: 15,
    borderWidth: 2,
    borderColor: '#d97706',
  },
  moedaText: {
    fontWeight: 'bold',
    fontSize: 12,
  },
  validacaoContainer: {
    position: 'absolute',
    top: 130,
    left: 20,
    right: 20,
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 15,
    elevation: 10,
    shadowColor: 'black',
    shadowOpacity: 0.3,
    shadowRadius: 5,
    zIndex: 20,
    borderLeftWidth: 5,
    borderLeftColor: 'red',
  },
  validacaoTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
    color: '#333',
  },
  validacaoText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 15,
  },
  validacaoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
  },
  validacaoBtn: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  validacaoBtnText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
});
