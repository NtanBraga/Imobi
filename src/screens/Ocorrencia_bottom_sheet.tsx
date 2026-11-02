import { useUI } from '@/hooks';
import { TipoOcorrencia } from '@/models';
import { BottomSheetBackdrop, BottomSheetModal } from '@gorhom/bottom-sheet';
import { useEffect, useRef, useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export function OcorrenciaBottomSheet() {
  const bottomSheetRef = useRef<BottomSheetModal>(null);
  const isMountedRef = useRef(false);
  const { tabAtiva, fecharTabs } = useUI();
  const [tipoSelecionado, setTipoSelecionado] = useState<TipoOcorrencia | null>(null);

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

  const confirmarReport = () => {
    if (!tipoSelecionado) return;

    //TODO: CHAMAR O SERVICO GPS E SALVAR NO SQLITE

    fecharTabs();
  };

  return (
    //BOTTOM TAB
    <BottomSheetModal
      ref={bottomSheetRef}
      index={0}
      snapPoints={['55%']}
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
      <View>
        <Text>Selecione um risco.</Text>

        {/*Opcao: BURACO*/}
        <TouchableOpacity>
          <View style={[styles.iconBox, { backgroundColor: 'blue' }]}>
            <Text>!</Text>
          </View>

          <View>
            <Text>Buraco</Text>
            <Text>neste local</Text>
          </View>
          <View></View>
        </TouchableOpacity>

        {/*Opcao: ARVORE CAIDA*/}
        <TouchableOpacity>
          <View style={[styles.iconBox, { backgroundColor: 'green' }]}>
            <Text>!</Text>
          </View>

          <View>
            <Text>Arvore caida</Text>
            <Text>neste local</Text>
          </View>
          <View></View>
        </TouchableOpacity>

        {/*CONFIRMAR*/}
        <TouchableOpacity onPress={confirmarReport}>
          <Text>Confirmar local</Text>
        </TouchableOpacity>
      </View>
    </BottomSheetModal>
  );
}

const styles = StyleSheet.create({
  iconBox: {
    width: 40,
    height: 40,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
});
