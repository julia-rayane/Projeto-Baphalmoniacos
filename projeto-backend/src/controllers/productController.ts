import { Request, Response, NextFunction } from 'express';
import produtoModel from '@/models/produtoModel.ts';
import { HttpError } from '@/errors/HttpError.ts';

// 1. LISTAR TODOS OS PRODUTOS
export async function listarProdutos(req: Request, res: Response, next: NextFunction) {
  try {
    const produtos = await produtoModel.listarTodos();
    res.json(produtos);
  } catch (error) {
    next(error); // Encaminha o erro para o nosso errorHandler centralizado
  }
}

// 2. BUSCAR PRODUTO POR ID
export async function buscarProduto(req: Request, res: Response, next: NextFunction) {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      throw new HttpError(400, 'O ID fornecido deve ser numérico.');
    }

    const produto = await produtoModel.buscarPorId(id);
    if (!produto) {
      throw new HttpError(404, 'Produto não encontrado.');
    }

    res.json(produto);
  } catch (error) {
    next(error);
  }
}

// 3. CRIAR NOVO PRODUTO
export async function criarProduto(req: Request, res: Response, next: NextFunction) {
  try {
    const { nome, descricao, preco, foto, id_categoria_fk } = req.body;
    
    // Validação de campos obrigatórios simples
    if (!nome || !preco || !id_categoria_fk) {
      throw new HttpError(400, 'Campos obrigatórios: nome, preco e id_categoria_fk.');
    }

    const novoId = await produtoModel.criar({ nome, descricao, preco, foto, id_categoria_fk });
    res.status(201).json({ id: novoId, mensagem: 'Produto criado com sucesso.' });
  } catch (error) {
    next(error);
  }
}

// 4. ATUALIZAR PRODUTO EXISTENTE
export async function atualizarProduto(req: Request, res: Response, next: NextFunction) {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      throw new HttpError(400, 'ID inválido.');
    }

    const { nome, descricao, preco, foto, id_categoria_fk } = req.body;
    if (!nome || !preco || !id_categoria_fk) {
      throw new HttpError(400, 'Campos obrigatórios ausentes para atualização.');
    }

    const sucesso = await produtoModel.atualizar(id, { nome, descricao, preco, foto, id_categoria_fk });
    if (!sucesso) {
      throw new HttpError(404, 'Produto não encontrado para atualização.');
    }

    res.json({ mensagem: 'Produto atualizado com sucesso.' });
  } catch (error) {
    next(error);
  }
}

// 5. EXCLUIR PRODUTO
export async function removerProduto(req: Request, res: Response, next: NextFunction) {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      throw new HttpError(400, 'ID inválido.');
    }

    const sucesso = await produtoModel.excluir(id);
    if (!sucesso) {
      throw new HttpError(404, 'Produto não encontrado para exclusão.');
    }

    res.json({ mensagem: 'Produto removido com sucesso.' });
  } catch (error) {
    next(error);
  }
}
