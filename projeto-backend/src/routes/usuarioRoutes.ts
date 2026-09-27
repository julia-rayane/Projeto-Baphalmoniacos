import { Router } from 'express';
import { cadastrar, login } from '../controllers/usuarioController'; 

const usuarioRoutes = Router();

usuarioRoutes.post('/signup', cadastrar);
usuarioRoutes.post('/signin', login);

export default usuarioRoutes;
