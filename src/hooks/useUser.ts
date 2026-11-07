import { db } from '@/database';
import { UsuarioRepository } from '@/database/repositories/UsuarioRepo';
import { Usuario } from '@/models';
import { create } from 'zustand';

interface UserState {
  usuarioAtivo: Usuario | null;
  inventarioAvatares: string[];
  setUsuario: () => Promise<void>;
  selecionarAvatar: (avatarId: string) => Promise<void>;
  comprarAvatar: (avatarId: string) => Promise<void>;
}

const USER_MVP = 'user-mvp';

export const useUser = create<UserState>((set) => ({
  usuarioAtivo: null,
  inventarioAvatares: [],
  setUsuario: async () => {
    const database = await db;
    const usuario = await UsuarioRepository.buscarUsuario(database, USER_MVP);
    const inventario = await UsuarioRepository.buscarInventario(database, USER_MVP);

    if (usuario) set({ usuarioAtivo: usuario, inventarioAvatares: inventario });
  },
  selecionarAvatar: async (avatarId) => {
    const database = await db;
    await UsuarioRepository.atualizarAvatar(database, USER_MVP, avatarId);

    set((state) => ({
      usuarioAtivo: state.usuarioAtivo ? { ...state.usuarioAtivo, avatarId } : null,
    }));
  },
  comprarAvatar: async (avatarId) => {
    const database = await db;
    await UsuarioRepository.comprarAvatar(database, USER_MVP, avatarId);

    set((state) => ({
      inventarioAvatares: [...state.inventarioAvatares, avatarId],
    }));
  },
}));
