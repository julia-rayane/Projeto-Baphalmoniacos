// IMPORTANTE: precisa ser o PRIMEIRO import, para o .env estar carregado antes dos demais módulos
import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import path from 'path';
import { fileURLToPath } from 'url';

import { manipuladorDeErros } from './middlewares/errorHandler.js';

import produtoRoutes from './routes/produtoRoutes.js';
import categoriaRoutes from './routes/categoriaRoutes.js';
import usuarioRoutes from './routes/usuarioRoutes.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();

app.use(cors());
// O log de requisições só atrapalha a saída dos testes automatizados
if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('dev'));
}
app.use(express.json());

// Arquivos estáticos (HTML, JS e as imagens enviadas em /imgs/profile)
app.use(express.static(path.join(__dirname, '../public')));

// Ativando as rotas do sistema
app.use('/produtos', produtoRoutes);
app.use('/categorias', categoriaRoutes);

// Rotas de usuário: /signup, /signin, /users/me, /users/image
// Também disponíveis com prefixo /api (ex.: POST /api/users/image)
app.use(usuarioRoutes);
app.use('/api', usuarioRoutes);

// Middleware centralizado para tratamento de erros (sempre por último)
app.use(manipuladorDeErros);

// O app é exportado SEM chamar listen(): quem abre a porta é o src/index.ts.
// Assim os testes (supertest) usam o app diretamente, sem subir servidor.
export default app;
