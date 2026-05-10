import express from 'express';
import { produtos } from './data.js'; // Importa os dados que acabamos de criar

const routes = express.Router();

// A rota de listagem de produtos agora mora aqui
routes.get('/produtos', (req, res) => {
    res.json(produtos);
});

// Aqui você pode adicionar as outras rotas do CRUD (Post, Put, Delete) depois
// routes.post('/produtos', (req, res) => { ... });

export default routes;
