// Carregar produtos no select
async function carregarProdutosSelect() {
    try {
        const response = await fetch("/api/produtos?limite=100&pagina=1");
        const json = await response.json();

        const select = document.getElementById("selectProduto");
        select.innerHTML = '<option value="">Selecione um produto...</option>';

        const lista = json.dados || json.produtos || json.lista || [];

        lista.forEach(produto => {
            const option = document.createElement("option");
            option.value = produto.id;
            option.textContent = `${produto.nome} (ID: ${produto.id})`;
            select.appendChild(option);
        });

    } catch (error) {
        console.error("Erro ao carregar produtos:", error);
        const select = document.getElementById("selectProduto");
        select.innerHTML = '<option value="">Erro ao carregar produtos</option>';
    }
}

// Cadastrar Produto
document.getElementById("formCadastroProdutos").addEventListener("submit", async (e) => {
    e.preventDefault();

    const btn = e.target.querySelector('button[type="submit"]');
    const textoOriginal = btn.innerHTML;
    btn.disabled = true;
    btn.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Cadastrando...';

    try {
        const formData = new FormData(e.target);

        const response = await fetch("/api/produtos/criar", {
            method: "POST",
            body: formData
        });

        const resultado = await response.json();

        if (response.ok) {
            alert("✅ Produto cadastrado com sucesso!");
            e.target.reset();
            await carregarProdutosSelect(); // Atualizar select de produtos
        } else {
            alert("❌ " + (resultado.mensagem || "Erro ao cadastrar produto"));
        }
    } catch (error) {
        console.error("Erro:", error);
        alert("❌ Erro ao cadastrar produto. Tente novamente.");
    } finally {
        btn.disabled = false;
        btn.innerHTML = textoOriginal;
    }
});

// Cadastrar Lote
document.getElementById("formCadastroLote").addEventListener("submit", async (e) => {
    e.preventDefault();

    const btn = e.target.querySelector('button[type="submit"]');
    const textoOriginal = btn.innerHTML;
    btn.disabled = true;
    btn.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Cadastrando...';

    try {
        const formData = new FormData(e.target);
        const dados = Object.fromEntries(formData);

        const response = await fetch("/api/lotes", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(dados)
        });

        const resultado = await response.json();

        if (response.ok) {
            alert("✅ Lote cadastrado com sucesso!");
            e.target.reset();
            await carregarLotes(); // Atualizar tabela
        } else {
            alert("❌ " + (resultado.erro || resultado.mensagem || "Erro ao cadastrar lote"));
        }
    } catch (error) {
        console.error("Erro:", error);
        alert("❌ Erro ao cadastrar lote. Tente novamente.");
    } finally {
        btn.disabled = false;
        btn.innerHTML = textoOriginal;
    }
});

// Excluir Lote
document.getElementById("formExcluirLote").addEventListener("submit", async (e) => {
    e.preventDefault();

    const id = e.target.querySelector('input[name="id"]').value;

    if (!confirm(`Tem certeza que deseja excluir o lote #${id}?`)) {
        return;
    }

    const btn = e.target.querySelector('button[type="submit"]');
    const textoOriginal = btn.innerHTML;
    btn.disabled = true;
    btn.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Excluindo...';

    try {
        const response = await fetch(`/api/lotes/${id}`, {
            method: "DELETE"
        });

        const resultado = await response.json();

        if (response.ok) {
            alert("✅ Lote excluído com sucesso!");
            e.target.reset();
            await carregarLotes(); // Atualizar tabela
        } else {
            alert("❌ " + (resultado.erro || resultado.mensagem || "Erro ao excluir lote"));
        }
    } catch (error) {
        console.error("Erro:", error);
        alert("❌ Erro ao excluir lote. Tente novamente.");
    } finally {
        btn.disabled = false;
        btn.innerHTML = textoOriginal;
    }
});

