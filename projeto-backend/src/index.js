import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import path from 'path';
import { fileURLToPath } from 'url';

// Importando as rotas do seu projeto
import routes from './routes.js';

// CORRIGIDO: Puxando tudo direto do único arquivo real que está na pasta database (connection.js)
import { getDatabaseConnection, runMigrations, runSeeds } from './database/connection.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

// Middlewares
app.use(cors());
app.use(morgan('dev'));
app.use(express.json());

// Servir os arquivos do seu front-end (public fica fora de src)
app.use(express.static(path.join(__dirname, '../public')));

// Ativando as rotas da API
app.use(routes);

// Inicialização baseada nas funções do connection.js
async function startServer() {
  try {
    // Abre a conexão com o banco de dados
    const db = await getDatabaseConnection();
    console.log('📦 Banco de dados SQLite conectado!');
    
    // Executa as migrações (cria as tabelas) e as sementes (coloca os dados) do connection.js
    await runMigrations(db);
    await runSeeds(db);

    // Liga o servidor na porta 3000
    app.listen(PORT, () => {
      console.log('🚀 Servidor rodando em http://localhost:3000');
    });
  } catch (error) {
    console.error('Erro ao inicializar o projeto:', error);
  }
}

startServer();
