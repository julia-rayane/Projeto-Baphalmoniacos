import { Router } from 'express';
import { 
  listarCategorias, 
  buscarCategoria, 
  criarCategoria, 
  removerCategoria 
} from '../controllers/categoriaController.js';

const router = Router();

router.get('/', listarCategorias);
router.get('/:id', buscarCategoria);
router.post('/', criarCategoria);
router.delete('/:id', removerCategoria);

export default router;
