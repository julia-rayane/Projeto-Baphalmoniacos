import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import path from 'path';
import { fileURLToPath } from 'url';

// Importando as rotas do seu projeto
import routes from './routes.js';

// CORRIGIDO: Agora aponta exatamente para os arquivos reais da sua pasta database
import { getDatabaseConnection } from './database/connection.js';
import { runMigrations } from './database/migrations.js';
import { runSeeds } from './database/seeds.js';

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

// Inicialização corrigida para rodar as tabelas e seeds da sua pasta
async function startServer() {
  try {
    // Abre a conexão com o banco de dados
    const db = await getDatabaseConnection();
    console.log('📦 Banco de dados SQLite conectado!');
    
    // Executa as migrações (cria as tabelas) e as sementes (coloca os dados)
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
