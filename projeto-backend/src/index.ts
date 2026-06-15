import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import path from 'path';
import { fileURLToPath } from 'url';

// Importando os middlewares com alias @/
import { exigirJson } from '@/middlewares/jsonValidation.ts';
import { manipuladorDeErros } from '@/middlewares/errorHandler.ts';

// Importando o novo roteador de produtos em TypeScript
import produtoRoutes from '@/routes/produtoRoutes.ts';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(morgan('dev'));
app.use(express.json());

// 🛡️ Middleware para exigir Content-Type: application/json em POST e PUT
app.use(exigirJson);

app.use(express.static(path.join(__dirname, '../public')));

// Ativando o roteador de produtos na rota /produtos
app.use('/produtos', produtoRoutes);

// 🚨 Middleware centralizado para tratamento de erros
app.use(manipuladorDeErros);

app.listen(PORT, () => {
  console.log(`🚀 Servidor Baphalmoniácos rodando em TypeScript na porta ${PORT}`);
});
