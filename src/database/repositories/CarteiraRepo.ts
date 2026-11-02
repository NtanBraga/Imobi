import { TipoTransacao } from '@/models';
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
    transacaoTipo: TipoTransacao,
    quantidade: number,
  ): Promise<boolean> => {
    try {
      await db.withTransactionAsync(async () => {
        const transacaoId = Math.random().toString(36).substring(2, 9);

        await db.runAsync(
          'INSERT INTO Transacao (id, carteiraId, tipo, quantidade, data) VALUES (?, ?, ?, ?, ?)',
          [transacaoId, carteiraId, transacaoTipo, quantidade, new Date().toISOString()],
        );

        //atualiza o saldo baseado no tipo soma ou subtração da conta
        const modificador = transacaoTipo === 'CREDITO' ? '+' : '-';

        await db.runAsync(`UPDATE Carteira SET saldo = saldo ${modificador} ? WHERE id = ?`, [
          quantidade,
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
