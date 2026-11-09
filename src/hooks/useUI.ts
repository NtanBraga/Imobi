import { create } from 'zustand';

type TabAtiva = 'NENHUM' | 'OCORRENCIA' | 'CARTEIRA' | 'PERFIL' | 'LOJA' | 'ROTA';

interface UIState {
  tabAtiva: TabAtiva;
  abrirTab: (tab: TabAtiva) => void;
  fecharTabs: () => void;
}

export const useUI = create<UIState>((set) => ({
  tabAtiva: 'NENHUM',
  abrirTab: (tab) => set({ tabAtiva: tab }),
  fecharTabs: () => set({ tabAtiva: 'NENHUM' }),
}));
