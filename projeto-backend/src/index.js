import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import path from 'path';
import { fileURLToPath } from 'url';

// Importa o router que exportamos com chaves { router } no routes.js
import { router } from './routes.js';

//puxa do arquivo novo 'database.js'
import { conectarBanco } from './database/database.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

app.use(cors());
app.use(morgan('dev'));
app.use(express.json());

app.use(express.static(path.join(__dirname, '../public')));

// Usa a variável router que importou lá em cima
app.use(router);

async function startServer() {
  try {
    // Testa a conexão com o banco de dados antes de abrir o servidor
    await conectarBanco();
    console.log('📦 Banco de dados SQLite conectado com sucesso!');

    app.listen(PORT, () => {
      console.log(`🚀 Servidor rodando em http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('Erro ao inicializar o projeto:', error);
  }
}

startServer();
