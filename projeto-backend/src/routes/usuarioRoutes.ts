import { Router } from 'express';
import multer from 'multer';
import { cadastrar, login, uploadAvatar } from '../controllers/usuarioController.js';
import { validate } from '../middlewares/validate.js';
import { usuarioSchema } from '../schemas/usuarioSchema.js';
import { autenticacaoMiddleware } from '../middlewares/autenticacaoMiddleware.js';
import multerConfig from '../config/multer.js';

const usuarioRoutes = Router();
const upload = multer(multerConfig);

usuarioRoutes.post('/signup', validate(usuarioSchema), cadastrar);
usuarioRoutes.post('/signin', login);

// Rotas de Upload de Avatar (POST e PUT)
usuarioRoutes.post(
  '/users/image',
  autenticacaoMiddleware, // Executa 1º: devolve 401 se sem token antes de guardar o ficheiro
  upload.single('file'),  // Executa 2º: valida tamanho (2MB), tipo MIME e grava em disco
  uploadAvatar
);

usuarioRoutes.put(
  '/users/image',
  autenticacaoMiddleware,
  upload.single('file'),
  uploadAvatar
);

export default usuarioRoutes;
