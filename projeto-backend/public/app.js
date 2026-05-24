let carrinho = [];
let produtosDaAPI = [];

// 1. Busca os produtos no Back-end
function carregarCardapio() {
    fetch("/produtos")
        .then(resposta => resposta.json())
        .then(dados => {
            produtosDaAPI = dados;
            const vitrine = document.getElementById("vitrine");
            vitrine.innerHTML = "";

            dados.forEach(p => {
                vitrine.innerHTML += `
                    <div class="card">
                        <img src="${p.foto}" alt="${p.nome}">
                        <h3>${p.nome}</h3>
                        <p>R$ ${p.preco.toFixed(2)}</p>
                        {/* CORRIGIDO AQUI: Mudou de p.id para p.id_produto */}
                        <button class="btn btn-vermelho" onclick="addAoCarrinho(${p.id_produto})">Adicionar</button>
                    </div>`;
            });
        })
        .catch(erro => console.error("Erro ao carregar os dados da API:", erro));
}

// 2. Adiciona o produto à lista do carrinho
window.addAoCarrinho = function(id) {
    // CORRIGIDO AQUI: Mudou de p.id para p.id_produto
    const prato = produtosDaAPI.find(p => p.id_produto === id);
    if (prato) {
        carrinho.push(prato);
        atualizarCarrinho();
    }
}

// 3. Atualiza a tabela com os nomes que estão no seu HTML
function atualizarCarrinho() {
    const tabelaBody = document.querySelector("#tabela-pedido tbody");
    const campoSoma = document.getElementById("soma-total");
    
    tabelaBody.innerHTML = "";
    let total = 0;

    carrinho.forEach((item, index) => {
        total += item.preco;
        tabelaBody.innerHTML += `
            <tr>
                <td>${item.nome}</td>
                <td>R$ ${item.preco.toFixed(2)}</td>
                <td><button class="btn-remover" onclick="removerItem(${index})">Remover</button></td>
            </tr>`;
    });

    campoSoma.innerText = total.toFixed(2);
}

// 4. Função para remover itens
window.removerItem = function(index) {
    carrinho.splice(index, 1);
    atualizarCarrinho();
}

// 🌟 ADICIONADO AQUI: Força o navegador a rodar a função assim que carregar o arquivo!
carregarCardapio();
