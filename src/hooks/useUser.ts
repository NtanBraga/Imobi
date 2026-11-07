import { db } from '@/database';
import { UsuarioRepository } from '@/database/repositories/UsuarioRepo';
import { Usuario } from '@/models';
import { create } from 'zustand';

interface UserState {
  usuarioAtivo: Usuario | null;
  setUsuario: () => Promise<void>;
  selecionarAvatar: (avatarId: string) => Promise<void>;
}

const USER_MVP = 'user-mvp';

export const useUser = create<UserState>((set) => ({
  usuarioAtivo: null,
  setUsuario: async () => {
    const database = await db;
    const usuario = await UsuarioRepository.buscarUsuario(database, USER_MVP);

    if (usuario) set({ usuarioAtivo: usuario });
  },
  selecionarAvatar: async (avatarId) => {
    const database = await db;
    await UsuarioRepository.atualizarAvatar(database, USER_MVP, avatarId);

    set((state) => ({
      usuarioAtivo: state.usuarioAtivo ? { ...state.usuarioAtivo, avatarId } : null,
    }));
  },
}));
