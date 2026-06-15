import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import path from 'path';
import { fileURLToPath } from 'url';

// Importando os novos middlewares usando o padrão alias @/ solicitado pelo professor
import { exigirJson } from '@/middlewares/jsonValidation.ts';
import { manipuladorDeErros } from '@/middlewares/errorHandler.ts';

// Importando temporariamente o arquivo de rotas atual de vocês para não quebrar o fluxo
// @ts-ignore
import rotasAntigas from './routes.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(morgan('dev'));
app.use(express.json());

// 🛡️ Middleware para exigir Content-Type: application/json em POST e PUT
app.use(exigirJson);

app.use(express.static(path.join(__dirname, '../public')));

// Ativando as rotas atuais de vocês
app.use(rotasAntigas);

// 🚨 Middleware centralizado para tratamento de erros (deve ser o último app.use)
app.use(manipuladorDeErros);

app.listen(PORT, () => {
  console.log(`🚀 Servidor Baphalmoniácos rodando em TypeScript na porta ${PORT}`);
});
