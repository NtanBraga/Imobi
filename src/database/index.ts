import * as SQLite from 'expo-sqlite';
import { DATABASE_SCHEMA } from './schema';

const DB_NAME = process.env.EXPO_PUBLIC_SQLITE_DB_NAME || 'imobi_local.db';

export const db = SQLite.openDatabaseAsync(DB_NAME);

export const initializeDatabase = async (): Promise<void> => {
  try {
    //Manter assincrono para evitar bloqueio da thread principal do react native.

    const database = await db;

    await database.execAsync(DATABASE_SCHEMA);
    console.log('[DEBUG] Banco de dados inicializado com sucesso.');
  } catch (e) {
    console.error('Erro ao inicializar banco de dados:', e);
    throw e;
  }
};
