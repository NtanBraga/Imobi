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

  const { coordenadaFoco } = useMap();

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
      snapPoints={['55%']}
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
      handleIndicatorStyle={{ backgroundColor: 'black', width: 40 }}
      backgroundStyle={{ borderRadius: 24 }}
    >
      <BottomSheetView style={styles.contentContainer}>
        <Text style={styles.title}>Registrar comércio</Text>
        <Text style={styles.description}>
          Adicione um estabelecimento util ao mapa da comunidade.
        </Text>

        <TextInput
          style={styles.input}
          placeholder="Nome do estabelecimento"
          placeholderTextColor={'gray'}
          value={nomeLoja}
          onChangeText={setNomeLoja}
          maxLength={40}
        />

        <Text style={styles.label}>Categoria:</Text>

        {/*LISTA CATEGORIAS*/}
        <View style={styles.categoryContainer}>
          {categorias.map((cat) => (
            <TouchableOpacity
              key={cat}
              style={[styles.categoryBadge, categoria === cat && styles.categoryBadgeSelected]}
              onPress={() => setCategoria(cat)}
            >
              <Text style={[styles.categoryText, categoria === cat && styles.categoryTextSelected]}>
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
    color: 'black',
    marginBottom: 8,
  },
  description: {
    fontSize: 14,
    color: 'gray',
    marginBottom: 20,
  },
  input: {
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: 'black',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    marginBottom: 20,
    color: '#333',
  },
  label: {
    fontSize: 14,
    fontWeight: 'bold',
    color: 'black',
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
    borderColor: '#2A9D8F',
    backgroundColor: '#e6f7f4',
  },
  categoryText: {
    color: 'gray',
    fontWeight: '600',
  },
  categoryTextSelected: {
    color: '#0f7a65',
  },
  confirmButton: {
    marginTop: 'auto',
    backgroundColor: '#2a9d8f',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  confirmButtonDisabled: {
    backgroundColor: '#ccc',
  },
  confirmText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
});
