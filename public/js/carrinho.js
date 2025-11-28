function getCarrinho() {
    const usuario = JSON.parse(localStorage.getItem("sessaoUsuario"));
    if (!usuario) return [];
    const chave = `carrinho_${usuario.id}`;
    return JSON.parse(localStorage.getItem(chave)) || [];
}

function salvarCarrinho(carrinho) {
    const usuario = JSON.parse(localStorage.getItem("sessaoUsuario"));
    if (!usuario) return;
    const chave = `carrinho_${usuario.id}`;
    localStorage.setItem(chave, JSON.stringify(carrinho));
}

function removerDoCarrinho(id) {
    let carrinho = getCarrinho();
    carrinho = carrinho.filter(item => item.id_produto !== id);
    salvarCarrinho(carrinho);
    carregarCarrinho();
}

function mudarQuantidade(id, delta) {
    let carrinho = getCarrinho();
    const item = carrinho.find(p => p.id_produto === id);

    if (!item) return;

    item.quantidade += delta;

    if (item.quantidade <= 0) {
        removerDoCarrinho(id);
        return;
    }

    salvarCarrinho(carrinho);
    carregarCarrinho();
}

function carregarCarrinho() {
    const carrinho = getCarrinho();
    const lista = document.getElementById("listaCarrinho");
    lista.innerHTML = "";

    let total = 0;

    carrinho.forEach(item => {
        total += item.preco * item.quantidade;

        lista.innerHTML += `
            <div class="card mb-3">
                <div class="card-body d-flex align-items-center justify-content-between">
                    
                    <div class="d-flex align-items-center">
                        <img src="../uploads/imagens/${item.imagem}" width="80" class="rounded me-3">
                        <div>
                            <h5>${item.nome}</h5>
                            <p>Preço: R$ ${item.preco.toFixed(2)}</p>
                        </div>
                    </div>

                    <div class="d-flex align-items-center">
                        <button class="btn btn-secondary btn-sm" onclick="mudarQuantidade(${item.id_produto}, -1)">-</button>

                        <span class="mx-3">${item.quantidade}</span>

                        <button class="btn btn-secondary btn-sm" onclick="mudarQuantidade(${item.id_produto}, 1)">+</button>
                    </div>

                    <button class="btn btn-danger" onclick="removerDoCarrinho(${item.id_produto})">Remover</button>
                </div>
            </div>
        `;
    });

    document.getElementById("totalCompra1").innerText = total.toFixed(2);
    document.getElementById("totalCompra").innerText = total.toFixed(2);
}

carregarCarrinho();

async function finalizarCompra() {
    const carrinho = getCarrinho();
    const sessao = JSON.parse(localStorage.getItem("sessaoUsuario"));

    if (!sessao || !sessao.dados || !sessao.dados.id) {
        alert("Você precisa estar logado!");
        return;
    }

    const usuarioId = sessao.dados.id;

    if (carrinho.length === 0) {
        alert("Seu carrinho está vazio!");
        return;
    }

    const itensFormatados = carrinho.map(item => ({
        id_produto: item.id_produto,
        qtd: item.quantidade,
        preco: item.preco
    }));

    const resposta = await fetch("/api/pedidos/finalizar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            id_cliente: usuarioId,
            itens: itensFormatados
        })
    });

    const dados = await resposta.json();

    if (!dados.sucesso) {
        alert("Erro: " + dados.erro);
        return;
    }

    alert("Pedido finalizado com sucesso!");

    localStorage.removeItem(`carrinho_${usuarioId}`);
    location.href = "confirmacao.html";
}


document.querySelector(".btn-finalizar-pagamento")
    .addEventListener("click", finalizarCompra);