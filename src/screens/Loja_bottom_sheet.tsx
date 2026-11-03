import { useUI } from '@/hooks';
import { BottomSheetModal, BottomSheetView } from '@gorhom/bottom-sheet';
import { useEffect, useRef, useState } from 'react';
import { Text, TextInput, TouchableOpacity, View } from 'react-native';

export function LojaBottomSheet() {
  const bottomSheetref = useRef<BottomSheetModal>(null);
  const isMountedRef = useRef(false);

  const { tabAtiva, fecharTabs } = useUI();

  const [nomeLoja, setNomeLoja] = useState('');
  const [categoria, setCategoria] = useState('');

  useEffect(() => {
    if (tabAtiva === 'LOJA') {
      isMountedRef.current = true;
      bottomSheetref.current?.present();
    } else if (isMountedRef.current) {
      bottomSheetref.current?.dismiss();
      setNomeLoja('');
      setCategoria('');
    }
  }, [tabAtiva]);

  const registrarLoja = () => {
    if (!nomeLoja || !categoria) return;

    //TODO: no futuro capturar coordenadas GPS e gravar a loja no SQLITE

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
        isMountedRef.current = false;
        fecharTabs();
      }}
    >
      <BottomSheetView>
        <Text>Registrar comércio</Text>
        <Text>Adicione um estabelecimento util ao mapa da comunidade.</Text>

        <TextInput />

        <Text>Categoria:</Text>

        {/*LISTA CATEGORIAS*/}
        <View></View>

        {/*BOTAO CONFIRMAR*/}
        <TouchableOpacity>
          <Text></Text>
        </TouchableOpacity>
      </BottomSheetView>
    </BottomSheetModal>
  );
}
