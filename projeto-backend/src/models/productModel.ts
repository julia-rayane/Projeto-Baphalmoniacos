import { obterConexao } from '../database/database.js';
import { IProduto, IProdutoComCategoria } from '../types/index.js';

// 1. LISTAR TODOS (Com JOIN para trazer o nome da categoria automaticamente)
async function listarTodos(): Promise<IProdutoComCategoria[]> {
  const db = await obterConexao();
  return db.all(`
    SELECT p.*, c.nome AS categoria_nome 
    FROM produtos p
    LEFT JOIN categorias c ON p.id_categoria_fk = c.id
  `);
}

// 2. BUSCAR POR ID (Também com JOIN)
async function buscarPorId(id: number): Promise<IProdutoComCategoria | undefined> {
  const db = await obterConexao();
  return db.get(`
    SELECT p.*, c.nome AS categoria_nome 
    FROM produtos p
    LEFT JOIN categorias c ON p.id_categoria_fk = c.id
    WHERE p.id = ?
  `, [id]);
}

// 3. CRIAR NOVO PRODUTO
async function criar(produto: Omit<IProduto, 'id'>): Promise<number> {
  const db = await obterConexao();
  const resultado = await db.run(`
    INSERT INTO produtos (nome, descricao, preco, foto, id_categoria_fk)
    VALUES (?, ?, ?, ?, ?)
  `, [produto.nome, produto.descricao, produto.preco, produto.foto, produto.id_categoria_fk]);
  return resultado.lastID!;
}

// 4. ATUALIZAR PRODUTO EXISTENTE
async function atualizar(id: number, produto: Omit<IProduto, 'id'>): Promise<boolean> {
  const db = await obterConexao();
  const resultado = await db.run(`
    UPDATE produtos 
    SET nome = ?, descricao = ?, preco = ?, foto = ?, id_categoria_fk = ?
    WHERE id = ?
  `, [produto.nome, produto.descricao, produto.preco, produto.foto, produto.id_categoria_fk, id]);
  return (resultado.changes ?? 0) > 0;
}

// 5. EXCLUIR PRODUTO
async function excluir(id: number): Promise<boolean> {
  const db = await obterConexao();
  const resultado = await db.run('DELETE FROM produtos WHERE id = ?', [id]);
  return (resultado.changes ?? 0) > 0;
}

export default { listarTodos, buscarPorId, criar, atualizar, excluir };
