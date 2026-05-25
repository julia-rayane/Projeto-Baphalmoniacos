import { conectarBanco } from "./database.js";

async function aplicarMigrations() {
    const db = await conectarBanco();

    console.log("--- Criando as tabelas no banco de dados ---");

    await db.exec(`
    CREATE TABLE IF NOT EXISTS usuario (
        id_usuario INTEGER PRIMARY KEY AUTOINCREMENT,
        nome VARCHAR(100) NOT NULL,
        email VARCHAR(100) NOT NULL UNIQUE,
        senha VARCHAR(255) NOT NULL,
        tipo_perfil VARCHAR(20) DEFAULT 'cliente'
    );

    CREATE TABLE IF NOT EXISTS endereco (
        id_endereco INTEGER PRIMARY KEY AUTOINCREMENT,
        rua VARCHAR(100) NOT NULL,
        numero VARCHAR(10) NOT NULL,
        bairro VARCHAR(50) NOT NULL,
        cidade VARCHAR(50) NOT NULL,
        estado VARCHAR(2) NOT NULL,
        cep VARCHAR(10) NOT NULL,
        id_usuario_fk INTEGER,
        FOREIGN KEY (id_usuario_fk) REFERENCES usuario (id_usuario)
    );

    CREATE TABLE IF NOT EXISTS categoria (
        id_categoria INTEGER PRIMARY KEY AUTOINCREMENT,
        nome_categoria VARCHAR(50) NOT NULL UNIQUE
    );

    CREATE TABLE IF NOT EXISTS produto (
        id_produto INTEGER PRIMARY KEY AUTOINCREMENT,
        nome VARCHAR(100) NOT NULL,
        descricao TEXT NOT NULL,
        preco DECIMAL(10,2) NOT NULL,
        disponibilidade INTEGER NOT NULL DEFAULT 1,
        foto TEXT,
        id_categoria_fk INTEGER,
        FOREIGN KEY (id_categoria_fk) REFERENCES categoria (id_categoria)
    );

    CREATE TABLE IF NOT EXISTS ingrediente (
        id_ingrediente INTEGER PRIMARY KEY AUTOINCREMENT,
        nome VARCHAR(100) NOT NULL
    );

    CREATE TABLE IF NOT EXISTS produto_ingrediente (
        id_produto_fk INTEGER,
        id_ingrediente_fk INTEGER,
        PRIMARY KEY (id_produto_fk, id_ingrediente_fk),
        FOREIGN KEY (id_produto_fk) REFERENCES produto (id_produto),
        FOREIGN KEY (id_ingrediente_fk) REFERENCES ingrediente (id_ingrediente)
    );

    CREATE TABLE IF NOT EXISTS pedido (
        id_pedido INTEGER PRIMARY KEY AUTOINCREMENT,
        data_pedido DATETIME NOT NULL,
        status VARCHAR(20) NOT NULL,
        id_usuario_fk INTEGER,
        FOREIGN KEY (id_usuario_fk) REFERENCES usuario (id_usuario)
    );

    CREATE TABLE IF NOT EXISTS item_pedido (
        id_item INTEGER PRIMARY KEY AUTOINCREMENT,
        id_pedido_fk INTEGER,
        id_produto_fk INTEGER,
        quantidade INTEGER NOT NULL,
        preco_unitario DECIMAL(10,2) NOT NULL,
        subtotal DECIMAL(10,2),
        FOREIGN KEY (id_pedido_fk) REFERENCES pedido (id_pedido),
        FOREIGN KEY (id_produto_fk) REFERENCES produto (id_produto)
    );

    CREATE TABLE IF NOT EXISTS avaliacao (
        id_avaliacao INTEGER PRIMARY KEY AUTOINCREMENT,
        nota INTEGER NOT NULL,
        comentario TEXT,
        data_avaliacao DATETIME NOT NULL,
        id_usuario_fk INTEGER,
        id_produto_fk INTEGER,
        FOREIGN KEY (id_usuario_fk) REFERENCES usuario (id_usuario),
        FOREIGN KEY (id_produto_fk) REFERENCES produto (id_produto)
    );

    CREATE TABLE IF NOT EXISTS contato (
        id_contato INTEGER PRIMARY KEY AUTOINCREMENT,
        nome VARCHAR(100) NOT NULL,
        email VARCHAR(100) NOT NULL,
        mensagem TEXT NOT NULL,
        data_envio DATETIME,
        id_usuario_fk INTEGER,
        FOREIGN KEY (id_usuario_fk) REFERENCES usuario (id_usuario)
    );
    `);

    await db.close();
    console.log("--- Migrations aplicadas com sucesso! ---");
}

aplicarMigrations();
