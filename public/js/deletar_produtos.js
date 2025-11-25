document.getElementById("formDeletarProdutos").addEventListener("submit", async (e) => {
    e.preventDefault();

    const formData = new FormData(e.target);

    const resposta = await fetch("/api/produtos/deletar", {
        method: "POST",
        body: formData // IMPORTANTE: sem headers!
    });

    const resultado = await resposta.json();
    alert(resultado.mensagem);

    if (resposta.ok) {
        window.location.href = "/catalogo.html";
    }
});