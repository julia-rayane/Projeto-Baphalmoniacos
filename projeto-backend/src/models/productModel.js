import { conectarBanco } from '../database/connection.js';

// 1. READ - Listar todos os produtos trazendo os dados da categoria (JOIN)
export async function getAllProducts() {
  const db = await conectarBanco();
  // Ajustado para fazer INNER JOIN e trazer o nome_categoria corrigido
  return db.all(`
    SELECT p.*, c.nome_categoria 
    FROM produto p
    INNER JOIN categoria c ON p.id_categoria_fk = c.id_categoria
  `);
}

// 2. READ - Buscar um produto específico pelo ID
export async function getProductById(id) {
  const db = await conectarBanco();
  return db.get('SELECT * FROM produto WHERE id_produto = ?', [id]);
}

// 3. CREATE - Inserir um novo produto no banco
export async function createProduct(productData) {
  const db = await conectarBanco();
  const { nome, descricao, preco, disponibilidade, foto, id_categoria_fk } = productData;
  const result = await db.run(
    'INSERT INTO produto (nome, descricao, preco, disponibilidade, foto, id_categoria_fk) VALUES (?, ?, ?, ?, ?, ?)',
    [nome, descricao, preco, disponibilidade !== undefined ? disponibilidade : 1, foto, id_categoria_fk]
  );
  return result.lastID;
}

// 4. UPDATE - Alterar os dados de um produto existente
export async function updateProduct(id, productData) {
  const db = await conectarBanco();
  const { nome, descricao, preco, disponibilidade, foto, id_categoria_fk } = productData;
  return db.run(
    'UPDATE produto SET nome = ?, descricao = ?, preco = ?, disponibilidade = ?, foto = ?, id_categoria_fk = ? WHERE id_produto = ?',
    [nome, descricao, preco, disponibilidade, foto, id_categoria_fk, id]
  );
}

// 5. DELETE - Remover um produto do banco de dados
export async function deleteProduct(id) {
  const db = await conectarBanco();
  return db.run('DELETE FROM produto WHERE id_produto = ?', [id]);
}
