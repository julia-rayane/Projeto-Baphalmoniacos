let carrinho = [];
let produtosDaAPI = [];

// 1. Busca os produtos no Back-end com ajuste automático de imagem e ID seguro
function carregarCardapio() {
    fetch("/produtos")
        .then(resposta => resposta.json())
        .then(dados => {
            produtosDaAPI = dados;
            const vitrine = document.getElementById("vitrine");
            if (!vitrine) return;
            
            vitrine.innerHTML = "";

            dados.forEach(p => {
                // Identifica o ID correto de forma segura (caso seja p.id ou p.id_produto)
                const idSeguro = p.id_produto || p.id;

                // MÁGICA DA FOTO: Se p.foto estiver vazio, escolhe a imagem certa pelo nome!
                let imagemFinal = p.foto;

                if (!imagemFinal) {
                    const nomeMinusculo = p.nome ? p.nome.toLowerCase() : '';
                    if (nomeMinusculo.includes('tteokbokki')) {
                        imagemFinal = 'tteokbokki.png';
                    } else if (nomeMinusculo.includes('buchimgae')) {
                        imagemFinal = 'buchimgae.png';
                    } else if (nomeMinusculo.includes('lamen') || nomeMinusculo.includes('lámen')) {
                        imagemFinal = 'lamen.png';
                    } else {
                        imagemFinal = 'lamen.png'; // Foto padrão de segurança
                    }
                }

                vitrine.innerHTML += `
                    <div class="card">
                        <img src="${imagemFinal}" alt="${p.nome || 'Prato'}">
                        <h3>${p.nome}</h3>
                        <p style="font-weight: bold; color: var(--vermelho); margin-bottom: 5px;">R$ ${Number(p.preco).toFixed(2)}</p>
                        
                        <p style="font-size: 0.85rem; color: #666; margin: 10px 0; min-height: 40px; line-height: 1.4;">
                            ${p.descricao || ''}
                        </p>
                        
                        <button class="btn btn-vermelho" onclick="addAoCarrinho(${idSeguro})">Adicionar</button>
                    </div>`;
            });
        })
        .catch(erro => console.error("Erro ao carregar os dados da API:", erro));
}

// 2. Adiciona o produto à lista do carrinho buscando por qualquer um dos formatos de ID
window.addAoCarrinho = function(id) {
    const prato = produtosDaAPI.find(p => (p.id_produto === id || p.id === id));
    if (prato) {
        carrinho.push(prato);
        atualizarCarrinho();
    }
}

// 3. Atualiza a tabela com os nomes que estão no seu HTML
function atualizarCarrinho() {
    const tabelaBody = document.querySelector("#tabela-pedido tbody");
    const campoSoma = document.getElementById("soma-total");
    
    if (!tabelaBody || !campoSoma) return;
    
    tabelaBody.innerHTML = "";
    let total = 0;

    carrinho.forEach((item, index) => {
        total += Number(item.preco);
        tabelaBody.innerHTML += `
            <tr>
                <td>${item.nome}</td>
                <td>R$ ${Number(item.preco).toFixed(2)}</td>
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

// Inicializa a vitrine
carregarCardapio();