// Carregar Lotes na tabela
async function carregarLotes() {
    const tbody = document.getElementById("tabelaLotes");

    try {
        tbody.innerHTML = `
            <tr>
                <td colspan="8" class="text-center">
                    <div class="spinner-border text-success" role="status">
                        <span class="visually-hidden">Carregando...</span>
                    </div>
                </td>
            </tr>
        `;

        const response = await fetch("/api/lotes");
        const resultado = await response.json();

        if (!response.ok || !resultado.sucesso) {
            throw new Error("Erro ao carregar lotes");
        }

        const lotes = resultado.lotes || [];

        if (lotes.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="8">
                        <div class="empty-state">
                            <svg fill="currentColor" viewBox="0 0 16 16">
                                <path d="M1 2.5A1.5 1.5 0 0 1 2.5 1h3A1.5 1.5 0 0 1 7 2.5v3A1.5 1.5 0 0 1 5.5 7h-3A1.5 1.5 0 0 1 1 5.5v-3zm8 0A1.5 1.5 0 0 1 10.5 1h3A1.5 1.5 0 0 1 15 2.5v3A1.5 1.5 0 0 1 13.5 7h-3A1.5 1.5 0 0 1 9 5.5v-3zm-8 8A1.5 1.5 0 0 1 2.5 9h3A1.5 1.5 0 0 1 7 10.5v3A1.5 1.5 0 0 1 5.5 15h-3A1.5 1.5 0 0 1 1 13.5v-3zm8 0A1.5 1.5 0 0 1 10.5 9h3a1.5 1.5 0 0 1 1.5 1.5v3a1.5 1.5 0 0 1-1.5 1.5h-3A1.5 1.5 0 0 1 9 13.5v-3z"/>
                            </svg>
                            <p>Nenhum lote cadastrado</p>
                        </div>
                    </td>
                </tr>
            `;
            return;
        }

        // Carregar produtos para mapear nomes
        const produtosResponse = await fetch("/api/produtos?limite=100&pagina=1");
        const produtosJson = await produtosResponse.json();
        const produtosMap = {};

        if (produtosJson.sucesso && produtosJson.dados) {
            produtosJson.dados.forEach(p => {
                produtosMap[p.id] = p.nome;
            });
        }

        tbody.innerHTML = lotes.map(lote => {
            const hoje = new Date();
            const dataValidade = new Date(lote.data_validade);
            const diasRestantes = Math.ceil((dataValidade - hoje) / (1000 * 60 * 60 * 24));

            let statusClass = 'badge-valido';
            let statusTexto = 'Válido';

            if (diasRestantes < 0) {
                statusClass = 'badge-vencido';
                statusTexto = 'Vencido';
            } else if (diasRestantes <= 30) {
                statusClass = 'badge-proximo';
                statusTexto = `${diasRestantes}d restantes`;
            }

            const nomeProduto = produtosMap[lote.id_produto] || `Produto #${lote.id_produto}`;

            return `
                <tr>
                    <td><strong>#${lote.id}</strong></td>
                    <td>${nomeProduto}</td>
                    <td>${formatarData(lote.data_fab)}</td>
                    <td>${formatarData(lote.data_validade)}</td>
                    <td>${lote.qtd_inicial}</td>
                    <td>${lote.qtd_atual}</td>
                    <td><span class="badge-status ${statusClass}">${statusTexto}</span></td>
                    <td>
                        <button class="btn-delete-lote" onclick="excluirLoteRapido(${lote.id})">
                            🗑️ Excluir
                        </button>
                    </td>
                </tr>
            `;
        }).join('');

    } catch (error) {
        console.error("Erro ao carregar lotes:", error);
        tbody.innerHTML = `
            <tr>
                <td colspan="8">
                    <div class="empty-state">
                        <p style="color: #dc3545;">❌ Erro ao carregar lotes</p>
                    </div>
                </td>
            </tr>
        `;
    }
}

// Excluir lote direto da tabela
async function excluirLoteRapido(id) {
    if (!confirm(`Tem certeza que deseja excluir o lote #${id}?`)) {
        return;
    }

    try {
        const response = await fetch(`/api/lotes/${id}`, {
            method: "DELETE"
        });

        const resultado = await response.json();

        if (response.ok) {
            alert("✅ Lote excluído com sucesso!");
            await carregarLotes();
        } else {
            alert("❌ " + (resultado.erro || "Erro ao excluir lote"));
        }
    } catch (error) {
        console.error("Erro:", error);
        alert("❌ Erro ao excluir lote. Tente novamente.");
    }
}

// Formatar data
function formatarData(dataString) {
    if (!dataString) return '-';
    const data = new Date(dataString);
    return data.toLocaleDateString('pt-BR');
}

// Inicializar ao carregar a página
document.addEventListener("DOMContentLoaded", () => {
    carregarProdutosSelect();
    carregarLotes();
    carregarUsuarios();
});

// ========== GERENCIAMENTO DE USUÁRIOS ==========

