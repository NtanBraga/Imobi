import { Ocorrencia, StatusOcorrencia } from '@/models';
import * as SQLite from 'expo-sqlite';

//Criar ocorrencias e buscar para renderizacao

export const OcorrenciaRepository = {
  criar: async (db: SQLite.SQLiteDatabase, ocorrencia: Ocorrencia): Promise<boolean> => {
    try {
      await db.runAsync(
        `INSERT INTO Ocorrencia(id, tipo, descricao, status, latitude, longitude, dataCriacao)
                 VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
          ocorrencia.id,
          ocorrencia.tipo,
          ocorrencia.descricao,
          ocorrencia.status,
          ocorrencia.latitude,
          ocorrencia.longitude,
          ocorrencia.dataCriacao.toISOString(),
        ],
      );
      return true;
    } catch (e) {
      console.error('Erro ao criar ocorrencia: ', e);
      return false;
    }
  },

  buscarTodas: async (db: SQLite.SQLiteDatabase): Promise<Ocorrencia[]> => {
    try {
      const rows = await db.getAllAsync<any>('SELECT * FROM Ocorrencia WHERE status != ?', [
        StatusOcorrencia.RESOLVIDA,
      ]);
      return rows.map((row) => ({
        ...row,
        dataCriacao: new Date(row.dataCriacao),
      }));
    } catch (e) {
      console.error('Erro ao buscar ocorrencias: ', e);
      return [];
    }
  },

  atualizarStatus: async (
    db: SQLite.SQLiteDatabase,
    id: string,
    novoStatus: StatusOcorrencia,
  ): Promise<void> => {
    await db.runAsync('UPDATE Ocorrencia SET status = ? WHERE id  = ?', [novoStatus, id]);
  },
};
