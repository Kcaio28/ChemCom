document.getElementById("formDeletarProdutos").addEventListener("submit", async (e) => {
    e.preventDefault();

    const id = document.querySelector("input[name='id']").value;

    const resposta = await fetch(`/api/produtos/${id}`, {
        method: "DELETE"
    });

    const resultado = await resposta.json();
    alert(resultado.mensagem);

    if (resultado.sucesso) {
        window.location.href = "/catalogo.html";
    }
});
