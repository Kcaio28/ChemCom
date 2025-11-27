document.addEventListener("DOMContentLoaded", async () => {
    const container = document.getElementById("container");

    try {
        const resposta = await fetch("http://localhost:3000/api/produtos");
        const json = await resposta.json();

        console.log("Retorno da API:", json);

        const produtos = json.dados || json.produtos || json || [];

        if (!Array.isArray(produtos)) {
            throw new Error("A API não retornou um array de produtos.");
        }

        produtos.forEach(prod => {
            const div = document.createElement("div");  
            div.classList.add("col-xl-4", "col-lg-6", "col-md-6", "col-sm-12");

            div.innerHTML = `
              <div class="card produto-card">
                <div class="card-img-wrapper">
                  <img src="../uploads/imagens/${prod.imagem1}" alt="${prod.nome}" class="card-img-top">
                </div>
                <div class="card-body">
                  <h5 class="produto-nome">${prod.nome}</h5>
                  <p class="produto-empresa">Classificação: ${prod.classificacao_nome}</p>
                  <p class="produto-preco">Preço: R$ ${Number(prod.preco).toFixed(2)}</p>
                  <a href="/produto.html"><button class="btn btn-comprar">Comprar</button></a>
                </div>
              </div>
            `;

            container.appendChild(div);
        });
    } catch (err) {
        console.error("Erro ao carregar produtos:", err);
    }
});
