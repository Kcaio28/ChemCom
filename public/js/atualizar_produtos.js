document.getElementById("formAtualizarProdutos").addEventListener("submit", async (e) => {
    e.preventDefault();

    const id = prompt("Digite o ID do produto que deseja atualizar:");

    if (!id) {
        alert("ID obrigatório!");
        return;
    }

    const formData = new FormData(e.target);

    const resposta = await fetch(`/api/produtos/update/${id}`, {
        method: "POST",
        body: formData
    });

    const resultado = await resposta.json();
    alert(resultado.mensagem);

    if (resposta.ok) {
        window.location.href = "/catalogo.html";
    }
});
