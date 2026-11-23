// Recupera os itens salvos do carrinho ou inicia uma lista vazia
let carrinho = JSON.parse(localStorage.getItem("carrinho")) || [];
let produtosDaAPI = [];

// 1. Busca os produtos no Back-end alinhado com o banco SQLite
function carregarCardapio() {
    const vitrine = document.getElementById("vitrine");
    if (!vitrine) return; // Se não estiver na página do cardápio, para aqui

    fetch("/produtos")
        .then(resposta => resposta.json())
        .then(dados => {
            produtosDaAPI = dados;
            vitrine.innerHTML = "";

            dados.forEach(p => {
                // MÁGICA DA FOTO: Se p.foto estiver vazio, escolhe a imagem certa pelo nome
                let imagemFinal = p.foto;

                if (!imagemFinal) {
                    const nomeMinusculo = p.nome ? p.nome.toLowerCase() : '';
                    if (nomeMinusculo.includes('tteokbokki')) {
                        imagemFinal = 'tteokbokki.png';
                    } else if (nomeMinusculo.includes('buchimgae')) {
                        imagemFinal = 'buchimgae.png';
                    } else if (nomeMinusculo.includes('lamen') || nomeMinusculo.includes('lámen')) {
                        imagemFinal = 'lámen.png'; // Nome corrigido com acento
                    } else {
                        imagemFinal = 'lámen.png'; // Foto padrão de segurança
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
                        
                        <button class="btn btn-vermelho" onclick="addAoCarrinho(${p.id})">Adicionar ao Carrinho</button>
                    </div>`;
            });
        })
        .catch(erro => console.error("Erro ao carregar os dados da API:", erro));
}

// 2. Adiciona o produto à lista do carrinho buscando pelo ID correto
window.addAoCarrinho = function(id) {
    const prato = produtosDaAPI.find(p => p.id === id);
    if (prato) {
        carrinho.push(prato);
        // Salva a lista atualizada no navegador
        localStorage.setItem("carrinho", JSON.stringify(carrinho));
        alert(`${prato.nome} foi adicionado ao seu carrinho!`);
    }
}

// 3. Atualiza a tabela com os nomes na página carrinho.html
function atualizarCarrinho() {
    const tabelaBody = document.querySelector("#tabela-pedido tbody");
    const campoSoma = document.getElementById("soma-total");
    
    if (!tabelaBody || !campoSoma) return; // Se não estiver na página do carrinho, para aqui
    
    tabelaBody.innerHTML = "";
    let total = 0;

    if (carrinho.length === 0) {
        tabelaBody.innerHTML = `<tr><td colspan="3" style="text-align:center; color:#888;">Seu carrinho está vazio.</td></tr>`;
        campoSoma.innerText = "0.00";
        return;
    }

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

// 4. Função para remover itens do carrinho
window.removerItem = function(index) {
    carrinho.splice(index, 1);
    localStorage.setItem("carrinho", JSON.stringify(carrinho));
    atualizarCarrinho();
}

// 5. Finalizar pedido
window.finalizar = function() {
    if (carrinho.length === 0) {
        alert("Seu carrinho está vazio!");
        return;
    }
    alert("Pedido realizado com sucesso!");
    carrinho = [];
    localStorage.removeItem("carrinho");
    atualizarCarrinho();
}

// ===== AVATAR NO CABEÇALHO (aparece em todas as telas que carregam este arquivo) =====
const AVATAR_PADRAO = "/imgs/avatar-padrao.svg";

// Coloca a foto ao lado do link "Meu Perfil". Se src for vazio, usa a imagem padrão.
window.atualizarAvatarCabecalho = function (src) {
    const link = document.querySelector('.nav-links a[href="perfil.html"]');
    if (!link) return;

    let img = link.querySelector(".avatar-nav");
    if (!img) {
        img = document.createElement("img");
        img.className = "avatar-nav";
        img.alt = "Foto de perfil";
        img.style.cssText = "width:28px;height:28px;border-radius:50%;object-fit:cover;vertical-align:middle;margin-right:8px;border:2px solid white;background:#fff;";
        link.prepend(img);
    }
    img.src = src || AVATAR_PADRAO;
};

// Busca o usuário logado e mostra a foto dele no cabeçalho
async function carregarAvatarCabecalho() {
    const token = localStorage.getItem("token");
    if (!token) return; // visitante: não mostra avatar

    try {
        const resposta = await fetch("/api/users/me", {
            headers: { "Authorization": `Bearer ${token}` }
        });
        if (!resposta.ok) return;

        const usuario = await resposta.json();
        window.atualizarAvatarCabecalho(usuario.image ? usuario.image.path : null);
    } catch (erro) {
        // sem conexão: mantém o cabeçalho como está
    }
}

document.addEventListener("DOMContentLoaded", () => {
    carregarCardapio();
    atualizarCarrinho();
    carregarAvatarCabecalho();
});
