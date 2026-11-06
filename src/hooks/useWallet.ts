import { db } from '@/database';
import { CarteiraRepository } from '@/database/repositories';
import { TipoTransacao } from '@/models';
import { create } from 'zustand';

interface WalletState {
  saldo: number;
  carregarSaldo: () => void;
  creditar: (valor: number) => void;
  debitar: (valor: number) => void;
  zerarSaldo: () => void;
}

const WALLET_MVP = 'wallet-mvp';

export const useWallet = create<WalletState>((set, get) => ({
  saldo: 0,

  carregarSaldo: async () => {
    const database = await db;
    const saldoAtual = await CarteiraRepository.buscarSaldo(database, WALLET_MVP);
    set({ saldo: saldoAtual });
  },

  creditar: async (valor) => {
    if (valor <= 0) return;

    const database = await db;
    const sucesso = await CarteiraRepository.registrarTransacao(
      database,
      WALLET_MVP,
      TipoTransacao.CREDITO,
      valor,
    );
    if (sucesso) {
      set((state) => ({ saldo: state.saldo + valor }));
    }
  },

  debitar: async (valor) => {
    if (valor <= 0) return;

    const { saldo } = get();
    //aprovar transacao se saldo não for menor que valor
    if (saldo >= valor) {
      const database = await db;
      const sucesso = await CarteiraRepository.registrarTransacao(
        database,
        WALLET_MVP,
        TipoTransacao.DEBITO,
        valor,
      );
      if (sucesso) {
        set((state) => ({ saldo: state.saldo - valor }));
      }
    }
  },
  zerarSaldo: () => set({ saldo: 0 }),
}));
