import { obterConexao } from '../database/database.js';
import { ICategoria } from '../types/index.js';

// 1. LISTAR TODAS AS CATEGORIAS
async function listarTodas(): Promise<ICategoria[]> {
  const db = await obterConexao();
  return db.all('SELECT * FROM categorias');
}

// 2. BUSCAR CATEGORIA POR ID
async function buscarPorId(id: number): Promise<ICategoria | undefined> {
  const db = await obterConexao();
  return db.get('SELECT * FROM categorias WHERE id = ?', [id]);
}

// 3. CRIAR NOVA CATEGORIA
async function criar(categoria: Omit<ICategoria, 'id'>): Promise<number> {
  const db = await obterConexao();
  const resultado = await db.run(
    'INSERT INTO categorias (nome) VALUES (?)',
    [categoria.nome]
  );
  return resultado.lastID!;
}

// 4. EXCLUIR CATEGORIA
async function excluir(id: number): Promise<boolean> {
  const db = await obterConexao();
  const resultado = await db.run('DELETE FROM categorias WHERE id = ?', [id]);
  return (resultado.changes ?? 0) > 0;
}

export default { listarTodas, buscarPorId, criar, excluir };
