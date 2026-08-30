import { Router } from 'express';
import productController from '../controllers/productController.js';
import { autenticacaoMiddleware } from '../middlewares/autenticacaoMiddleware.js';
import { apenasAdminMiddleware } from '../middlewares/apenasAdminMiddleware.js';

const router = Router();

// Rotas públicas (qualquer um pode visualizar)
router.get('/', productController.obterProdutos);
router.get('/:id', productController.obterProdutoPorId);

// Rotas protegidas (exigem Token JWT válido E usuário do tipo admin)
router.post('/', autenticacaoMiddleware, apenasAdminMiddleware, productController.criarProduto);
router.put('/:id', autenticacaoMiddleware, apenasAdminMiddleware, productController.atualizarProduto);
router.delete('/:id', autenticacaoMiddleware, apenasAdminMiddleware, productController.deletarProduto);

export default router;
