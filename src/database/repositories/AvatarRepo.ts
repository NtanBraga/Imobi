import { Avatar } from '@/models';
import * as SQLite from 'expo-sqlite';

export const AvatarRepository = {
  buscarTodos: async (db: SQLite.SQLiteDatabase): Promise<Avatar[]> => {
    try {
      return await db.getAllAsync<Avatar>('SELECT * FROM Avatar ORDER BY custoMoedas ASC');
    } catch (e) {
      console.error('Erro ao buscar avatares: ', e);
      return [];
    }
  },
};
