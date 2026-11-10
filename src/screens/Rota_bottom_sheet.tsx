import { TEMA_BORDAS_COR_CLARO, TEMA_BORDAS_COR_ESCURO } from '@/constants/cores';
import { useMap, useUI } from '@/hooks';
import { BottomSheetBackdrop, BottomSheetModal, BottomSheetView } from '@gorhom/bottom-sheet';
import { useEffect, useRef } from 'react';
import { StyleSheet, Text } from 'react-native';
import { GooglePlacesAutocomplete } from 'react-native-google-places-autocomplete';

export function RotaButtomSheet() {
  const bottomSheetRef = useRef<BottomSheetModal>(null);
  const isMountedRef = useRef(false);

  const { tabAtiva, fecharTabs } = useUI();
  const { tema, setDestino } = useMap();

  const isDark = tema === 'NOITE';

  //Abertura e fechamento
  useEffect(() => {
    if (tabAtiva === 'ROTA') {
      isMountedRef.current = true;
      bottomSheetRef.current?.present();
    } else if (isMountedRef.current) {
      isMountedRef.current = false;
      bottomSheetRef.current?.dismiss();
    }
  }, [tabAtiva]);

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

        <GooglePlacesAutocomplete
          placeholder="Buscar destino..."
          fetchDetails={true} // pegar latitude e longitude
          onPress={(data, details = null) => {
            if (details?.geometry?.location) {
              setDestino({
                latitude: details.geometry.location.lat,
                longitude: details.geometry.location.lng,
              });
              fecharTabs();
            }
          }}
          query={{
            key: process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY,
            language: 'pt-BR',
            components: 'country:br',
          }}
          styles={{
            container: { flex: 1 },
            textInputContainer: {
              width: '100%',
              backgroundColor: 'transparent',
              borderTopWidth: 0,
              borderBottomWidth: 0,
            },
            textInput: {
              height: 64,
              borderRadius: 12,
              paddingHorizontal: 16,
              fontSize: 16,
              backgroundColor: isDark ? '#0f172a' : '#f1f5f9',
              color: isDark ? '#f8fafc' : '#333',
              borderWidth: 1,
              borderColor: isDark ? '#334155' : '#e2e8f0',
            },
            listView: {
              backgroundColor: isDark ? '#1e293b' : 'white',
              marginTop: 10,
              borderRadius: 12,
              elevation: 2,
              shadowColor: 'black',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.1,
              shadowRadius: 4,
            },
            row: {
              backgroundColor: isDark ? '#1e293b' : 'white',
              padding: 13,
              height: 58,
              flexDirection: 'row',
              borderBottomWidth: 1,
              borderBottomColor: isDark ? '#334155' : '#f1f5f9',
            },
            description: {
              color: isDark ? '#cbd5e1' : 'white',
              fontSize: 15,
            },
          }}
          textInputProps={{ placeholderTextColor: isDark ? '#94a3b8' : 'gray' }}
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
});
