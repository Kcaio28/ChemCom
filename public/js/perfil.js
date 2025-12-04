document.addEventListener("DOMContentLoaded", async () => {
    const usuario = JSON.parse(localStorage.getItem("sessaoUsuario")).dados;
    const container = document.getElementById("container");
    const div = document.createElement("div");

    div.classList.add("card");
    container.innerHTML = ''
    div.innerHTML =
        `
    <div class="card" id="card">
        <div class="profile-image">
            <img src="./images/icons/icon_user.svg" alt="Usuário" />
        </div>
        <div class="profile-info">
            <h2 class="nome-user">${usuario.nome}</h2>
        </div>
        <div class="user-details">
            <div class="detail-item">
                <span class="detail-label">ID:</span>
                <span class="detail-value">${usuario.id}</span>
            </div>
            <div class="detail-item">
                <span class="detail-label">Email:</span>
                <span class="detail-value">${usuario.email}</span>
            </div>
            <div class="detail-item">
                <span class="detail-label">Telefone:</span>
                <span class="detail-value">${usuario.Telefone}</span>
            </div>
            <div class="detail-item">
                <span class="detail-label">CNPJ:</span>
                <span class="detail-value">${usuario.CNPJ}</span>
            </div>
            <div class="detail-item">
                <span class="detail-label">CEP:</span>
                <span class="detail-value">${usuario.CEP}</span>
            </div>
            <div class="detail-item">
                <span class="detail-label">Endereço:</span>
                <span class="detail-value">${usuario.logradouro}, ${usuario.Nro} - ${usuario.cidade}/${usuario.estado}</span>
            </div>
        </div>
    </div>
    `
    container.appendChild(div);
});