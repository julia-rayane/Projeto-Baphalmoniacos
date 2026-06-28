import { Request, Response, NextFunction } from 'express';
import produtoModel from '../models/produtoModel.js';

// LISTAR OU FILTRAR PRODUTOS
async function obterProdutos(req: Request, res: Response, next: NextFunction) {
  try {
    const { nome } = req.query;
    // Se vier ?nome= na URL, passa o filtro, senão lista tudo
    const produtos = await produtoModel.read(nome ? { nome: String(nome) } : undefined);
    return res.json(produtos);
  } catch (error) {
    next(error);
  }
}

// BUSCAR POR ID
async function obterProdutoPorId(req: Request, res: Response, next: NextFunction) {
  try {
    const id = Number(req.params.id); // Converte obrigatoriamente para número
    const produto = await produtoModel.findById(id);
    
    if (!produto) {
      return res.status(404).json({ erro: 'Produto não encontrado' });
    }
    return res.json(produto);
  } catch (error) {
    next(error);
  }
}

// CADASTRAR PRODUTO
async function criarProduto(req: Request, res: Response, next: NextFunction) {
  try {
    const { nome, descricao, preco, foto, id_categoria_fk } = req.body;
    const novo = await produtoModel.create({ nome, descricao, preco, foto, id_categoria_fk });
    return res.status(201).json(novo);
  } catch (error) {
    next(error);
  }
}

// ATUALIZAR PRODUTO
async function atualizarProduto(req: Request, res: Response, next: NextFunction) {
  try {
    const id = Number(req.params.id);
    const atualizado = await produtoModel.update(id, req.body);
    return res.json(atualizado);
  } catch (error) {
    next(error);
  }
}

// REMOVER PRODUTO
async function deletarProduto(req: Request, res: Response, next: NextFunction) {
  try {
    const id = Number(req.params.id);
    await produtoModel.remove(id);
    return res.status(204).end();
  } catch (error) {
    next(error);
  }
}

export default { obterProdutos, obterProdutoPorId, criarProduto, atualizarProduto, deletarProduto };
