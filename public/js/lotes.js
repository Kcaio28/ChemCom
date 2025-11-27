async function carregarProdutos() {
    try {
        const resp = await fetch("/api/produtos");
        const dados = await resp.json();

        if (!dados.sucesso || !Array.isArray(dados.dados)) {
            console.error("Resposta inesperada:", dados);
            return;
        }

        const select = document.getElementById("id_produto");

        dados.dados.forEach(prod => {
            const opt = document.createElement("option");
            opt.value = prod.id;
            opt.textContent = prod.nome;
            select.appendChild(opt);
        });

    } catch (erro) {
        console.error("Erro ao carregar produtos:", erro);
    }
}

carregarProdutos();

// Enviar lote para o backend
document.getElementById("formLotes").addEventListener("submit", async (e) => {
    e.preventDefault();

    const form = new FormData(e.target);
    const dados = Object.fromEntries(form);

    const resp = await fetch("/api/lotes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(dados)
    });

    const resultado = await resp.json();
    alert(resultado.mensagem || resultado.erro);
});

document.getElementById("formDeletarLote").addEventListener("submit", async (e) => {
    e.preventDefault();

    const id = document.querySelector("#formDeletarLote input[name='id']").value;

    if (!id) {
        alert("Digite o ID do lote!");
        return;
    }

    const resposta = await fetch(`/api/lotes/${id}`, {
        method: "DELETE"
    });

    const resultado = await resposta.json();
    alert(resultado.mensagem);
});

