import { calcularDistancia } from '@/components/distancia';
import { calcularRotaApi } from '@/components/path';
import {
  COR_BRANCO,
  COR_DESTAQUE,
  COR_PRETO,
  COR_ROTA_CLARO,
  COR_ROTA_ESCURO,
  COR_ROTA_PEDESTRE_CLARO,
  COR_ROTA_PEDESTRE_ESCURO,
  COR_TEXTO_ESCURO,
  TEMA_BORDAS_COR_CLARO,
  TEMA_BORDAS_COR_ESCURO,
  TEMA_FUNDO_ESCURO,
  TEMA_FUNDO_SECUNDARIO_ESCURO,
  TEMA_TEXTO_CLARO,
} from '@/constants/cores';
import { ZOOM_A_PE, ZOOM_TRANSITO } from '@/constants/mapa';
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
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Alert, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import MapView, { Marker, Polyline, PROVIDER_GOOGLE } from 'react-native-maps';

export default function Map() {
  const {
    modoLocomocao,
    setModoLocomocao,
    modoVisualizacao,
    setModoVisualizacao,
    setCoordenadaFoco,
    tema,
    setTema,
    destino,
    setDestino,
  } = useMap();
  const { location } = useLocation();
  const mapRef = useRef<MapView>(null); // Referencia para manipular a camera
  const { abrirTab, tabAtiva, fecharTabs } = useUI();

  //TEMA
  const isDark = tema === 'NOITE';

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
  const currentLocation = useMemo(
    () =>
      location
        ? {
            latitude: location.latitude + devOffset.lat,
            longitude: location.longitude + devOffset.lng,
          }
        : null,
    [location, devOffset.lat, devOffset.lng],
  );

  //Atualizar camera quando localizacao falsa/real mudar e inclinação

  const deltaZoom = modoLocomocao === ModoLocomocao.A_PE ? ZOOM_A_PE : ZOOM_TRANSITO;

  const anguloInclinado = modoVisualizacao === ModoVisualizacao.ON ? 55 : 0;

  const atualizarCamera = useCallback(() => {
    if (currentLocation && mapRef.current) {
      //Adaptado para capturar o modo gamificado (MODO ON)

      mapRef.current.animateCamera(
        {
          center: {
            longitude: currentLocation.longitude,
            latitude: currentLocation.latitude,
          },
          pitch: anguloInclinado,
          heading: 0,
          altitude: 1000,
          zoom: deltaZoom,
        },
        { duration: 800 }, // animacao
      );
    }
  }, [currentLocation, anguloInclinado, deltaZoom]);

  useEffect(() => {
    atualizarCamera();
  }, [atualizarCamera]);

  //Mock inicial ate o mapa carregar o gps
  const initialRegion = {
    latitude: -30.269359,
    longitude: -51.299773,
    latitudeDelta: 0.05,
    longitudeDelta: 0.05,
  };

  //ROTA
  const [rotasPorModo, setRotasPorModo] = useState<{
    TRANSITO: { latitude: number; longitude: number }[];
    A_PE: { latitude: number; longitude: number }[];
  }>({ TRANSITO: [], A_PE: [] });

  const ultimoDestinoRef = useRef<string | null>(null);
  const rotaEmBuscaRef = useRef<string | null>(null);
  const requisicaoRotaRef = useRef(0);
  const origemCalculadaRef = useRef<{ latitude: number; longitude: number } | null>(null);

  useEffect(() => {
    if (!destino || !currentLocation) {
      ultimoDestinoRef.current = null;
      rotaEmBuscaRef.current = null;
      origemCalculadaRef.current = null;
      requisicaoRotaRef.current += 1;

      return;
    }

    const chaveDestino = `${destino.latitude}:${destino.longitude}`;
    const chaveModo = modoLocomocao === ModoLocomocao.A_PE ? 'A_PE' : 'TRANSITO';
    const chaveRequisicao = `${chaveDestino}:${chaveModo}`;
    const mudouDestino = ultimoDestinoRef.current !== chaveDestino;

    if (!mudouDestino && rotasPorModo[chaveModo].length > 0) return;
    if (rotaEmBuscaRef.current === chaveRequisicao) return;

    rotaEmBuscaRef.current = chaveRequisicao;
    const idRequisicao = ++requisicaoRotaRef.current;

    //requisicao da rota

    const buscar = async () => {
      const modoApi = modoLocomocao === ModoLocomocao.A_PE ? 'WALK' : 'DRIVE';
      const pontos = await calcularRotaApi(currentLocation, destino, modoApi);

      if (idRequisicao !== requisicaoRotaRef.current) return;

      if (pontos.length > 0) {
        ultimoDestinoRef.current = chaveDestino;
        origemCalculadaRef.current = currentLocation;

        setRotasPorModo((prev) => ({
          ...(mudouDestino ? { TRANSITO: [], A_PE: [] } : prev),
          [chaveModo]: pontos,
        }));

        mapRef.current?.fitToCoordinates(pontos, {
          edgePadding: { top: 80, right: 40, bottom: 200, left: 40 },
          animated: true,
        });
      }
    };
    buscar();
  }, [destino, currentLocation, rotasPorModo, modoLocomocao]);

  const rotaAtiva = useMemo(
    () =>
      destino && currentLocation
        ? rotasPorModo[modoLocomocao === ModoLocomocao.A_PE ? 'A_PE' : 'TRANSITO']
        : [],
    [destino, currentLocation, rotasPorModo, modoLocomocao],
  );

  //rota dinamica (separaracao de rua e fora da rua)
  const statusNavegacao = useMemo(() => {
    if (!currentLocation || !destino || rotaAtiva.length === 0)
      return { trechosPontilhados: [], rotaRua: [], menorDistancia: 0 };

    const distDiretaDestino = calcularDistancia(
      currentLocation.latitude,
      currentLocation.longitude,
      destino.latitude,
      destino.longitude,
    );

    let melhorSegmento = 0;
    let menorDistancia = Infinity;
    let pontoNaRua = rotaAtiva[0];

    if (rotaAtiva.length === 1) {
      menorDistancia = calcularDistancia(
        currentLocation.latitude,
        currentLocation.longitude,
        rotaAtiva[0].latitude,
        rotaAtiva[0].longitude,
      );
    } else {
      //Projetar posicao do usuario em segmento A, B
      for (let i = 0; i < rotaAtiva.length - 1; i++) {
        const A = rotaAtiva[i];
        const B = rotaAtiva[i + 1];

        const dx = B.longitude - A.longitude;
        const dy = B.latitude - A.latitude;
        const lenSq = dx * dx + dy * dy;

        let t = 0;

        if (lenSq > 0) {
          t =
            ((currentLocation.longitude - A.longitude) * dx +
              (currentLocation.latitude - A.latitude) * dy) /
            lenSq;
          t = Math.max(0, Math.min(1, t));
        }
        const proj = {
          latitude: A.latitude + t * dy,
          longitude: A.longitude + t * dx,
        };

        const dist = calcularDistancia(
          currentLocation.latitude,
          currentLocation.longitude,
          proj.latitude,
          proj.longitude,
        );
        if (dist < menorDistancia) {
          menorDistancia = dist;
          melhorSegmento = i;
          pontoNaRua = proj;
        }
      }
    }

    const pontosRestantes = rotaAtiva.slice(melhorSegmento + 1);
    const rotaRua = [pontoNaRua, ...pontosRestantes];

    //Modo Transito, a linha se projeta na rua
    if (modoLocomocao === ModoLocomocao.TRANSITO) {
      return { rotaRua, trechosPontilhados: [], menorDistancia };
    }

    //Modo Pedestre
    //ver se destino esta mais perto que a propria rua ou a menos de 25m
    if (distDiretaDestino <= menorDistancia || distDiretaDestino <= 25) {
      return {
        rotaRua: [],
        trechosPontilhados: [[currentLocation, destino]],
        menorDistancia,
      };
    }

    const trechosPontilhados: { latitude: number; longitude: number }[][] = [];

    //Se trecho fora da rua inicial
    if (menorDistancia > 3) {
      trechosPontilhados.push([currentLocation, pontoNaRua]);
    }

    //trecho fora da rua final
    const ultimoPontoRua = rotaAtiva[rotaAtiva.length - 1];
    const distFimRuaAoDestino = calcularDistancia(
      ultimoPontoRua.latitude,
      ultimoPontoRua.longitude,
      destino.latitude,
      destino.longitude,
    );

    if (distFimRuaAoDestino > 3) {
      trechosPontilhados.push([ultimoPontoRua, destino]);
    }

    return { rotaRua, trechosPontilhados, menorDistancia };
  }, [currentLocation, destino, rotaAtiva, modoLocomocao]);

  const { rotaRua, trechosPontilhados } = statusNavegacao;

  //Buscar dados no SQLite quando nenhuma tab ativa (para marcadores)
  const [ocorrencias, setOcorrencias] = useState<Ocorrencia[]>([]);
  const [lojas, setLojas] = useState<Loja[]>([]);
  const { creditar, zerarSaldo } = useWallet();
  const [moedas, setMoedas] = useState<Moeda[]>([]);
  const { usuarioAtivo } = useUser();
  const [avatares, setAvatares] = useState<Avatar[]>([]);

  //Identificar avatar equipado no momento
  const avatarEquipado = avatares.find((av) => av.id === usuarioAtivo?.avatarId);

  //Cancelar rota
  useEffect(() => {
    if (!destino || !currentLocation) return;

    const distDestino = calcularDistancia(
      currentLocation.latitude,
      currentLocation.longitude,
      destino.latitude,
      destino.longitude,
    );

    //Se chegou, tolerancia de 5 metros
    if (distDestino <= 5) {
      stopMoving();
      ultimoDestinoRef.current = null;
      rotaEmBuscaRef.current = null;
      origemCalculadaRef.current = null;
      requisicaoRotaRef.current += 1;
      setDestino(null);

      Alert.alert('Chegou!', 'Você chegou ao seu destino');
      return;
    }

    //Se desviou mais de 10 metros, e se moveu mais 5 metros do ponto inicial
    if (rotaAtiva.length > 0 && origemCalculadaRef.current && ultimoDestinoRef.current) {
      //distancia que o usuario ja tinha da rua quando a rota foi criada
      const folgaInicialForaDaRua = calcularDistancia(
        origemCalculadaRef.current.latitude,
        origemCalculadaRef.current.longitude,
        rotaAtiva[0].latitude,
        rotaAtiva[0].longitude,
      );

      const margemTolerancia = modoLocomocao === ModoLocomocao.A_PE ? 25 : 15;
      const limiteDesvio = Math.max(margemTolerancia, folgaInicialForaDaRua + 15);

      const distDaOrigem = calcularDistancia(
        currentLocation.latitude,
        currentLocation.longitude,
        origemCalculadaRef.current.latitude,
        origemCalculadaRef.current.longitude,
      );

      if (statusNavegacao.menorDistancia > limiteDesvio && distDaOrigem > 15) {
        ultimoDestinoRef.current = null;
        rotaEmBuscaRef.current = null;
        requisicaoRotaRef.current += 1;
      }
    }
  }, [currentLocation, destino, rotaAtiva.length, statusNavegacao.menorDistancia, setDestino]);

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

      if (resposta === 'NAO') {
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
  }, [tabAtiva, currentLocation]);

  //Sistema de gamificação (Logica de moedas e ocorrencias)
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
  }, [currentLocation, moedas, ocorrencias, modoVisualizacao, ocorrenciaProxima?.id, creditar]);

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
        key={`${modoVisualizacao}-${tema}`}
        style={StyleSheet.absoluteFill}
        ref={mapRef}
        provider={PROVIDER_GOOGLE}
        googleMapId={
          modoVisualizacao === ModoVisualizacao.ON
            ? '3873a55acf765a9ce661529d'
            : '3873a55acf765a9cacb64e78'
        }
        userInterfaceStyle={tema === 'DIA' ? 'light' : 'dark'}
        initialCamera={{
          center: currentLocation || {
            latitude: initialRegion.latitude,
            longitude: initialRegion.longitude,
          },
          pitch: anguloInclinado,
          heading: 0,
          altitude: 1000,
          zoom: deltaZoom,
        }}
        onMapReady={() => {
          setTimeout(() => {
            atualizarCamera();
          }, 250);
        }}
        onLongPress={(e) => {
          setRotasPorModo({ TRANSITO: [], A_PE: [] });
          ultimoDestinoRef.current = null;
          rotaEmBuscaRef.current = null;
          requisicaoRotaRef.current += 1;
          setDestino(e.nativeEvent.coordinate);
        }}
        showsUserLocation={!isEnabledDevMode}
        showsCompass={false}
        showsMyLocationButton={false}
        pitchEnabled={true}
        showsBuildings={modoVisualizacao === ModoVisualizacao.OFF}
      >
        {/*Renderizar Rotas na Rua*/}
        {rotaRua.length > 1 && (
          <Polyline
            coordinates={rotaRua}
            strokeWidth={5}
            strokeColor={isDark ? COR_ROTA_ESCURO : COR_ROTA_CLARO}
          />
        )}

        {/*Renderizar Trechos fora da rua*/}
        {trechosPontilhados.map((trecho, index) => (
          <Polyline
            key={`offroad-${index}`}
            coordinates={trecho}
            strokeWidth={5}
            strokeColor={isDark ? COR_ROTA_PEDESTRE_ESCURO : COR_ROTA_PEDESTRE_CLARO}
            lineDashPattern={[2, 12]}
          />
        ))}

        {/*Marcador Rota*/}
        {destino && <Marker coordinate={destino} title="Destino final" pinColor="red" />}

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
        <View style={[styles.toggleGroup, isDark && styles.toggleGroupDark]}>
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
                  isDark && styles.modeTextDark,
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
                  isDark && styles.modeTextDark,
                  modoLocomocao === ModoLocomocao.A_PE && styles.activateModeText,
                ]}
              >
                A pé
              </Text>
            </TouchableOpacity>
          </View>

          {/*Botao do tema (Dia e Noite)*/}
          <TouchableOpacity
            style={[
              styles.themeToggle,
              { backgroundColor: isDark ? COR_BRANCO : 'rgba(30, 41, 59, 0.95)' },
            ]}
            onPress={setTema}
            activeOpacity={0.7}
          >
            <Lucide
              name={isDark ? 'moon' : 'sun'}
              size={24}
              color={isDark ? COR_ROTA_ESCURO : '#f59e0b'}
            />
          </TouchableOpacity>

          {/*Alterar Modo Off e Modo On*/}
          <TouchableOpacity style={styles.gamificationToggle} onPress={setModoVisualizacao}>
            <Text
              style={[styles.gamificationToggleText, isDark && styles.gamificationToggleTextDark]}
            >
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
        <View style={[styles.bottomNavBar, isDark && styles.bottomNavBarDark]}>
          {/*Inicio mapa*/}
          <TouchableOpacity style={styles.navItem} onPress={fecharTabs} activeOpacity={0.7}>
            <Lucide
              name="home"
              size={24}
              color={
                tabAtiva === 'NENHUM'
                  ? COR_DESTAQUE
                  : isDark
                    ? TEMA_BORDAS_COR_ESCURO
                    : TEMA_BORDAS_COR_CLARO
              }
            />
            <Text
              style={[
                styles.navText,
                isDark && styles.navTextDark,
                tabAtiva === 'NENHUM' && styles.navTextActive,
              ]}
            >
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
              color={
                tabAtiva === 'OCORRENCIA'
                  ? COR_DESTAQUE
                  : isDark
                    ? TEMA_BORDAS_COR_ESCURO
                    : TEMA_BORDAS_COR_CLARO
              }
            />
            <Text
              style={[
                styles.navText,
                isDark && styles.navTextDark,
                tabAtiva === 'OCORRENCIA' && styles.navTextActive,
              ]}
            >
              Reportar
            </Text>
          </TouchableOpacity>

          {/*Botão central (+)*/}
          <View style={styles.plusButtonWrapper}>
            <TouchableOpacity
              style={styles.plusButton}
              onPress={() => abrirTab('ROTA')}
              activeOpacity={0.85}
            >
              <Lucide name="plus" size={32} color={COR_BRANCO} />
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
            <Lucide
              name="store"
              size={24}
              color={
                tabAtiva === 'LOJA'
                  ? '#0d9488'
                  : isDark
                    ? TEMA_BORDAS_COR_ESCURO
                    : TEMA_BORDAS_COR_CLARO
              }
            />
            <Text
              style={[
                styles.navText,
                isDark && styles.navTextDark,
                tabAtiva === 'LOJA' && styles.navTextActive,
              ]}
            >
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
              color={
                tabAtiva === 'CARTEIRA'
                  ? COR_DESTAQUE
                  : isDark
                    ? TEMA_BORDAS_COR_ESCURO
                    : TEMA_BORDAS_COR_CLARO
              }
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
    alignItems: 'center',
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
    color: COR_BRANCO,
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
    backgroundColor: COR_BRANCO,
    height: 76,
    paddingBottom: 12,
    paddingHorizontal: 10,
    alignItems: 'center',
    justifyContent: 'space-around',
    borderTopWidth: 1,
    borderTopColor: TEMA_TEXTO_CLARO,
    elevation: 16,
    shadowColor: COR_TEXTO_ESCURO,
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
    color: TEMA_BORDAS_COR_CLARO,
    fontWeight: '500',
  },
  navTextActive: {
    color: COR_DESTAQUE,
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
    shadowColor: COR_PRETO,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
  },
  menuButtonText: {
    fontSize: 18,
    color: COR_BRANCO,
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
    backgroundColor: COR_BRANCO,
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
    color: COR_BRANCO,
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
    backgroundColor: COR_BRANCO,
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
    color: COR_TEXTO_ESCURO,
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
  toggleGroupDark: {
    backgroundColor: 'rgba(30, 41, 59, 0.95)',
  },
  themeToggle: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 8,
    padding: 15,
    borderRadius: 10,
  },
  modeTextDark: {
    color: '#cbd5e1',
  },
  gamificationToggleTextDark: {
    color: COR_ROTA_ESCURO,
  },
  bottomNavBarDark: {
    backgroundColor: TEMA_FUNDO_ESCURO,
    borderTopColor: TEMA_FUNDO_SECUNDARIO_ESCURO,
  },
  navTextDark: {
    color: TEMA_BORDAS_COR_ESCURO,
  },
});
