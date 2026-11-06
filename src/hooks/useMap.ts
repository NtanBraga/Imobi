import { ModoLocomocao, ModoVisualizacao } from '@/models';
import { create } from 'zustand';

interface MapState {
  modoVisualizacao: ModoVisualizacao;
  modoLocomocao: ModoLocomocao;
  coordenadaFoco: { latitude: number; longitude: number } | null;
  setModoLocomocao: (modo: ModoLocomocao) => void;
  setModoVisualizacao: () => void;
  setCoordenadaFoco: (coordenada: { latitude: number; longitude: number } | null) => void;
}

export const useMap = create<MapState>((set) => ({
  modoVisualizacao: ModoVisualizacao.OFF, // Oculta gamificacao
  modoLocomocao: ModoLocomocao.TRANSITO, // Inicializa no modo transito
  // Talvez acrescentar em memoria escolha de usuario

  coordenadaFoco: null,

  setModoLocomocao: (modo) => set({ modoLocomocao: modo }),

  setModoVisualizacao: () =>
    set((state) => ({
      modoVisualizacao:
        state.modoVisualizacao === ModoVisualizacao.ON ? ModoVisualizacao.OFF : ModoVisualizacao.ON,
    })),
  setCoordenadaFoco: (coordenada) => set({ coordenadaFoco: coordenada }),
}));
