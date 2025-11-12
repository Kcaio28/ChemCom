document.getElementById("formLogin").addEventListener("submit", async (e) => {
    e.preventDefault();
    const formData = new formData(e.target);
    const dados = Object.fromEntries(formData.entries());

    const resposta = await fetch("/usuarios/login", {
        method: "POST",
        headers: { "Content-type": "application/json" },
        body: JSON.stringify(dados)
    });

    const resultado = await resposta.json();
    if (resposta.ok) {
        alert("Login realizado com sucesso!");
        localStorage.setItem("empresa", JSON.stringify(resultado.usuario));
        window.location.href = "/dashboard.html";
    } else {
        alert(resultado.mensagem);
    }
})