import { Router } from 'express';
import multer from 'multer';
import { cadastrar, login, me, uploadAvatar } from '../controllers/usuarioController.js';
import { validate } from '../middlewares/validate.js';
import { usuarioSchema } from '../schemas/usuarioSchema.js';
import { autenticacaoMiddleware } from '../middlewares/autenticacaoMiddleware.js';
import multerConfig from '../config/multer.js';

const usuarioRoutes = Router();
const upload = multer(multerConfig);

usuarioRoutes.post('/signup', validate(usuarioSchema), cadastrar);
usuarioRoutes.post('/signin', login);

// Dados do usuário logado (nome, e-mail e caminho da imagem)
usuarioRoutes.get('/users/me', autenticacaoMiddleware, me);

// Upload (POST) e atualização (PUT) da imagem do usuário.
// ORDEM IMPORTA: 1º autenticação (sem token => 401 sem processar o arquivo),
// 2º Multer (valida tamanho/tipo e grava em disco), 3º controller (grava no banco).
usuarioRoutes.post(
  '/users/image',
  autenticacaoMiddleware,
  upload.single('image'),
  uploadAvatar
);

usuarioRoutes.put(
  '/users/image',
  autenticacaoMiddleware,
  upload.single('image'),
  uploadAvatar
);

export default usuarioRoutes;
