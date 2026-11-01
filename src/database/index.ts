import * as SQLite from 'expo-sqlite';
import { DATABASE_SCHEMA } from './schema';

const DB_NAME = process.env.EXPO_PUBLIC_SQLITE_DB_NAME || 'imobi_local.db';

export const initializeDatabase = async (db: SQLite.SQLiteDatabase): Promise<void> => {
  try {
    //Manter assincrono para evitar bloqueio da thread principal do react native.

    await db.execAsync(DATABASE_SCHEMA);
    console.log('[DEBUG] Banco de dados inicializado com sucesso.');
  } catch (e) {
    console.error('Erro ao inicializar banco de dados:', e);
    throw e;
  }
};
