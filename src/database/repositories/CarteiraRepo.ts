import { Transacao } from '@/models/Transacao';
import * as SQLite from 'expo-sqlite';

export const CarteiraRepository = {
  buscarSaldo: async (db: SQLite.SQLiteDatabase, usuarioId: string): Promise<number> => {
    const result = await db.getFirstAsync<{ saldo: number }>(
      'SELECT saldo FROM Carteira WHERE usuarioId = ?',
      [usuarioId],
    );
    return result?.saldo || 0;
  },

  registrarTransacao: async (
    db: SQLite.SQLiteDatabase,
    carteiraId: string,
    transacao: Transacao,
  ): Promise<boolean> => {
    try {
      await db.withTransactionAsync(async () => {
        await db.runAsync(
          'INSERT INTO Transacao (id, carteiraId, tipo, quantidade, data) VALUES (?, ?, ?, ?, ?)',
          [
            transacao.id,
            carteiraId,
            transacao.tipo,
            transacao.quantidade,
            transacao.data.toISOString(),
          ],
        );

        //atualiza o saldo baseado no tipo soma ou subtração da conta
        const modificador = transacao.tipo === 'CREDITO' ? '+' : '-';

        await db.runAsync(`UPDATE Carteira SET saldo = saldo ${modificador} ? WHERE id = ?`, [
          transacao.quantidade,
          carteiraId,
        ]);
      });
      return true;
    } catch (e) {
      console.error('Falha na transação: ', e);
      return false;
    }
  },
};
