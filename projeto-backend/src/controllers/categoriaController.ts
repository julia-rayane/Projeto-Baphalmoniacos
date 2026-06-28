import { Request, Response, NextFunction } from 'express';
import categoriaModel from '../models/categoriaModel.js';

// LISTAR CATEGORIAS
async function obterCategorias(req: Request, res: Response, next: NextFunction) {
  try {
    const categorias = await categoriaModel.read();
    return res.json(categorias);
  } catch (error) {
    next(error);
  }
}

// CADASTRAR CATEGORIA
async function criarCategoria(req: Request, res: Response, next: NextFunction) {
  try {
    const { nome } = req.body;
    const nova = await categoriaModel.create({ nome });
    return res.status(201).json(nova);
  } catch (error) {
    next(error);
  }
}

// ATUALIZAR CATEGORIA (O PUT)
async function atualizarCategoria(req: Request, res: Response, next: NextFunction) {
  try {
    const id = Number(req.params.id); // Converte o ID da URL para número
    const { nome } = req.body;
    
    const atualizada = await categoriaModel.update(id, { nome });
    return res.json(atualizada);
  } catch (error) {
    next(error);
  }
}

// REMOVER CATEGORIA
async function deletarCategoria(req: Request, res: Response, next: NextFunction) {
  try {
    const id = Number(req.params.id); // Converte o ID para número
    await categoriaModel.remove(id);
    return res.status(204).end();
  } catch (error) {
    next(error);
  }
}

export default { obterCategorias, criarCategoria, atualizarCategoria, deletarCategoria };
