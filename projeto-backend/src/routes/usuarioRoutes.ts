import { Router } from 'express';
import { cadastrar, login } from '../controllers/usuarioController'; 
import { validate } from '../middlewares/validate';
import { usuarioSchema } from '../schemas/usuarioSchema'; // Ajuste o nome/caminho conforme o arquivo schema

const usuarioRoutes = Router();

usuarioRoutes.post('/signup', validate(usuarioSchema), cadastrar);
usuarioRoutes.post('/signin', login);

export default usuarioRoutes;
