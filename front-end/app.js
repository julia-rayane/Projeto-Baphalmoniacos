import { produtos } from './dados.js';

const vitrine = document.getElementById("vitrine");
let carrinho = [];

// Geração Dinâmica
export function carregarCardapio() {
    vitrine.innerHTML = "";
    produtos.forEach(p => {
        vitrine.innerHTML += `
            <div class="card">
                <img src="${p.foto}">
                <h3>${p.nome}</h3>
                <p>R$ ${p.preco.toFixed(2)}</p>
                <button onclick="addAoCarrinho(${p.id})">Adicionar</button>
            </div>`;
    });
}

// Manipulação de Eventos
window.addAoCarrinho = (id) => {
    const item = produtos.find(p => p.id === id);
    carrinho.push({...item, cartId: Date.now()});
    console.log("Carrinho atual:", carrinho);
    alert(`${item.nome} adicionado!`);
};

document.addEventListener("DOMContentLoaded", carregarCardapio);
