import * as SQLite from 'expo-sqlite';
import { DATABASE_SCHEMA } from './schema';

const DB_NAME = process.env.EXPO_PUBLIC_SQLITE_DB_NAME || 'imobi_local.db';

export const db = SQLite.openDatabaseAsync(DB_NAME);

export const initializeDatabase = async (): Promise<void> => {
  try {
    //Manter assincrono para evitar bloqueio da thread principal do react native.

    const database = await db;

    await database.execAsync(DATABASE_SCHEMA);

    //Por questão de testes, os avatares por enquanto serão emotes
    //futuramente trocar por imagens

    await database.runAsync(
      `INSERT OR IGNORE INTO Avatar(id, nome, imagem, custoMoedas) VALUES ('av-1', 'Explorador', '👦', 0)`,
    );
    await database.runAsync(
      `INSERT OR IGNORE INTO Avatar(id, nome, imagem, custoMoedas) VALUES ('av-2', 'Motorista', '🚗', 50)`,
    );
    await database.runAsync(
      `INSERT OR IGNORE INTO Avatar(id, nome, imagem, custoMoedas) VALUES ('av-3', 'Policial', '🚓', 100)`,
    );
    await database.runAsync(
      `INSERT OR IGNORE INTO Avatar(id, nome, imagem, custoMoedas) VALUES ('av-4', 'Prefeito', '🏛️', 500)`,
    );

    //Mock Injetar usuario e carteira MVP

    await database.runAsync(
      `INSERT OR IGNORE INTO Usuario (id, nome, avatarId) VALUES ('user-mvp', 'Bob', 'av-1')`,
    );

    await database.runAsync(
      `INSERT OR IGNORE INTO Carteira (id, usuarioId, saldo) VALUES ('wallet-mvp', 'user-mvp', 0)`,
    );

    console.log('[DEBUG] Banco de dados inicializado com sucesso.');
  } catch (e) {
    console.error('Erro ao inicializar banco de dados:', e);
    throw e;
  }
};
