const express = require('express');
const morgan = require('morgan');
const cors = require('cors');

const app = express();

app.use(express.json());
app.use(morgan('dev'));
app.use(cors());

// Seus produtos do Baphalmoníacos
const produtos = [
    { 
        id: 1, 
        nome: "Tteokbokki", 
        preco: 27.16, 
        foto: "file:///C:/Users/gjuli/Downloads/Copilot_20260426_114931.png" 
    },
    { 
        id: 2, 
        nome: "Buchimgae", 
        preco: 10.98, 
        foto: "https://www.thespruceeats.com/thmb/9W6-7L20lYp6f9yU8lX7r9m1_6o=/1500x0/filters:no_upscale():max_bytes(150000):strip_icc()/korean-pancake-pajeon-2118742-Hero-5b72e9a246e0fb00259e8f6e.jpg" 
    },
    { 
        id: 3, 
        nome: "Lámen Especial", 
        preco: 9.99, 
        foto: "https://cdn.casaogawa.com.br/media/catalog/product/cache/1/image/9df78eab33525d08d6e5fb8d27136e95/n/o/nongshim_shin_ramyun_cup_68g.jpg" 
    }
];
    

app.get('/produtos', (req, res) => {
    res.json(produtos);
});

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`🚀 Baphalmoníacos API: Servidor rodando em http://localhost:${PORT}`);
});