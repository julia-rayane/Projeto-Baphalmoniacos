import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import path from 'path';
import { fileURLToPath } from 'url';

// Importando os middlewares com caminhos relativos
import { exigirJson } from './middlewares/jsonValidation.js';
import { manipuladorDeErros } from './middlewares/errorHandler.js';

// Importando os roteadores em TypeScript
import produtoRoutes from './routes/produtoRoutes.js';
import categoriaRoutes from './routes/categoriaRoutes.js'; // 👈 Adicionado aqui!

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(morgan('dev'));
app.use(express.json());

// 🛡️ Middleware para exigir Content-Type: application/json em POST e PUT
app.use(exigirJson);

app.use(express.static(path.join(__dirname, '../public')));

// Ativando as rotas do sistema
app.use('/produtos', produtoRoutes);
app.use('/categorias', categoriaRoutes); // 👈 Adicionado aqui!

// 🚨 Middleware centralizado para tratamento de erros
app.use(manipuladorDeErros);

app.listen(PORT, () => {
  console.log(`🚀 Servidor Baphalmoniácos rodando em TypeScript na porta ${PORT}`);
});
