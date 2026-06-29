import { Router } from 'express';
import productController from '../controllers/productController.js';

const router = Router();

// Vinculando cada rota ao método do controller 
router.get('/', productController.obterProdutos || productController.listarProdutos);
router.post('/', productController.criarProduto);
router.put('/:id', productController.atualizarProduto);
router.delete('/:id', productController.deletarProduto || productController.removerProduto);

export default router;
