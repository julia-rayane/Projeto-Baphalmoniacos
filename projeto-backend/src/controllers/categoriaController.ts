import { Request, Response, NextFunction } from 'express';
import categoriaModel from '../models/categoriaModel.js';
import { HttpError } from '../errors/HttpError.js';

// 1. LISTAR TODAS AS CATEGORIAS
export async function listarCategorias(req: Request, res: Response, next: NextFunction) {
  try {
    const categorias = await categoriaModel.listarTodas();
    res.json(categorias);
  } catch (error) {
    next(error);
  }
}

// 2. BUSCAR CATEGORIA POR ID
export async function buscarCategoria(req: Request, res: Response, next: NextFunction) {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      throw new HttpError(400, 'O ID fornecido deve ser numérico.');
    }

    const categoria = await categoriaModel.buscarPorId(id);
    if (!categoria) {
      throw new HttpError(404, 'Categoria não encontrada.');
    }

    res.json(categoria);
  } catch (error) {
    next(error);
  }
}

// 3. CRIAR NOVA CATEGORIA
export async function criarCategoria(req: Request, res: Response, next: NextFunction) {
  try {
    const { nome } = req.body;
    if (!nome) {
      throw new HttpError(400, 'O campo nome é obrigatório.');
    }

    const novoId = await categoriaModel.criar({ nome });
    res.status(201).json({ id: novoId, mensagem: 'Categoria criada com sucesso.' });
  } catch (error) {
    next(error);
  }
}

// 4. EXCLUIR CATEGORIA
export async function removerCategoria(req: Request, res: Response, next: NextFunction) {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      throw new HttpError(400, 'ID inválido.');
    }

    const sucesso = await categoriaModel.excluir(id);
    if (!sucesso) {
      throw new HttpError(404, 'Categoria não encontrada para exclusão.');
    }

    res.json({ mensagem: 'Categoria removida com sucesso.' });
  } catch (error) {
    next(error);
  }
}
