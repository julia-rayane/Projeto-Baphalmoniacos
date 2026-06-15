import { Router } from 'express';
// Importando as funções do controlador de produtos usando o alias @/
import { 
  listarProdutos, 
  buscarProduto, 
  criarProduto, 
  atualizarProduto, 
  removerProduto 
} from '../controllers/productController.js'; // Usando caminho relativo e .js

const router = Router();

// Vinculando cada rota ao seu respectivo método do controller
router.get('/', listarProdutos);
router.get('/:id', buscarProduto);
router.post('/', criarProduto);
router.put('/:id', atualizarProduto);
router.delete('/:id', removerProduto);

export default router;
