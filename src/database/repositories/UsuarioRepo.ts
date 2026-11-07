import { Usuario } from '@/models';
import * as SQLite from 'expo-sqlite';

export const UsuarioRepository = {
  buscarUsuario: async (db: SQLite.SQLiteDatabase, id: string): Promise<Usuario | null> => {
    try {
      return await db.getFirstAsync<Usuario>('SELECT * FROM Usuario WHERE id = ?', [id]);
    } catch (e) {
      console.error('Erro ao buscar usuario: ', e);
      return null;
    }
  },
  atualizarAvatar: async (
    db: SQLite.SQLiteDatabase,
    usuarioId: string,
    avatarId: string,
  ): Promise<void> => {
    await db.runAsync('UPDATE Usuario SET avatarId = ? WHERE id = ?', [avatarId, usuarioId]);
  },
  buscarInventario: async (db: SQLite.SQLiteDatabase, usuarioId: string): Promise<string[]> => {
    try {
      const rows = await db.getAllAsync<{ avatarId: string }>(
        'SELECT avatarId FROM UsuarioAvatar WHERE usuarioId = ?',
        [usuarioId],
      );
      return rows.map((r) => r.avatarId);
    } catch (e) {
      console.error('Erro ao buscar invertario: ', e);
      return [];
    }
  },
  comprarAvatar: async (
    db: SQLite.SQLiteDatabase,
    usuarioId: string,
    avatarId: string,
  ): Promise<void> => {
    await db.runAsync(
      'INSERT OR IGNORE INTO UsuarioAvatar (usuarioId, avatarId, dataCompra) VALUES (?, ?, ?)',
      [usuarioId, avatarId, new Date().toISOString()],
    );
  },
};
