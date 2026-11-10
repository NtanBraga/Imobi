import {
  COR_ARVORE_CAIDA,
  COR_BRANCO,
  COR_BURACO,
  COR_DESTAQUE,
  COR_DESTAQUE_ESCURO,
  COR_PEDESTRE_MACHUCADO,
  COR_PRETO,
  COR_PRIMARIA_ESCURO,
  COR_RADAR,
  COR_SELECAO_ESCURO,
  COR_ZONA_PERIGO,
  TEMA_BORDAS_COR_CLARO,
  TEMA_BORDAS_COR_ESCURO,
  TEMA_BORDAS_COR_SECUNDARIA_ESCURO,
  TEMA_FUNDO_CLARO,
  TEMA_FUNDO_ESCURO,
  TEMA_FUNDO_SECUNDARIO_ESCURO,
  TEMA_TEXTO_CLARO,
} from '@/constants/cores';
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
  const { coordenadaFoco, tema } = useMap();

  //Tema
  const isDark = tema === 'NOITE';

  //controlar abertura/fechamento
  useEffect(() => {
    if (tabAtiva === 'OCORRENCIA') {
      isMountedRef.current = true;
      bottomSheetRef.current?.present();
    } else if (isMountedRef.current) {
      isMountedRef.current = false;
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
      snapPoints={['70%']}
      enableDynamicSizing={false}
      onDismiss={() => {
        if (isMountedRef.current) {
          isMountedRef.current = false;
          fecharTabs();
        }
      }}
      backdropComponent={(props) => (
        <BottomSheetBackdrop {...props} disappearsOnIndex={-1} appearsOnIndex={0} opacity={0.5} />
      )}
      handleIndicatorStyle={{
        backgroundColor: isDark ? TEMA_BORDAS_COR_ESCURO : TEMA_BORDAS_COR_CLARO,
        width: 40,
      }}
      backgroundStyle={{
        borderRadius: 24,
        backgroundColor: isDark ? TEMA_FUNDO_ESCURO : TEMA_FUNDO_CLARO,
      }}
    >
      <BottomSheetView style={[styles.contentContainer, isDark && styles.contentContainerDark]}>
        <Text style={[styles.title, isDark && styles.textDark]}>Selecione um risco.</Text>

        {/*Opcao: BURACO*/}
        <TouchableOpacity
          style={[
            styles.optionRow,
            isDark && styles.optionRowDark,
            tipoSelecionado === TipoOcorrencia.BURACO &&
              (isDark ? styles.optionSelectedDark : styles.optionSelected),
          ]}
          onPress={() => setTipoSelecionado(TipoOcorrencia.BURACO)}
        >
          <View style={[styles.iconBox, { backgroundColor: COR_BURACO }]}>
            <Text style={styles.iconText}>!</Text>
          </View>

          <View>
            <Text style={[isDark && styles.textDark]}>Buraco</Text>
            <Text style={[isDark && styles.textSubDark]}>neste local</Text>
          </View>
        </TouchableOpacity>

        {/*Opcao: ARVORE CAIDA*/}
        <TouchableOpacity
          style={[
            styles.optionRow,
            isDark && styles.optionRowDark,
            tipoSelecionado === TipoOcorrencia.ARVORE_CAIDA &&
              (isDark ? styles.optionSelectedDark : styles.optionSelected),
          ]}
          onPress={() => setTipoSelecionado(TipoOcorrencia.ARVORE_CAIDA)}
        >
          <View style={[styles.iconBox, { backgroundColor: COR_ARVORE_CAIDA }]}>
            <Text style={styles.iconText}>!</Text>
          </View>

          <View>
            <Text style={[isDark && styles.textDark]}>Arvore caida</Text>
            <Text style={[isDark && styles.textSubDark]}>neste local</Text>
          </View>
        </TouchableOpacity>

        {/*Opcao: RADAR*/}
        <TouchableOpacity
          style={[
            styles.optionRow,
            isDark && styles.optionRowDark,
            tipoSelecionado === TipoOcorrencia.RADAR &&
              (isDark ? styles.optionSelectedDark : styles.optionSelected),
          ]}
          onPress={() => setTipoSelecionado(TipoOcorrencia.RADAR)}
        >
          <View style={[styles.iconBox, { backgroundColor: COR_RADAR }]}>
            <Text style={styles.iconText}>!</Text>
          </View>

          <View>
            <Text style={[isDark && styles.textDark]}>Radar</Text>
            <Text style={[isDark && styles.textSubDark]}>neste local</Text>
          </View>
        </TouchableOpacity>

        {/*Opcao: PEDESTRE MACHUCADO*/}
        <TouchableOpacity
          style={[
            styles.optionRow,
            isDark && styles.optionRowDark,
            tipoSelecionado === TipoOcorrencia.PEDESTRE_MACHUCADO &&
              (isDark ? styles.optionSelectedDark : styles.optionSelected),
          ]}
          onPress={() => setTipoSelecionado(TipoOcorrencia.PEDESTRE_MACHUCADO)}
        >
          <View style={[styles.iconBox, { backgroundColor: COR_PEDESTRE_MACHUCADO }]}>
            <Text style={styles.iconText}>!</Text>
          </View>

          <View>
            <Text style={[isDark && styles.textDark]}>Pedestre machucado</Text>
            <Text style={[isDark && styles.textSubDark]}>neste local</Text>
          </View>
        </TouchableOpacity>

        {/*Opcao: ZONA DE PERIGO TODO: SERIA MELHOR CRIAR UMA ZONA MESMO CIRCULO*/}
        <TouchableOpacity
          style={[
            styles.optionRow,
            isDark && styles.optionRowDark,
            tipoSelecionado === TipoOcorrencia.ZONA_PERIGO &&
              (isDark ? styles.optionSelectedDark : styles.optionSelected),
          ]}
          onPress={() => setTipoSelecionado(TipoOcorrencia.ZONA_PERIGO)}
        >
          <View style={[styles.iconBox, { backgroundColor: COR_ZONA_PERIGO }]}>
            <Text style={styles.iconText}>!</Text>
          </View>

          <View>
            <Text style={[isDark && styles.textDark]}>Zona de perigo</Text>
            <Text style={[isDark && styles.textSubDark]}>neste local</Text>
          </View>
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
    borderColor: COR_PRETO,
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
    color: COR_BRANCO,
    fontWeight: 'bold',
  },
  confirmButton: {
    marginTop: 'auto',
    backgroundColor: COR_PRIMARIA_ESCURO,
    padding: 14,
    borderRadius: 10,
    alignItems: 'center',
  },
  confirmButtonText: {
    color: COR_BRANCO,
    fontWeight: 'bold',
  },
  contentContainerDark: {
    backgroundColor: TEMA_FUNDO_ESCURO,
  },
  textDark: {
    color: TEMA_TEXTO_CLARO,
  },
  textSubDark: {
    color: TEMA_BORDAS_COR_ESCURO,
  },
  optionRowDark: {
    borderColor: TEMA_BORDAS_COR_SECUNDARIA_ESCURO,
    backgroundColor: TEMA_FUNDO_SECUNDARIO_ESCURO,
  },
  optionSelected: {
    borderColor: COR_DESTAQUE,
    borderWidth: 2,
    backgroundColor: 'rgba(13, 148, 136, 0.1)',
  },
  optionSelectedDark: {
    borderColor: COR_DESTAQUE_ESCURO,
    borderWidth: 2,
    backgroundColor: COR_SELECAO_ESCURO,
  },
});
