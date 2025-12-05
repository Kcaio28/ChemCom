// LISTAR TODOS OS USUÁRIOS
async function carregarUsuarios() {
    const resposta = await fetch("/clienteRotas");
    const dados = await resposta.json();

    const tabela = document.getElementById("listaUsuarios");
    tabela.innerHTML = "";

    dados.usuarios.forEach(usuario => {
        const linha = `
                    <tr>
                        <td>${usuario.id}</td>
                        <td>${usuario.nome}</td>
                        <td>${usuario.email}</td>
                        <td>${usuario.CNPJ}</td>
                        <td>${usuario.Telefone}</td>
                        <td>
                            <button onclick="deletarUsuario(${usuario.id})">
                                Deletar
                            </button>
                        </td>
                    </tr>
                `;
        tabela.innerHTML += linha;
    });
}

// DELETAR (INATIVAR)
async function deletarUsuario(id) {
    if (!confirm("Deseja realmente excluir este usuário?")) return;

    const resposta = await fetch(`/clienteRotas/${id}`, {
        method: "DELETE"
    });

    const resultado = await resposta.json();
    alert(resultado.mensagem);

    carregarUsuarios();
}

// BUSCAR USUÁRIO POR ID
async function buscarUsuario() {
    const id = document.getElementById("buscarId").value;

    if (!id) {
        alert("Digite um ID!");
        return;
    }

    const resposta = await fetch(`/clienteRotas/${id}`);
    const resultado = await resposta.json();

    const div = document.getElementById("resultadoBusca");

    if (!resultado.sucesso) {
        div.innerHTML = `<p style="color:red">${resultado.mensagem}</p>`;
        return;
    }

    const u = resultado.usuario;

    div.innerHTML = `
                <h3>Resultado:</h3>
                <p><strong>ID:</strong> ${u.id}</p>
                <p><strong>Empresa:</strong> ${u.nome}</p>
                <p><strong>Email:</strong> ${u.email}</p>
                <p><strong>CNPJ:</strong> ${u.CNPJ}</p>
                <p><strong>Telefone:</strong> ${u.Telefone}</p>
            `;
}

// Carregar ao iniciar
carregarUsuarios();