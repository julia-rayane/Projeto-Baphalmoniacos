import { getDatabaseConnection } from '../database/connection.js';

// 1. READ - Listar todos os produtos do banco (Igual ao print do professor)
export async function getAllProducts() {
  const db = await connect();
  return db.all('SELECT * FROM produto');
}

// 2. READ - Buscar um produto específico pelo ID
export async function getProductById(id) {
  const db = await getDatabaseConnection();
  return db.get('SELECT * FROM produto WHERE id_produto = ?', [id]);
}

// 3. CREATE - Inserir um novo produto no banco
export async function createProduct(productData) {
  const db = await getDatabaseConnection();
  const { nome, descricao, preco, disponibilidade, foto, id_categoria_fk } = productData;
  const result = await db.run(
    'INSERT INTO produto (nome, descricao, preco, disponibilidade, foto, id_categoria_fk) VALUES (?, ?, ?, ?, ?, ?)',
    [nome, descricao, preco, disponibilidade || 1, foto, id_categoria_fk]
  );
  return result.lastID;
}

// 4. UPDATE - Alterar os dados de um produto existente
export async function updateProduct(id, productData) {
  const db = await getDatabaseConnection();
  const { nome, descricao, preco, disponibilidade, foto, id_categoria_fk } = productData;
  return db.run(
    'UPDATE produto SET nome = ?, descricao = ?, preco = ?, disponibilidade = ?, foto = ?, id_categoria_fk = ? WHERE id_produto = ?',
    [nome, descricao, preco, disponibilidade, foto, id_categoria_fk, id]
  );
}

// 5. DELETE - Remover um produto do banco de dados
export async function deleteProduct(id) {
  const db = await getDatabaseConnection();
  return db.run('DELETE FROM produto WHERE id_produto = ?', [id]);
}
