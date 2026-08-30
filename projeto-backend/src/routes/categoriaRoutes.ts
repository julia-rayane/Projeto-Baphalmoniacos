import { Router } from 'express';
import categoriaController from '../controllers/categoriaController.js';
import { autenticacaoMiddleware } from '../middlewares/autenticacaoMiddleware.js';
import { apenasAdminMiddleware } from '../middlewares/apenasAdminMiddleware.js';

const router = Router();

// Rota pública (qualquer um pode listar)
router.get('/', categoriaController.obterCategorias);

// Rotas protegidas (exigem Token JWT válido E usuário do tipo admin)
router.post('/', autenticacaoMiddleware, apenasAdminMiddleware, categoriaController.criarCategoria);
router.put('/:id', autenticacaoMiddleware, apenasAdminMiddleware, categoriaController.atualizarCategoria);
router.delete('/:id', autenticacaoMiddleware, apenasAdminMiddleware, categoriaController.deletarCategoria);

export default router;
