import express from 'express';
import { produtos } from './data.js';

const routes = express.Router();

// Rota de Leitura (que você já tinha)
routes.get('/produtos', (req, res) => {
    res.json(produtos);
});

// --- O CRUD COMPLETO (SÓ AS ROTAS POR ENQUANTO) ---

// Rota de Criação (POST)
routes.post('/produtos', (req, res) => { 
    res.send('Aqui você criaria um produto'); 
});

// Rota de Atualização (PUT)
routes.put('/produtos/:id', (req, res) => { 
    res.send('Aqui você editaria um produto'); 
});

// Rota de Exclusão (DELETE)
routes.delete('/produtos/:id', (req, res) => { 
    res.send('Aqui você deletaria um produto'); 
});

export default routes; // <--- Essa linha tem que ser sempre a última!