// Carregar todos os usuários
async function carregarUsuarios() {
    const tbody = document.getElementById("tabelaUsuarios");

    try {
        tbody.innerHTML = `
            <tr>
                <td colspan="6" class="text-center">
                    <div class="spinner-border text-success" role="status">
                        <span class="visually-hidden">Carregando...</span>
                    </div>
                </td>
            </tr>
        `;

        const response = await fetch("/clienteRotas");
        const resultado = await response.json();

        if (!response.ok) {
            throw new Error("Erro ao carregar usuários");
        }

        const usuarios = resultado.usuarios || [];

        if (usuarios.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="6">
                        <div class="empty-state">
                            <svg fill="currentColor" viewBox="0 0 16 16">
                                <path d="M11 6a3 3 0 1 1-6 0 3 3 0 0 1 6 0z"/>
                                <path fill-rule="evenodd" d="M0 8a8 8 0 1 1 16 0A8 8 0 0 1 0 8zm8-7a7 7 0 0 0-5.468 11.37C3.242 11.226 4.805 10 8 10s4.757 1.225 5.468 2.37A7 7 0 0 0 8 1z"/>
                            </svg>
                            <p>Nenhum usuário cadastrado</p>
                        </div>
                    </td>
                </tr>
            `;
            return;
        }

        tbody.innerHTML = usuarios.map(usuario => `
            <tr>
                <td><strong>#${usuario.id}</strong></td>
                <td>${usuario.nome}</td>
                <td>${usuario.email}</td>
                <td>${usuario.CNPJ || '-'}</td>
                <td>${usuario.Telefone || '-'}</td>
                <td>
                    <button class="btn-action btn-deletar" onclick="deletarUsuario(${usuario.id})">
                        🗑️ Excluir
                    </button>
                </td>
            </tr>
        `).join('');

    } catch (error) {
        console.error("Erro ao carregar usuários:", error);
        tbody.innerHTML = `
            <tr>
                <td colspan="6">
                    <div class="empty-state">
                        <p style="color: #dc3545;">❌ Erro ao carregar usuários</p>
                    </div>
                </td>
            </tr>
        `;
    }
}

// Buscar usuário por ID
async function buscarUsuario() {
    const id = document.getElementById("buscarUsuarioId").value;
    const resultadoDiv = document.getElementById("resultadoBusca");

    if (!id) {
        alert("Digite um ID para buscar!");
        return;
    }

    resultadoDiv.innerHTML = `
        <div class="text-center py-3">
            <div class="spinner-border text-success" role="status">
                <span class="visually-hidden">Buscando...</span>
            </div>
        </div>
    `;

    try {
        const response = await fetch(`/clienteRotas/${id}`);
        const resultado = await response.json();

        if (!response.ok || !resultado.sucesso) {
            resultadoDiv.innerHTML = `
                <div class="alert alert-warning">
                    <strong>⚠️ Usuário não encontrado</strong>
                    <p class="mb-0">${resultado.mensagem || 'Nenhum usuário encontrado com este ID'}</p>
                </div>
            `;
            return;
        }

        const usuario = resultado.usuario;

        resultadoDiv.innerHTML = `
            <div class="usuario-card">
                <h4>📋 Resultado da Busca</h4>
                <div class="usuario-info">
                    <div class="usuario-info-item">
                        <strong>ID</strong>
                        <span>${usuario.id}</span>
                    </div>
                    <div class="usuario-info-item">
                        <strong>Empresa</strong>
                        <span>${usuario.nome}</span>
                    </div>
                    <div class="usuario-info-item">
                        <strong>Email</strong>
                        <span>${usuario.email}</span>
                    </div>
                    <div class="usuario-info-item">
                        <strong>CNPJ</strong>
                        <span>${usuario.CNPJ || '-'}</span>
                    </div>
                    <div class="usuario-info-item">
                        <strong>Telefone</strong>
                        <span>${usuario.Telefone || '-'}</span>
                    </div>
                    <div class="usuario-info-item">
                        <strong>Status</strong>
                        <span>${usuario.status || 'ATIVO'}</span>
                    </div>
                </div>
                <div class="mt-3 text-center">
                    <button class="btn-action btn-deletar" onclick="deletarUsuario(${usuario.id})">
                        🗑️ Excluir Usuário
                    </button>
                </div>
            </div>
        `;

    } catch (error) {
        console.error("Erro ao buscar usuário:", error);
        resultadoDiv.innerHTML = `
            <div class="alert alert-danger">
                <strong>❌ Erro ao buscar usuário</strong>
                <p class="mb-0">Ocorreu um erro ao tentar buscar o usuário. Tente novamente.</p>
            </div>
        `;
    }
}

// Deletar usuário
async function deletarUsuario(id) {
    if (!confirm(`Tem certeza que deseja excluir o usuário #${id}?`)) {
        return;
    }

    try {
        const response = await fetch(`/clienteRotas/${id}`, {
            method: "DELETE"
        });

        const resultado = await response.json();

        if (response.ok) {
            alert("✅ " + resultado.mensagem);
            await carregarUsuarios();
            document.getElementById("resultadoBusca").innerHTML = '';
        } else {
            alert("❌ " + (resultado.mensagem || "Erro ao excluir usuário"));
        }
    } catch (error) {
        console.error("Erro ao excluir usuário:", error);
        alert("❌ Erro ao excluir usuário. Tente novamente.");
    }
}

// Expor função para HTML
window.carregarLotes = carregarLotes;
window.excluirLoteRapido = excluirLoteRapido;
window.carregarUsuarios = carregarUsuarios;
window.buscarUsuario = buscarUsuario;
window.deletarUsuario = deletarUsuario;