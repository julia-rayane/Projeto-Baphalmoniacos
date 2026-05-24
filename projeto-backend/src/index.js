import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import path from 'path';
import { fileURLToPath } from 'url';

// Importando as rotas do seu projeto
import routes from './routes.js';

// Importando as configurações do banco de dados 
import { getDatabaseConnection } from './database/connection.js';
import { runMigrations } from './database/migrations.js';
import { runSeeds } from './database/seeds.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

app.use(cors());
app.use(morgan('dev'));
app.use(express.json());

// Servir os arquivos front-end (HTML, CSS, Imagens)
app.use(express.static(path.join(__dirname, '../public')));

// Ativando as rotas da API
app.use(routes);

// Função para ligar o banco de dados e depois o servidor
async function startServer() {
  try {
    const db = await getDatabaseConnection();
    
    // Cria as tabelas e coloca os dados do cardápio lá dentro
    await runMigrations(db);
    await runSeeds(db);

    // Liga o servidor na porta 3000
    app.listen(PORT, () => {
      console.log('🚀 Servidor rodando em http://localhost:3000');
    });
  } catch (error) {
    console.error('Erro ao inicializar o banco de dados:', error);
  }
}

// Executa a função acima para dar a partida no projeto
startServer();
