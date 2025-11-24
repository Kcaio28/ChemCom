document.getElementById("formLogin").addEventListener("submit", async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const dados = Object.fromEntries(formData.entries());

    const resposta = await fetch("/clienteRotas/login", {
        method: "POST",
        headers: { "Content-type": "application/json" },
        body: JSON.stringify(dados)
    });

    const resultado = await resposta.json();
    if (resposta.ok) {
        localStorage.clear();
        if (resultado.tipo === "usuario") {
            localStorage.setItem("sessaoUsuario", JSON.stringify({
                tipo: "usuario",
                dados: resultado.dados
            }));
        }

        if (resultado.tipo === "adm") {
            localStorage.setItem("sessaoUsuario", JSON.stringify({
                tipo: "adm",
                dados: resultado.dados
            }));
        }

        window.location.href = "/home.html";
    } else {
        alert(resultado.mensagem);
    }
})