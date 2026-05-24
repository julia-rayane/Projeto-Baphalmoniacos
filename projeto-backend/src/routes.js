import { Router } from 'express';
// Importa todas as funções lógicas que você acabou de criar no Controller
import * as ProductController from './controllers/productController.js';

const routes = Router();

// Mapeamento das rotas do CRUD de produtos 
routes.get('/produtos', ProductController.listProducts);
routes.get('/produtos/:id', ProductController.showProduct);
routes.post('/produtos', ProductController.addProduct);
routes.put('/produtos/:id', ProductController.editProduct);
routes.delete('/produtos/:id', ProductController.removeProduct);

export default routes;
