import { Router } from 'express';
import { cadastrar, login } from '../controllers/usuarioController.js';
import { validate } from '../middlewares/validate.js';
import { usuarioSchema } from '../schemas/usuarioSchema.js';

const usuarioRoutes = Router();

usuarioRoutes.post('/signup', validate(usuarioSchema), cadastrar);
usuarioRoutes.post('/signin', login);

export default usuarioRoutes;
