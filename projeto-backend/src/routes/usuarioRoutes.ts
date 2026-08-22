import { Router } from 'express';
import { cadastrar, login } from '../controllers/usuarioController';

const usuarioRoutes = Router();

// Rotas públicas de autenticação
usuarioRoutes.post('/signup', cadastrar);
usuarioRoutes.post('/signin', login);

export default usuarioRoutes;
