export const DATABASE_SCHEMA = `
    PRAGMA foreign_keys = ON;

    CREATE TABLE IF NOT EXISTS Avatar (
        id TEXT PRIMARY KEY,
        nome TEXT NOT NULL,
        imagem TEXT NOT NULL,
        custoMoedas DECIMAL(15,4) NOT NULL
    );

    CREATE TABLE IF NOT EXISTS Usuario (
        id TEXT PRIMARY KEY,
        nome TEXT NOT NULL,
        avatarId TEXT,
        FOREIGN KEY (avatarId) REFERENCES Avatar(id)
    );

    CREATE TABLE IF NOT EXISTS Carteira (
        id TEXT PRIMARY KEY,
        usuarioId TEXT NOT NULL,
        saldo DECIMAL(15,4) DEFAULT 0,
        FOREIGN KEY (usuarioId) REFERENCES Usuario(id) ON DELETE CASCADE 
    );

    CREATE TABLE IF NOT EXISTS Transacao (
        id TEXT PRIMARY KEY,
        carteiraId TEXT NOT NULL,
        tipo TEXT NOT NULL,
        quantidade DECIMAL(15,4) NOT NULL,
        data TEXT NOT NULL,
        FOREIGN KEY (carteiraId) REFERENCES Carteira(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS Ocorrencia (
        id TEXT PRIMARY KEY,
        tipo TEXT NOT NULL,
        descricao TEXT,
        status TEXT NOT NULL,
        latitude DECIMAL(9,6) NOT NULL,
        longitude DECIMAL(10,6) NOT NULL,
        dataCriacao TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS ConfirmacaoOcorrencia (
        id TEXT PRIMARY KEY,
        ocorrenciaId TEXT NOT NULL,
        usuarioId TEXT NOT NULL,
        tipo TEXT NOT NULL,
        data TEXT NOT NULL,
        FOREIGN KEY (ocorrenciaId) REFERENCES Ocorrencia(id) ON DELETE CASCADE,
        FOREIGN KEY (usuarioId) REFERENCES Usuario(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS Loja (
        id TEXT PRIMARY KEY,
        nome TEXT NOT NULL,
        categoria TEXT NOT NULL,
        latitude DECIMAL(9,6) NOT NULL,
        longitude DECIMAL(10,6) NOT NULL
    );

    CREATE TABLE IF NOT EXISTS Moeda (
        id TEXT PRIMARY KEY,
        valor INTEGER NOT NULL,
        coletada INTEGER DEFAULT 0,
        latitude DECIMAL(9,6) NOT NULL,
        longitude DECIMAL(10,6) NOT NULL
    );
`;
