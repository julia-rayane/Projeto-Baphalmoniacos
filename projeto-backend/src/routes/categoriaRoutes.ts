import { Router } from 'express';
import categoriaController from '../controllers/categoriaController.js';

const router = Router();

router.get('/', categoriaController.obterCategorias);
router.post('/', categoriaController.criarCategoria);
router.put('/:id', categoriaController.atualizarCategoria);
router.delete('/:id', categoriaController.deletarCategoria);

export default router;
