import { create } from 'zustand';

interface WalletState {
  saldo: number;
  creditar: (valor: number) => void;
  debitar: (valor: number) => boolean;
}

export const useWallet = create<WalletState>((set, get) => ({
  saldo: 0,
  creditar: (valor) =>
    set((state) => ({
      saldo: state.saldo + valor,
    })),

  debitar: (valor) => {
    const { saldo } = get();
    //aprovar transacao se saldo não for menor que valor
    if (saldo >= valor) {
      set({ saldo: saldo - valor });
      return true;
    }
    return false;
  },
}));
