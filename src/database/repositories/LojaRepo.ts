import { Loja } from '@/models';
import * as SQLite from 'expo-sqlite';

export const LojaRepository = {
  criar: async (db: SQLite.SQLiteDatabase, loja: Loja): Promise<boolean> => {
    try {
      await db.runAsync(
        `INSERT INTO Loja (id, nome, categoria, latitude, longitude) VALUES (?, ?, ?, ?, ?)`,
        [loja.id, loja.nome, loja.categoria, loja.latitude, loja.longitude],
      );
      return true;
    } catch (e) {
      console.error('Erro ao criar loja: ', e);
      return false;
    }
  },

  buscarTodas: async (db: SQLite.SQLiteDatabase): Promise<Loja[]> => {
    try {
      const rows = await db.getAllAsync<any>('SELECT * FROM Loja');
      return rows as Loja[];
    } catch (e) {
      console.error('Erro ao buscar lojas: ', e);
      return [];
    }
  },
};
