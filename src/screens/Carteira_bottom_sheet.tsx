import { useUI, useWallet } from '@/hooks';
import { BottomSheetBackdrop, BottomSheetModal, BottomSheetView } from '@gorhom/bottom-sheet';
import { useEffect, useRef, useState } from 'react';
import { Text, TouchableOpacity, View } from 'react-native';

export function CarteiraBottomSheet() {
  const bottomSheetRef = useRef<BottomSheetModal>(null);
  const isMountedRef = useRef(false);

  const { tabAtiva, fecharTabs } = useUI();
  const { saldo, creditar } = useWallet();

  //Fazer um sistema de regaste diario
  const [resgatouhoje, setResgatouHoje] = useState(false);

  useEffect(() => {
    if (tabAtiva === 'CARTEIRA') {
      isMountedRef.current = true;
      bottomSheetRef.current?.present();
    } else if (isMountedRef.current) {
      bottomSheetRef.current?.dismiss();
    }
  }, [tabAtiva]);

  const resgateDiario = () => {
    if (!resgatouhoje) {
      creditar(500);
      setResgatouHoje(true);
    }
  };

  return (
    <BottomSheetModal
      ref={bottomSheetRef}
      index={0}
      snapPoints={['70%']}
      enableDynamicSizing={false}
      onDismiss={() => {
        isMountedRef.current = false;
        fecharTabs();
      }}
      backdropComponent={(props) => (
        <BottomSheetBackdrop {...props} disappearsOnIndex={-1} appearsOnIndex={0} opacity={0.5} />
      )}
      handleIndicatorStyle={{ backgroundColor: 'white', width: 40 }}
      backgroundStyle={{ borderRadius: 24 }}
    >
      <BottomSheetView>
        <Text>SUA CARTEIRA</Text>
        <Text> {saldo.toLocaleString('pt-BR')} moedas</Text>
        <Text>Acumule moedas para adquirir novos avatares e customizar seu perfil</Text>

        {/*RESGATE*/}
        <TouchableOpacity>
          <View>
            <Text>Recompensa Diaria</Text>
            <Text>{resgatouhoje ? 'Volte amanhã para mais.' : 'Resgate agora suas moedas!'}</Text>
          </View>

          {!resgatouhoje && (
            <View>
              <Text>Resgatar</Text>
            </View>
          )}
        </TouchableOpacity>
      </BottomSheetView>
    </BottomSheetModal>
  );
}
