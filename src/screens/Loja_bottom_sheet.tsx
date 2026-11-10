import {
  COR_BRANCO,
  COR_CINZA,
  COR_DESABILITADO,
  COR_PRETO,
  COR_PRIMARIA,
  COR_PRIMARIA_ESCURO,
  TEMA_BORDAS_COR_CLARO,
  TEMA_BORDAS_COR_ESCURO,
  TEMA_BORDAS_COR_SECUNDARIA_ESCURO,
  TEMA_FUNDO_CLARO,
  TEMA_FUNDO_ESCURO,
  TEMA_FUNDO_SECUNDARIO_ESCURO,
  TEMA_TEXTO_CLARO,
} from '@/constants/cores';
import { db } from '@/database';
import { LojaRepository } from '@/database/repositories';
import { useLocation, useMap, useUI, useWallet } from '@/hooks';
import { BottomSheetBackdrop, BottomSheetModal, BottomSheetView } from '@gorhom/bottom-sheet';
import { useEffect, useRef, useState } from 'react';
import { Alert, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

export function LojaBottomSheet() {
  const bottomSheetref = useRef<BottomSheetModal>(null);
  const isMountedRef = useRef(false);

  const { tabAtiva, fecharTabs } = useUI();

  const [nomeLoja, setNomeLoja] = useState('');
  const [categoria, setCategoria] = useState('');

  const { location } = useLocation();
  const { creditar } = useWallet();

  const { coordenadaFoco, tema } = useMap();

  const isDark = tema === 'NOITE';

  useEffect(() => {
    if (tabAtiva === 'LOJA') {
      isMountedRef.current = true;
      bottomSheetref.current?.present();
    } else if (isMountedRef.current) {
      isMountedRef.current = false;
      bottomSheetref.current?.dismiss();
      setNomeLoja('');
      setCategoria('');
    }
  }, [tabAtiva]);

  const registrarLoja = async () => {
    if (!nomeLoja || !categoria) return;

    if (!coordenadaFoco) {
      Alert.alert('Aviso', 'Aguardando sinal de GPS...');
      return;
    }

    const database = await db;
    const novaLoja = {
      id: Math.random().toString(36).substring(2, 9),
      nome: nomeLoja,
      categoria: categoria,
      latitude: coordenadaFoco.latitude,
      longitude: coordenadaFoco.longitude,
    };

    const sucesso = await LojaRepository.criar(database, novaLoja);

    if (sucesso) {
      creditar(100);
      Alert.alert('Sucesso', 'Estabelecimento registrado. Você ganhou +100 moedas.');
    } else {
      Alert.alert('Erro', 'Falha ao registrar estabelecimento.');
    }

    fecharTabs();
  };

  const categorias = ['Alimentação', 'Mercado', 'Serviços', 'Saúde', 'Shopping'];

  return (
    <BottomSheetModal
      ref={bottomSheetref}
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
        <Text style={[styles.title, isDark && styles.textDark]}>Registrar comércio</Text>
        <Text style={[styles.description, isDark && styles.textSubDark]}>
          Adicione um estabelecimento util ao mapa da comunidade.
        </Text>

        <TextInput
          style={[styles.input, isDark && styles.inputDark]}
          placeholder="Nome do estabelecimento"
          placeholderTextColor={isDark ? TEMA_BORDAS_COR_ESCURO : TEMA_BORDAS_COR_CLARO}
          value={nomeLoja}
          onChangeText={setNomeLoja}
          maxLength={40}
        />

        <Text style={[styles.label, isDark && styles.textDark]}>Categoria:</Text>

        {/*LISTA CATEGORIAS*/}
        <View style={styles.categoryContainer}>
          {categorias.map((cat) => (
            <TouchableOpacity
              key={cat}
              style={[
                styles.categoryBadge,
                isDark && styles.categoryBadgeDark,
                categoria === cat &&
                  (isDark ? styles.categoryBadgeSelectedDark : styles.categoryBadgeSelected),
              ]}
              onPress={() => setCategoria(cat)}
            >
              <Text
                style={[
                  styles.categoryText,
                  isDark && styles.categoryTextDark,
                  categoria === cat &&
                    (isDark ? styles.categoryTextSelectedDark : styles.categoryTextSelected),
                ]}
              >
                {cat}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/*BOTAO CONFIRMAR*/}
        <TouchableOpacity
          style={[styles.confirmButton, (!nomeLoja || !categoria) && styles.confirmButtonDisabled]}
          onPress={registrarLoja}
          disabled={!nomeLoja || !categoria}
        >
          <Text style={styles.confirmText}>Registrar neste local</Text>
        </TouchableOpacity>
      </BottomSheetView>
    </BottomSheetModal>
  );
}

const styles = StyleSheet.create({
  contentContainer: {
    flex: 1,
    padding: 24,
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
  input: {
    backgroundColor: COR_BRANCO,
    borderWidth: 1,
    borderColor: COR_PRETO,
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    marginBottom: 20,
    color: COR_PRETO,
  },
  label: {
    fontSize: 14,
    fontWeight: 'bold',
    color: COR_PRETO,
    marginBottom: 10,
  },
  categoryContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 24,
  },
  categoryBadge: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'white',
    backgroundColor: '#fff',
  },
  categoryBadgeSelected: {
    borderColor: COR_PRIMARIA,
    backgroundColor: '#e6f7f4',
  },
  categoryText: {
    color: COR_CINZA,
    fontWeight: '600',
  },
  categoryTextSelected: {
    color: COR_PRIMARIA_ESCURO,
  },
  confirmButton: {
    marginTop: 'auto',
    backgroundColor: COR_PRIMARIA,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  confirmButtonDisabled: {
    backgroundColor: COR_DESABILITADO,
  },
  confirmText: {
    color: COR_BRANCO,
    fontWeight: 'bold',
    fontSize: 16,
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
  inputDark: {
    backgroundColor: COR_PRETO,
    borderColor: TEMA_FUNDO_SECUNDARIO_ESCURO,
    color: COR_BRANCO,
  },
  categoryBadgeDark: {
    backgroundColor: TEMA_FUNDO_SECUNDARIO_ESCURO,
    borderColor: TEMA_BORDAS_COR_SECUNDARIA_ESCURO,
  },
  categoryBadgeSelectedDark: {
    borderColor: '#2dd4bf',
    backgroundColor: 'rgba(45, 212, 191, 0.15)',
  },
  categoryTextDark: {
    color: TEMA_BORDAS_COR_ESCURO,
  },
  categoryTextSelectedDark: {
    color: '#2dd4bf',
  },
});
