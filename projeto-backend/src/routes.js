import { Router } from 'express';
//aponta para a pasta controllers
import * as ProductController from './controllers/productController.js';

const router = Router();

// Mapeamento das rotas do CRUD de produtos 
router.get('/produtos', ProductController.listProducts);
router.get('/produtos/:id', ProductController.showProduct);
router.post('/produtos', ProductController.addProduct);
router.put('/produtos/:id', ProductController.editProduct);
router.delete('/produtos/:id', ProductController.removeProduct);

export { router };
