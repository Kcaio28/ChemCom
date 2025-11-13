document.getElementById("formCadastro").addEventListener("submit", async (e) => {
    e.preventDefault();

    const formData = new FormData(e.target);
    const dados = Object.fromEntries(formData.entries());

    const resposta = await fetch("/clienteRotas/cadastro", {
        method: "POST",
        headers: { "Content-type": "application/json" },
        body: JSON.stringify(dados)
    });

    const resultado = await resposta.json();
    alert(resultado.mensagem || "Cadastro realizado!");
    if(resposta.ok) {
        window.location.href = "/login_cliente.html";
    }
});