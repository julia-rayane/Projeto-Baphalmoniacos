import { Router } from 'express';
import categoriaController from '../controllers/categoriaController.js';
import { autenticacaoMiddleware } from '../middlewares/autenticacaoMiddleware.js';

const router = Router();

// Rota pública (qualquer um pode listar)
router.get('/', categoriaController.obterCategorias);

// Rotas protegidas (exigem Token JWT)
router.post('/', autenticacaoMiddleware, categoriaController.criarCategoria);
router.put('/:id', autenticacaoMiddleware, categoriaController.atualizarCategoria);
router.delete('/:id', autenticacaoMiddleware, categoriaController.deletarCategoria);

export default router;
