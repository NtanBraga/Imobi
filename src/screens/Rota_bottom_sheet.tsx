import { buscarCoordenadasLugar, buscarSugestaoLugar, SugestaoLugar } from '@/components/path';
import { TEMA_BORDAS_COR_CLARO, TEMA_BORDAS_COR_ESCURO } from '@/constants/cores';
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
      backgroundStyle={{ borderRadius: 24, backgroundColor: isDark ? '#1e293b' : 'white' }}
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
          placeholderTextColor={isDark ? '#94a3b8' : 'gray'}
          value={busca}
          onChangeText={setBusca}
          autoCorrect={false}
        />

        {carregando && (
          <ActivityIndicator
            size="small"
            color={isDark ? '#38bdf8' : '#0d9488'}
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
    backgroundColor: '#1e293b',
  },
  input: {
    height: 56,
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: 16,
    backgroundColor: '#f1f5f9',
    color: '#333',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    marginBottom: 12,
  },
  inputDark: {
    backgroundColor: '#0f172a',
    color: '#f8fafc',
    borderColor: '#334155',
  },
  title: {
    fontSize: 25,
    fontWeight: 'bold',
    color: 'black',
    marginBottom: 8,
  },
  description: {
    fontSize: 14,
    color: 'gray',
    marginBottom: 20,
  },
  textDark: {
    color: '#f1f5f9',
  },
  textSubDark: {
    color: '#94a3b8',
  },
  suggestionRow: {
    paddingVertical: 14,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  suggestionRowDark: {
    borderBottomColor: '#334155',
  },
  suggestionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
  },
  suggestionSub: {
    fontSize: 13,
    color: '#64748b',
    marginTop: 2,
  },
});
