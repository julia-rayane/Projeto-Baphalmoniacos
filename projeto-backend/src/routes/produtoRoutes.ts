import { Router } from 'express';
import productController from '../controllers/productController.js';

const router = Router();

router.get('/', productController.obterProdutos);
router.get('/:id', productController.obterProdutoPorId);
router.post('/', productController.criarProduto);
router.put('/:id', productController.atualizarProduto);
router.delete('/:id', productController.deletarProduto);

export default router;
