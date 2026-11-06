import { db } from '@/database';
import { OcorrenciaRepository } from '@/database/repositories';
import { useLocation, useMap, useUI, useWallet } from '@/hooks';
import { StatusOcorrencia, TipoOcorrencia } from '@/models';
import { BottomSheetBackdrop, BottomSheetModal, BottomSheetView } from '@gorhom/bottom-sheet';
import { useEffect, useRef, useState } from 'react';
import { Alert, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export function OcorrenciaBottomSheet() {
  const bottomSheetRef = useRef<BottomSheetModal>(null);
  const isMountedRef = useRef(false);
  const { tabAtiva, fecharTabs } = useUI();
  const [tipoSelecionado, setTipoSelecionado] = useState<TipoOcorrencia | null>(null);
  const { location } = useLocation();
  const { creditar } = useWallet();
  const { coordenadaFoco } = useMap();

  //controlar abertura/fechamento
  useEffect(() => {
    if (tabAtiva === 'OCORRENCIA') {
      isMountedRef.current = true;
      bottomSheetRef.current?.present();
    } else if (isMountedRef.current) {
      bottomSheetRef.current?.dismiss();
      setTipoSelecionado(null); //resetar selecao
    }
  }, [tabAtiva]);

  const confirmarReport = async () => {
    if (!tipoSelecionado) return;

    if (!coordenadaFoco) {
      Alert.alert('Aviso', 'Aguardando sinal de GPS...');
      return;
    }

    const database = await db;
    const novaOcorrencia = {
      id: Math.random().toString(36).substring(2, 9),
      tipo: tipoSelecionado,
      descricao: '', // durante o MVP ele vai ficar como opcional
      status: StatusOcorrencia.ATIVA,
      dataCriacao: new Date(),
      latitude: coordenadaFoco.latitude,
      longitude: coordenadaFoco.longitude,
    };

    const sucesso = await OcorrenciaRepository.criar(database, novaOcorrencia);
    if (sucesso) {
      creditar(50);
      Alert.alert('Sucesso', 'Ocorrência registrada. Você ganhou +50 moedas.');
    } else {
      Alert.alert('Erro', 'Falha ao registrar ocorrência.');
    }

    fecharTabs();
  };

  return (
    //BOTTOM TAB
    <BottomSheetModal
      ref={bottomSheetRef}
      index={0}
      snapPoints={['65%']}
      enableDynamicSizing={false}
      onDismiss={() => {
        isMountedRef.current = false;
        fecharTabs();
      }}
      backdropComponent={(props) => (
        <BottomSheetBackdrop {...props} disappearsOnIndex={-1} appearsOnIndex={0} opacity={0.5} />
      )}
      handleIndicatorStyle={{ backgroundColor: 'white', width: 40 }}
      backgroundStyle={{ borderRadius: 20 }}
    >
      <BottomSheetView style={styles.contentContainer}>
        <Text style={styles.title}>Selecione um risco.</Text>

        {/*Opcao: BURACO*/}
        <TouchableOpacity
          style={styles.optionRow}
          onPress={() => setTipoSelecionado(TipoOcorrencia.BURACO)}
        >
          <View style={[styles.iconBox, { backgroundColor: 'blue' }]}>
            <Text style={styles.iconText}>!</Text>
          </View>

          <View>
            <Text>Buraco</Text>
            <Text>neste local</Text>
          </View>
          <View></View>
        </TouchableOpacity>

        {/*Opcao: ARVORE CAIDA*/}
        <TouchableOpacity
          style={styles.optionRow}
          onPress={() => setTipoSelecionado(TipoOcorrencia.ARVORE_CAIDA)}
        >
          <View style={[styles.iconBox, { backgroundColor: 'green' }]}>
            <Text style={styles.iconText}>!</Text>
          </View>

          <View>
            <Text>Arvore caida</Text>
            <Text>neste local</Text>
          </View>
          <View></View>
        </TouchableOpacity>

        {/*Opcao: RADAR*/}
        <TouchableOpacity
          style={styles.optionRow}
          onPress={() => setTipoSelecionado(TipoOcorrencia.RADAR)}
        >
          <View style={[styles.iconBox, { backgroundColor: 'yellow' }]}>
            <Text style={styles.iconText}>!</Text>
          </View>

          <View>
            <Text>Radar</Text>
            <Text>neste local</Text>
          </View>
          <View></View>
        </TouchableOpacity>

        {/*Opcao: PEDESTRE MACHUCADO*/}
        <TouchableOpacity
          style={styles.optionRow}
          onPress={() => setTipoSelecionado(TipoOcorrencia.PEDESTRE_MACHUCADO)}
        >
          <View style={[styles.iconBox, { backgroundColor: 'orange' }]}>
            <Text style={styles.iconText}>!</Text>
          </View>

          <View>
            <Text>Pedestre machucado</Text>
            <Text>neste local</Text>
          </View>
          <View></View>
        </TouchableOpacity>

        {/*Opcao: ZONA DE PERIGO TODO: SERIA MELHOR CRIAR UMA ZONA MESMO CIRCULO*/}
        <TouchableOpacity
          style={styles.optionRow}
          onPress={() => setTipoSelecionado(TipoOcorrencia.ZONA_PERIGO)}
        >
          <View style={[styles.iconBox, { backgroundColor: 'red' }]}>
            <Text style={styles.iconText}>!</Text>
          </View>

          <View>
            <Text>Zona de perigo</Text>
            <Text>neste local</Text>
          </View>
          <View></View>
        </TouchableOpacity>

        {/*CONFIRMAR*/}
        <TouchableOpacity style={styles.confirmButton} onPress={confirmarReport}>
          <Text style={styles.confirmButtonText}>Confirmar local</Text>
        </TouchableOpacity>
      </BottomSheetView>
    </BottomSheetModal>
  );
}

const styles = StyleSheet.create({
  contentContainer: {
    flex: 1,
    padding: 20,
    gap: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderWidth: 1,
    borderColor: 'black',
    borderRadius: 10,
  },
  iconBox: {
    width: 40,
    height: 40,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  iconText: {
    color: 'white',
    fontWeight: 'bold',
  },
  confirmButton: {
    marginTop: 'auto',
    backgroundColor: '#0f7a65',
    padding: 14,
    borderRadius: 10,
    alignItems: 'center',
  },
  confirmButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
});
