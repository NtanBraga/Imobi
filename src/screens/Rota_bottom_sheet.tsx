import { buscarCoordenadasLugar, buscarSugestaoLugar, SugestaoLugar } from '@/components/path';
import {
  COR_CINZA,
  COR_DESTAQUE,
  COR_DESTAQUE_ESCURO,
  COR_PRETO,
  COR_TEXTO_ESCURO,
  TEMA_BORDAS_COR_CLARO,
  TEMA_BORDAS_COR_ESCURO,
  TEMA_FUNDO_CLARO,
  TEMA_FUNDO_ESCURO,
  TEMA_FUNDO_SECUNDARIO_ESCURO,
  TEMA_TEXTO_CLARO,
} from '@/constants/cores';
import { useMap, useUI } from '@/hooks';
import {
  BottomSheetBackdrop,
  BottomSheetFlatList,
  BottomSheetModal,
  BottomSheetView,
} from '@gorhom/bottom-sheet';
import { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, TextInput, TouchableOpacity } from 'react-native';

export function RotaButtomSheet() {
  const bottomSheetRef = useRef<BottomSheetModal>(null);
  const isMountedRef = useRef(false);

  const { tabAtiva, fecharTabs } = useUI();
  const { tema, setDestino } = useMap();

  const [busca, setBusca] = useState('');
  const [sugestoes, setSugestoes] = useState<SugestaoLugar[]>([]);
  const [carregando, setCarregando] = useState(false);

  const isDark = tema === 'NOITE';

  //Abertura e fechamento
  useEffect(() => {
    if (tabAtiva === 'ROTA') {
      isMountedRef.current = true;
      bottomSheetRef.current?.present();
    } else if (isMountedRef.current) {
      isMountedRef.current = false;
      bottomSheetRef.current?.dismiss();
      setBusca('');
      setSugestoes([]);
    }
  }, [tabAtiva]);

  useEffect(() => {
    if (busca.trim().length < 3) {
      return;
    }

    const timer = setTimeout(async () => {
      setCarregando(true);
      const resultados = await buscarSugestaoLugar(busca);
      setSugestoes(resultados);
      setCarregando(false);
    }, 400);
    return () => clearTimeout(timer);
  }, [busca]);

  const selecionarDestino = async (placeId: string) => {
    setCarregando(true);
    const coordenada = await buscarCoordenadasLugar(placeId);
    setCarregando(false);

    if (coordenada) {
      setDestino(coordenada);
      fecharTabs();
    }
  };

  return (
    <BottomSheetModal
      ref={bottomSheetRef}
      index={0}
      snapPoints={['75%']}
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
      keyboardBehavior="interactive"
      keyboardBlurBehavior="restore"
    >
      <BottomSheetView style={[styles.contentContainer, isDark && styles.contentContainerDark]}>
        <Text style={[styles.title, isDark && styles.textDark]}>Para onde você vai?</Text>
        <Text style={[styles.description, isDark && styles.textSubDark]}>
          Digite o endereço ou nome do local
        </Text>

        <TextInput
          style={[styles.input, isDark && styles.inputDark]}
          placeholder="Buscar destino..."
          placeholderTextColor={isDark ? TEMA_BORDAS_COR_ESCURO : TEMA_BORDAS_COR_CLARO}
          value={busca}
          onChangeText={setBusca}
          autoCorrect={false}
        />

        {carregando && (
          <ActivityIndicator
            size="small"
            color={isDark ? COR_DESTAQUE_ESCURO : COR_DESTAQUE}
            style={{ marginVertical: 10 }}
          />
        )}

        <BottomSheetFlatList
          data={sugestoes}
          keyExtractor={(item) => item.placeId}
          keyboardShouldPersistTaps="handled"
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[styles.suggestionRow, isDark && styles.suggestionRowDark]}
              onPress={() => selecionarDestino(item.placeId)}
              activeOpacity={0.7}
            >
              <Text style={[styles.suggestionTitle, isDark && styles.textDark]}>{item.titulo}</Text>
              {!!item.subtitulo && (
                <Text style={[styles.suggestionSub, isDark && styles.textSubDark]}>
                  {item.subtitulo}
                </Text>
              )}
            </TouchableOpacity>
          )}
        />
      </BottomSheetView>
    </BottomSheetModal>
  );
}

const styles = StyleSheet.create({
  contentContainer: {
    flex: 1,
    padding: 24,
  },
  contentContainerDark: {
    backgroundColor: TEMA_FUNDO_ESCURO,
  },
  input: {
    height: 56,
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: 16,
    backgroundColor: TEMA_TEXTO_CLARO,
    color: COR_TEXTO_ESCURO,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    marginBottom: 12,
  },
  inputDark: {
    backgroundColor: '#0f172a',
    color: TEMA_TEXTO_CLARO,
    borderColor: TEMA_FUNDO_SECUNDARIO_ESCURO,
  },
  title: {
    fontSize: 25,
    fontWeight: 'bold',
    color: COR_PRETO,
    marginBottom: 8,
  },
  description: {
    fontSize: 14,
    color: COR_CINZA,
    marginBottom: 20,
  },
  textDark: {
    color: TEMA_TEXTO_CLARO,
  },
  textSubDark: {
    color: TEMA_BORDAS_COR_ESCURO,
  },
  suggestionRow: {
    paddingVertical: 14,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderBottomColor: TEMA_TEXTO_CLARO,
  },
  suggestionRowDark: {
    borderBottomColor: TEMA_FUNDO_SECUNDARIO_ESCURO,
  },
  suggestionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: TEMA_FUNDO_ESCURO,
  },
  suggestionSub: {
    fontSize: 13,
    color: TEMA_BORDAS_COR_CLARO,
    marginTop: 2,
  },
});
