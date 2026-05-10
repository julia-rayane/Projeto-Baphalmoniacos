import express from 'express';
import morgan from 'morgan';
import cors from 'cors';
import routes from './routes.js'; // Importa o arquivo de rotas

const app = express();

app.use(express.json());
app.use(morgan('dev'));
app.use(cors());

// AJUSTE DO PROFESSOR: Define a pasta public para arquivos estáticos
app.use(express.static('public'));

// Usa as rotas que separamos no outro arquivo
app.use(routes);

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`🚀 Baphalmoníacos API: Servidor rodando em http://localhost:${PORT}`);
});
