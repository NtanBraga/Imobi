import { useUI, useWallet } from '@/hooks';
import { BottomSheetBackdrop, BottomSheetModal, BottomSheetView } from '@gorhom/bottom-sheet';
import { useEffect, useRef, useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

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
      <BottomSheetView style={styles.contentContainer}>
        <Text style={styles.subtitle}>SUA CARTEIRA</Text>
        <Text style={styles.title}> {saldo.toLocaleString('pt-BR')} moedas</Text>
        <Text style={styles.description}>
          Acumule moedas para adquirir novos avatares e customizar seu perfil
        </Text>

        {/*RESGATE*/}
        <TouchableOpacity style={styles.rewardCard} onPress={resgateDiario} disabled={resgatouhoje}>
          <View style={styles.rewardInfo}>
            <Text style={styles.rewardTitle}>Recompensa Diaria</Text>
            <Text style={styles.rewardDesc}>
              {resgatouhoje ? 'Volte amanhã para mais.' : 'Resgate agora suas moedas!'}
            </Text>
          </View>

          {!resgatouhoje && (
            <View style={styles.claimButton}>
              <Text style={styles.claimText}>Resgatar</Text>
            </View>
          )}
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
  subtitle: {
    fontSize: 12,
    color: '#2a9d8f',
    fontWeight: 'bold',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    marginVertical: 8,
  },
  description: {
    fontSize: 14,
    color: 'gray',
    marginBottom: 24,
  },
  rewardCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderWidth: 1,
    borderColor: 'orange',
    borderRadius: 16,
    backgroundColor: 'white',
  },
  rewardInfo: {
    flex: 1,
  },
  rewardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  rewardDesc: {
    fontSize: 12,
    color: 'gray',
    marginTop: 4,
  },
  claimButton: {
    backgroundColor: 'orange',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
  },
  claimText: {
    color: 'white',
    fontWeight: 'bold',
  },
});
