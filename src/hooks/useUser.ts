import { Usuario } from '@/models';
import { create } from 'zustand';

interface UserState {
  usuarioAtivo: Usuario | null;
  setUsuario: (usuario: Usuario) => void;
  selecionarAvatar: (avatarId: string) => void;
}

export const useUser = create<UserState>((set) => ({
  usuarioAtivo: null,
  setUsuario: (usuario) => set({ usuarioAtivo: usuario }),
  selecionarAvatar: (avatarId) =>
    set((state) => ({
      usuarioAtivo: state.usuarioAtivo ? { ...state.usuarioAtivo, avatarId } : null,
    })),
}));
