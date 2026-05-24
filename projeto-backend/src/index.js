import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import path from 'path';
import { fileURLToPath } from 'url';

// Importando as rotas do seu projeto
import routes from './routes.js';

// Ajustado para o nome real do arquivo do seu professor (database.js e load.js)
import connect from './database/database.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

// Middlewares
app.use(cors());
app.use(morgan('dev'));
app.use(express.json());

// Servir os arquivos do seu front-end
app.use(express.static(path.join(__dirname, '../public')));

// Ativando as rotas da API
app.use(routes);

// Inicialização baseada no seu professor
async function startServer() {
  try {
    // Abre a conexão com o banco db.sqlite
    await connect();
    console.log('📦 Banco de dados SQLite conectado!');

    // Liga o servidor na porta 3000
    app.listen(PORT, () => {
      console.log('🚀 Servidor rodando em http://localhost:3000');
    });
  } catch (error) {
    console.error('Erro ao inicializar o projeto:', error);
  }
}

startServer();
