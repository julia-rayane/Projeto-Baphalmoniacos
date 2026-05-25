import { getDatabaseConnection } from "./connection.js";

async function migration() {
    // 1. Abre a conexão com o banco de dados
    const db = await getDatabaseConnection();

    // 2. Cria todas as tabelas do seu PDF (sem nível de pimenta)
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

    // 3. Insere os dados de teste do seu PDF caso o banco esteja vazio
    const usuarios = await db.all('SELECT * FROM usuario');
    
    if (usuarios.length === 0) {
        console.log("Populando banco de dados com dados iniciais...");

        await db.run(`
        INSERT INTO usuario (nome, email, senha, tipo_perfil) VALUES
        ('Ana Souza', 'anal@email.com', '123','cliente'),
        ('Bruno Lima', 'bruno@email.com', '321', 'cliente'),
        ('Carla Mendes', 'carla@email.com', '231', 'cliente'),
        ('Diego Alves', 'diego@email.com', '132', 'cliente'),
        ('Eduarda Silva', 'edu@email.com', '111', 'cliente'),
        ('Felipe Costa', 'felipe@email.com', '333', 'cliente'),
        ('Gabriela Rocha', 'gabi@email.com', '222', 'cliente'),
        ('Henrique Dias', 'henrique@email.com', '223', 'cliente'),
        ('Isabela Gomes', 'isa@email.com', '331', 'cliente'),
        ('João Pedro', 'joao@email.com', '112', 'cliente'),
        ('Karina Lopes', 'karina@email.com', '113','cliente'),
        ('Lucas Martins', 'lucas@email.com', '213', 'cliente'),
        ('Mariana Souza', 'mariana@email.com', '312', 'cliente'),
        ('Admin 1', 'admin1@email.com', 'admin', 'administrador'),
        ('Admin 2', 'admin2@email.com', 'admin', 'administrador')
        `);

        await db.run(`
        INSERT INTO endereco (rua, numero, bairro, cidade, estado, cep, id_usuario_fk) VALUES
        ('Rua Alegria', '10', 'Centro', 'João Pessoa', 'PB', '58000-000', 1),
        ('Rua Brasil', '23', 'Bela Vista', 'João Pessoa', 'PB', '58000-921', 2),
        ('Rua Cor do Céu', '13', 'Cuité', 'João Pessoa', 'PB', '58000-102', 3),
        ('Rua Devil May Cry', '22', 'Dolores Álvares', 'Bayeux', 'PB', '58060-203', 4),
        ('Rua Elvis', '96', 'Espírito Puro', 'Ribeirão Preto', 'SP', '58103-004', 5),
        ('Rua Figueiras Verdes', '192', 'Flor de Lis', 'João Pessoa', 'PB', '58001-205', 6),
        ('Rua Grande', '70', 'Groelândia', 'Rio Branco', 'AC', '58034-006', 7),
        ('Rua Hortensia', '80', 'Hércules', 'João Pessoa', 'PB', '58000-067', 8),
        ('Rua Ilha das Pérolas', '210', 'Iracema', 'João Pessoa', 'PB', '58030-908', 9),
        ('Rua Juscelino Kubistchek', '100', 'Jânio Quadros', 'João Pessoa', 'PB', '58000-909', 10),
        ('Rua K', '112', 'Bairro K', 'João Pessoa', 'PB', '58200-010', 11),
        ('Rua Linda Pedra', '125', 'Limoreiro', 'Petrolina', 'PE', '58000-411', 12),
        ('Rua Mar Sereno', '149', 'Mangabeira', 'João Pessoa', 'PB', '58070-012', 13),
        ('Rua Naval', '141', 'Napoleão', 'Niterói', 'RJ', '58200-013', 14),
        ('Rua Olivas Verdes', '150', 'Centro', 'João Pessoa', 'PB', '58009-014', 15)
        `);

        await db.run(`
        INSERT INTO categoria (nome_categoria) VALUES
        ('Prato Principal'), ('Bebida'), ('Sobremesa'), ('Entrada'), ('Vegano'),
        ('Apimentado'), ('Tradicional'), ('Rápido'), ('Doce'), ('Salgado'),
        ('Especial'), ('Premium'), ('Combo'), ('Fitness'), ('Street Food')
        `);

        await db.run(`
        INSERT INTO produto (nome, descricao, preco, disponibilidade, id_categoria_fk) VALUES
        ('Bulgogi', 'Carne coreana', 35, 1, 1),
        ('Kimchi', 'Acelga fermentada', 15, 1, 6),
        ('Ramyeon', 'Macarrão picante', 20, 1, 6),
        ('Bibimbap', 'Arroz com mix', 30, 1, 1),
        ('Tteokbokki', 'Bolinhos apimentados', 22, 1, 6),
        ('Japchae', 'Macarrão doce', 28, 1, 1),
        ('Soju', 'Bebida coreana', 18, 1, 2),
        ('Chá coreano', 'Bebida quente', 10, 1, 2),
        ('Hotteok', 'Doce coreano', 12, 1, 3),
        ('Bingsu', 'Sobremesa gelada', 25, 1, 3),
        ('Kimbap', 'Sushi coreano', 18, 1, 4),
        ('Mandu', 'Pastel coreano', 16, 1, 4),
        ('Dakgalbi', 'Frango picante', 32, 1, 6),
        ('Samgyeopsal', 'Porco grelhado', 40, 1, 1),
        ('Combo Coreano', 'Mix completo', 60, 1, 13)
        `);

        await db.run(`
        INSERT INTO ingrediente (nome) VALUES
        ('Carne'), ('Frango'), ('Porco'), ('Arroz'), ('Macarrão'), ('Pimenta'),
        ('Alho'), ('Açúcar'), ('Molho de soja'), ('Cebolinha'), ('Ovo'),
        ('Gengibre'), ('Farinha'), ('Repolho'), ('Queijo')
        `);

        await db.run(`
        INSERT INTO produto_ingrediente (id_produto_fk, id_ingrediente_fk) VALUES
        (1,1), (1,9), (2,14), (2,6), (3,5), (3,6), (4,4), (4,11),
        (5,13), (5,6), (6,5), (7,8), (8,12), (9,13), (10,8)
        `);

        await db.run(`
        INSERT INTO pedido (data_pedido, status, id_usuario_fk) VALUES
        ('2024-07-12 10:00:00', 'Em preparo', 1),
        ('2025-01-24 10:10:00', 'Entregue', 2),
        ('2026-02-11 10:20:00', 'Em entrega', 3),
        ('2025-03-19 10:30:00', 'Entregue', 4),
        ('2026-06-17 10:40:00', 'Em preparo', 5),
        ('2025-03-27 10:50:00', 'Entregue', 6),
        ('2024-09-30 11:00:00', 'Em preparo', 7),
        ('2026-07-22 11:10:00', 'Entregue', 8),
        ('2026-03-30 11:20:00', 'Em entrega', 9),
        ('2024-08-11 11:30:00', 'Entregue', 10),
        ('2026-03-30 11:40:00', 'Em preparo', 11),
        ('2023-03-30 11:50:00', 'Entregue', 12),
        ('2025-11-28 12:00:00', 'Em preparo', 13),
        ('2026-03-30 12:10:00', 'Entregue', 14),
        ('2025-10-31 12:20:00', 'Em preparo', 15)
        `);

        await db.run(`
        INSERT INTO item_pedido (id_pedido_fk, id_produto_fk, quantidade, preco_unitario, subtotal) VALUES
        (1,1,1,35,35), (2,2,2,15,30), (3,3,1,20,20), (4,4,1,30,30), (5,5,2,22,44),
        (6,6,1,28,28), (7,7,3,18,54), (8,8,1,10,10), (9,9,2,12,24), (10,10,1,25,25),
        (11,11,2,18,36), (12,12,1,16,16), (13,13,1,32,32), (14,14,2,40,80), (15,15,1,60,60)
        `);

        await db.run(`
        INSERT INTO avaliacao (nota, comentario, data_avaliacao, id_usuario_fk, id_produto_fk) VALUES
        (5, 'Perfeito', '2025-03-30 16:00:00', 1, 1),
        (4, 'Muito bom', '2026-06-12 11:05:00', 2, 2),
        (5, 'Amei', '2025-04-14 10:10:00', 3, 3),
        (3, 'Ok', '2026-01-15 14:15:00', 4, 4),
        (4, 'Gostei', '2023-09-10 20:20:00', 5, 5),
        (5, 'Top', '2026-03-30 22:25:00', 6, 6),
        (2, 'Muito picante', '2025-07-20 10:30:00', 7, 3),
        (5, 'Delicioso', '2026-02-16 18:35:00', 8, 8),
        (4, 'Bom', '2025-10-30 13:40:00', 9, 9),
        (5, 'Excelente', '2025-03-11 21:45:00', 10, 10),
        (3, 'Normal', '2026-03-30 19:50:00', 11, 11),
        (5, 'Amei demais', '2025-02-25 09:55:00', 12, 12),
        (4, 'Muito bom', '2026-02-12 07:00:00', 13, 13),
        (5, 'Perfeito', '2026-05-22 11:05:00', 14, 14),
        (4, 'Gostei', '2025-07-20 08:10:00', 15, 15)
        `);

        await db.run(`
        INSERT INTO contato (nome, email, mensagem, data_envio, id_usuario_fk) VALUES
        ('Ana', 'ana@email.com', 'Ótimo site', '2025-03-20 15:00:00', 1),
        ('Bruno', 'bruno@email.com', 'Muito bom', '2026-04-12 10:01:00', 2),
        ('Carla', 'carla@email.com', 'Gostei', '2024-02-24 12:02:00', 3),
        ('Diego', 'diego@email.com', 'Entrega rápida', '2026-02-12 11:03:00', 4),
        ('Eduarda', 'edu@email.com', 'Top', '2025-10-30 12:04:00', 5),
        ('Felipe', 'felipe@email.com', 'Legal', '2026-01-29 15:05:00', 6),
        ('Gabi', 'gabi@email.com', 'Amei', '2025-09-17 11:06:00', 7),
        ('Henrique', 'henrique@email.com', 'Muito bom', '2025-12-30 22:07:00', 8),
        ('Isabela', 'isa@email.com', 'Perfeito', '2025-09-19 14:08:00', 9),
        ('João', 'joao@email.com', 'Gostei', '2025-10-31 07:09:00', 10),
        ('Karina', 'karina@email.com', 'Legal', '2024-09-16 10:10:00', 11),
        ('Lucas', 'lucas@email.com', 'Top', '2025-06-29 20:11:00', 12),
        ('Mariana', 'mariana@email.com', 'Excelente', '2025-11-27 22:12:00', 13),
        ('Nicolas', 'nicolas@email.com', 'Bom', '2026-02-17 10:13:00', 14),
        ('Admin', 'admin@email.com', 'Sistema ok', '2026-03-30 15:14:00', 15)
        `);
    }

    // 4. Fecha a conexão com o banco de dados de forma segura
    await db.close();

    console.log("Banco criado e populado com sucesso!");
}

// Executa a função automaticamente
migration();
