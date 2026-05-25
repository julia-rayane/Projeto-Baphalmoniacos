import { conectarBanco } from "./database.js";

async function rodarSeeds() {
    const db = await conectarBanco();

    console.log("--- Populando o banco de dados (Seeds) ---");

    // Inserindo os Usuários do PDF
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

    // Inserindo os Endereços do PDF
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

    // Categoria para vincular seus produtos customizados
    const resultCat = await db.run(
        "INSERT INTO categoria (nome_categoria) VALUES ('Pratos Principais')"
    );
    const catId = resultCat.lastID;

    // Outras categorias vindas do PDF para completar a tabela
    await db.run(`
    INSERT INTO categoria (nome_categoria) VALUES
    ('Bebida'), ('Sobremesa'), ('Entrada'), ('Vegano'), ('Apimentado'), ('Tradicional')
    `);

    // SEU CARDÁPIO REAL COM FOTOS (Vinculado na categoria criada acima)
    await db.run(`
    INSERT INTO produto (nome, descricao, preco, disponibilidade, foto, id_categoria_fk) VALUES 
    ('Lámen', 'Macarrão coreano tradicional servido em um caldo quente e apimentado com vegetais frescos e ovo.', 22.50, 1, 'lámen.png', ${catId}),
    ('Buchimgae', 'Tradicional tigela de arroz coberta com um mix de vegetais coloridos, carne marinada e ovo frito.', 36.00, 1, 'buchimgae.png', ${catId}),
    ('Tteokbokki', 'Bolinhos de arroz super macios e mastigáveis, cozidos em um delicioso molho de pimenta doce.', 28.00, 1, 'tteokbokki.png', ${catId})
    `);

    // Inserindo os Ingredientes do PDF
    await db.run(`
    INSERT INTO ingrediente (nome) VALUES
    ('Carne'), ('Frango'), ('Porco'), ('Arroz'), ('Macarrão'), ('Pimenta'),
    ('Alho'), ('Açúcar'), ('Molho de soja'), ('Cebolinha'), ('Ovo'),
    ('Gengibre'), ('Farinha'), ('Repolho'), ('Queijo')
    `);

    // Relacionamentos Produto_Ingrediente (Ligando os ingredientes aos seus pratos)
    await db.run(`
    INSERT INTO produto_ingrediente (id_produto_fk, id_ingrediente_fk) VALUES
    (1,5), (1,6), (1,11), (2,4), (2,1), (2,11), (3,13), (3,6)
    `);

    // Inserindo os Pedidos do PDF
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

    // Itens do Pedido adaptados aos IDs dos seus novos pratos
    await db.run(`
    INSERT INTO item_pedido (id_pedido_fk, id_produto_fk, quantidade, preco_unitario, subtotal) VALUES
    (1,1,1,22.50,22.50), (2,2,2,36.00,72.00), (3,3,1,28.00,28.00), (4,1,1,22.50,22.50), (5,2,2,36.00,72.00),
    (6,3,1,28.00,28.00), (7,1,3,22.50,67.50), (8,2,1,36.00,36.00), (9,3,2,28.00,56.00), (10,1,1,22.50,22.50),
    (11,2,2,36.00,72.00), (12,3,1,28.00,28.00), (13,1,1,22.50,22.50), (14,2,2,36.00,72.00), (15,3,1,28.00,28.00)
    `);

    // Avaliações do PDF
    await db.run(`
    INSERT INTO avaliacao (nota, comentario, data_avaliacao, id_usuario_fk, id_produto_fk) VALUES
    (5, 'Perfeito', '2025-03-30 16:00:00', 1, 1),
    (4, 'Muito bom', '2026-06-12 11:05:00', 2, 2),
    (5, 'Amei', '2025-04-14 10:10:00', 3, 3),
    (3, 'Ok', '2026-01-15 14:15:00', 4, 1),
    (4, 'Gostei', '2023-09-10 20:20:00', 5, 2),
    (5, 'Top', '2026-03-30 22:25:00', 6, 3),
    (2, 'Muito picante', '2025-07-20 10:30:00', 7, 1),
    (5, 'Delicioso', '2026-02-16 18:35:00', 8, 2),
    (4, 'Bom', '2025-10-30 13:40:00', 9, 3),
    (5, 'Excelente', '2025-03-11 21:45:00', 10, 1),
    (3, 'Normal', '2026-03-30 19:50:00', 11, 2),
    (5, 'Amei demais', '2025-02-25 09:55:00', 12, 3),
    (4, 'Muito bom', '2026-02-12 07:00:00', 13, 1),
    (5, 'Perfeito', '2026-05-22 11:05:00', 14, 2),
    (4, 'Gostei', '2025-07-20 08:10:00', 15, 3)
    `);

    // Mensagens de Contato do PDF
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

    await db.close();
    console.log("--- Seeds executadas com sucesso! ---");
}

rodarSeeds();
