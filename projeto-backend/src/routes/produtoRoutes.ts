import { Router } from 'express';
import productController from '../controllers/productController.js';
import { autenticacaoMiddleware } from '../middlewares/autenticacaoMiddleware.js';

const router = Router();

// Rotas públicas (qualquer um pode visualizar)
router.get('/', productController.obterProdutos);
router.get('/:id', productController.obterProdutoPorId);

// Rotas protegidas (exigem o Token JWT no cabeçalho Authorization)
router.post('/', autenticacaoMiddleware, productController.criarProduto);
router.put('/:id', autenticacaoMiddleware, productController.atualizarProduto);
router.delete('/:id', autenticacaoMiddleware, productController.deletarProduto);

export default router;
