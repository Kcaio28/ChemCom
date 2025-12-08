document.addEventListener("DOMContentLoaded", async () => {
    // Pega os dados do usuário e autorizações do localStorage
    const sessao = JSON.parse(localStorage.getItem("sessaoUsuario"));
    if (!sessao) return;

    const usuario = sessao.dados;
    const autorizacoes = usuario.autorizacoes || []; // <-- corrigido

    const container = document.getElementById("container");
    container.innerHTML = ''; // limpa conteúdo

    // Card principal do usuário
    const card = document.createElement("div");
    card.classList.add("card");
    card.innerHTML = `
        <div class="profile-image">
            <img src="./images/icons/icon_user.svg" alt="Usuário" />
        </div>
        <div class="profile-info">
            <h2 class="nome-user">${usuario.nome}</h2>
        </div>
        <div class="user-details">
            <div class="detail-item"><span class="detail-label">ID:</span> <span class="detail-value">${usuario.id}</span></div>
            <div class="detail-item"><span class="detail-label">Email:</span> <span class="detail-value">${usuario.email}</span></div>
            <div class="detail-item"><span class="detail-label">Telefone:</span> <span class="detail-value">${usuario.Telefone}</span></div>
            <div class="detail-item"><span class="detail-label">CNPJ:</span> <span class="detail-value">${usuario.CNPJ}</span></div>
            <div class="detail-item"><span class="detail-label">CEP:</span> <span class="detail-value">${usuario.CEP}</span></div>
            <div class="detail-item"><span class="detail-label">Endereço:</span> <span class="detail-value">${usuario.logradouro}, ${usuario.Nro} - ${usuario.cidade}/${usuario.estado}</span></div>
        </div>
    `;
    container.appendChild(card);

    // Card de autorizações
    const authCard = document.createElement("div");
    authCard.classList.add("card");
    authCard.innerHTML = `
        <h3 class="section-title">Autorizações</h3>
        <div class="autorizacoes-container"></div>
    `;
    container.appendChild(authCard);

    const authContainer = authCard.querySelector(".autorizacoes-container");

    if (autorizacoes.length === 0) {
        authContainer.innerHTML = "<p>Sem autorizações cadastradas.</p>";
    } else {
        // Cria uma div para cada autorização
        autorizacoes.forEach(auth => {
            const divAuth = document.createElement("div");
            divAuth.classList.add("autorizacao-item");
            divAuth.innerHTML = `
                <span class="categoria">${auth.categoria}</span> - 
                <span class="nivel">Nível ${auth.nivel}</span>
            `;
            authContainer.appendChild(divAuth);
        });
    }
});
