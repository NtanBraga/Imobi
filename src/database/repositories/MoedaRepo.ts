import { Moeda } from '@/models';
import * as SQLite from 'expo-sqlite';

//Criar moeda, lida com distribuidas no mapa e marca coletadas

export const MoedaRepository = {
  criarEmLote: async (db: SQLite.SQLiteDatabase, moedas: Moeda[]): Promise<void> => {
    //Transacao para inserir moedas de uma forma mais performatica
    await db.withTransactionAsync(async () => {
      for (const moeda of moedas) {
        await db.runAsync(
          'INSERT INTO Moeda (id, valor, coletada, latitude, longitude) VALUES (?, ? ,? ,? ,?)',
          [moeda.id, moeda.valor, moeda.coletada ? 1 : 0, moeda.latitude, moeda.longitude],
        );
      }
    });
  },

  buscarDisponiveis: async (db: SQLite.SQLiteDatabase): Promise<Moeda[]> => {
    const rows = await db.getAllAsync<any>('SELECT * FROM Moeda Where coletada = 0');
    return rows.map((row) => ({
      ...row,
      coletada: Boolean(row.coletada),
    }));
  },

  marcarComoColetada: async (db: SQLite.SQLiteDatabase, id: string): Promise<void> => {
    await db.runAsync('UPDATE Moeda SET coletada = 1 WHERE id = ?', [id]);
  },
  deletar: async (db: SQLite.SQLiteDatabase, id: string): Promise<void> => {
    await db.runAsync('DELETE FROM Moeda WHERE id = ?', [id]);
  },
};
