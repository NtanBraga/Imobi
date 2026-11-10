import {
  COR_AVISO_ESCURO,
  COR_BRANCO,
  COR_CINZA,
  COR_PRETO,
  COR_PRIMARIA,
  COR_SUCESSO,
  COR_SUCESSO_ESCURO,
  TEMA_BORDAS_COR_CLARO,
  TEMA_BORDAS_COR_ESCURO,
  TEMA_BORDAS_COR_SECUNDARIA_CLARO,
  TEMA_BORDAS_COR_SECUNDARIA_ESCURO,
  TEMA_FUNDO_CLARO,
  TEMA_FUNDO_ESCURO,
  TEMA_FUNDO_SECUNDARIO_ESCURO,
  TEMA_TEXTO_CLARO,
} from '@/constants/cores';
import { db } from '@/database';
import { AvatarRepository } from '@/database/repositories/AvatarRepo';
import { useMap, useUI, useUser, useWallet } from '@/hooks';
import { Avatar } from '@/models';
import { BottomSheetBackdrop, BottomSheetFlatList, BottomSheetModal } from '@gorhom/bottom-sheet';
import { useEffect, useRef, useState } from 'react';
import { Alert, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export function CarteiraBottomSheet() {
  const bottomSheetRef = useRef<BottomSheetModal>(null);
  const isMountedRef = useRef(false);

  const { tabAtiva, fecharTabs } = useUI();
  const { saldo, creditar, debitar } = useWallet();
  const { usuarioAtivo, selecionarAvatar, inventarioAvatares, comprarAvatar } = useUser();
  const { tema } = useMap();

  const isDark = tema === 'NOITE';

  //estado avatares
  const [avatares, setAvatares] = useState<Avatar[]>([]);

  //Fazer um sistema de regaste diario
  const [resgatouhoje, setResgatouHoje] = useState(false);

  useEffect(() => {
    if (tabAtiva === 'CARTEIRA') {
      isMountedRef.current = true;
      bottomSheetRef.current?.present();

      //carregar avatares
      const fetchAvatares = async () => {
        const database = await db;
        const data = await AvatarRepository.buscarTodos(database);
        setAvatares(data);
      };
      fetchAvatares();
    } else if (isMountedRef.current) {
      isMountedRef.current = false;
      bottomSheetRef.current?.dismiss();
    }
  }, [tabAtiva]);

  //resgate
  const resgateDiario = () => {
    if (!resgatouhoje) {
      creditar(500);
      setResgatouHoje(true);
    }
  };

  // logica para compra e equipamento
  const handleComprar = (avatar: Avatar) => {
    if (usuarioAtivo?.avatarId === avatar.id) return;

    if (inventarioAvatares.includes(avatar.id)) {
      selecionarAvatar(avatar.id);
      return;
    }

    if (avatar.custoMoedas > 0) {
      if (saldo < avatar.custoMoedas) {
        Alert.alert(
          'Saldo Insuficiente',
          'Continue a reportar e recolher moedas para comprar esse avatar.',
        );
        return;
      }

      Alert.alert(
        'Comprar Avatar',
        `Deseja gastar ${avatar.custoMoedas} moedas em ${avatar.nome}`,
        [
          {
            text: 'Cancelar',
            style: 'cancel',
          },
          {
            text: 'Comprar',
            onPress: async () => {
              await debitar(avatar.custoMoedas);
              await comprarAvatar(avatar.id);
              await selecionarAvatar(avatar.id);
            },
          },
        ],
      );
    } else {
      //Se gratuito
      comprarAvatar(avatar.id);
      selecionarAvatar(avatar.id);
    }
  };

  const renderHeader = () => (
    <View style={styles.headerContainer}>
      <Text style={styles.subtitle}>SUA CARTEIRA</Text>
      <Text style={[styles.title, isDark && styles.textDark]}>
        {' '}
        {saldo.toLocaleString('pt-BR')} moedas
      </Text>
      <Text style={[styles.description, isDark && styles.textSubDark]}>
        Acumule moedas para adquirir novos avatares e customizar seu perfil
      </Text>

      {/*RESGATE*/}
      <TouchableOpacity
        style={[styles.rewardCard, isDark && styles.rewardCardDark]}
        onPress={resgateDiario}
        disabled={resgatouhoje}
      >
        <View style={styles.rewardInfo}>
          <Text style={[styles.rewardTitle, isDark && styles.textDark]}>Recompensa Diaria</Text>
          <Text style={[styles.rewardDesc, isDark && styles.textSubDark]}>
            {resgatouhoje ? 'Volte amanhã para mais.' : 'Resgate agora suas moedas!'}
          </Text>
        </View>

        {!resgatouhoje && (
          <View style={styles.claimButton}>
            <Text style={styles.claimText}>Resgatar</Text>
          </View>
        )}
      </TouchableOpacity>
      <Text style={[styles.sectionTitle, isDark && styles.textDark]}>Loja de Avatares</Text>
    </View>
  );

  return (
    <BottomSheetModal
      ref={bottomSheetRef}
      index={0}
      snapPoints={['83%']}
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
      <BottomSheetFlatList
        data={avatares}
        keyExtractor={(item) => item.id}
        numColumns={2}
        columnWrapperStyle={styles.row}
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={renderHeader}
        renderItem={({ item }) => {
          const isEquipado = usuarioAtivo?.avatarId === item.id;

          return (
            <TouchableOpacity
              style={[
                styles.card,
                isDark && styles.cardDark,
                isEquipado && (isDark ? styles.cardEquippedDark : styles.cardEquipped),
              ]}
              onPress={() => handleComprar(item)}
              activeOpacity={0.7}
            >
              <Text style={styles.cardImage}>{item.imagem}</Text>
              <Text style={[styles.cardName, isDark && styles.textDark]}>{item.nome}</Text>

              {isEquipado ? (
                <View style={[styles.badgeEquipped, isDark && styles.badgeEquippedDark]}>
                  <Text style={styles.badgeText}>Equipado</Text>
                </View>
              ) : inventarioAvatares.includes(item.id) ? (
                <View
                  style={[
                    styles.badgeEquipped,
                    {
                      backgroundColor: isDark
                        ? TEMA_BORDAS_COR_SECUNDARIA_ESCURO
                        : TEMA_BORDAS_COR_SECUNDARIA_CLARO,
                    },
                  ]}
                >
                  <Text style={styles.badgeText}>Usar</Text>
                </View>
              ) : (
                <Text style={styles.cardPrice}>
                  {item.custoMoedas === 0 ? 'Grátis' : `🪙 ${item.custoMoedas}`}
                </Text>
              )}
            </TouchableOpacity>
          );
        }}
      />
    </BottomSheetModal>
  );
}

const styles = StyleSheet.create({
  subtitle: {
    fontSize: 12,
    color: COR_PRIMARIA,
    fontWeight: 'bold',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    marginVertical: 8,
  },
  description: {
    fontSize: 14,
    color: COR_CINZA,
    marginBottom: 24,
  },
  rewardCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderWidth: 1,
    borderColor: 'orange',
    borderRadius: 16,
    backgroundColor: COR_BRANCO,
    marginBottom: 24,
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
    color: COR_CINZA,
    marginTop: 4,
  },
  claimButton: {
    backgroundColor: 'orange',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
  },
  claimText: {
    color: COR_BRANCO,
    fontWeight: 'bold',
  },
  row: {
    justifyContent: 'space-between',
  },
  listContent: {
    padding: 24,
    paddingBottom: 40,
  },
  headerContainer: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COR_PRETO,
    marginBottom: 10,
  },
  card: {
    backgroundColor: COR_BRANCO,
    width: '40%',
    padding: 10,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 15,
    elevation: 2,
    shadowColor: COR_PRETO,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.5,
  },
  cardName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 5,
  },
  cardImage: {
    fontSize: 45,
    marginBottom: 10,
  },
  cardEquipped: {
    borderColor: COR_SUCESSO,
    borderWidth: 2,
  },
  cardPrice: {
    fontSize: 14,
    color: '#d97706',
    fontWeight: 'bold',
  },
  badgeEquipped: {
    backgroundColor: COR_SUCESSO,
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 10,
  },
  badgeText: {
    color: COR_BRANCO,
    fontSize: 12,
    fontWeight: 'bold',
  },
  textDark: {
    color: TEMA_TEXTO_CLARO,
  },
  textSubDark: {
    color: TEMA_BORDAS_COR_ESCURO,
  },
  rewardCardDark: {
    backgroundColor: TEMA_FUNDO_SECUNDARIO_ESCURO,
    borderColor: COR_AVISO_ESCURO,
  },
  cardDark: {
    backgroundColor: TEMA_FUNDO_SECUNDARIO_ESCURO,
  },
  cardEquippedDark: {
    borderColor: COR_SUCESSO,
    borderWidth: 2,
  },
  badgeEquippedDark: {
    backgroundColor: COR_SUCESSO_ESCURO,
  },
});
