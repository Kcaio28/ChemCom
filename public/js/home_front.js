function getSessaoUsuario() {
    const sessao = localStorage.getItem('sessaoUsuario');
    if (sessao) {
        try {
            return JSON.parse(sessao);
        } catch (e) {
            console.error("Erro ao parsear sessão", e);
            localStorage.removeItem('sessaoUsuario');
            return null;
        }
    }
    return null;
}

function atualizarVisibilidadeBotoes() {
    const sessao = getSessaoUsuario();
    const divLogin = document.getElementById('divLogin');
    const divCarrinho = document.getElementById('divCarrinho');

    console.log("Sessão carregada:", sessao);

    if (sessao) {
        divLogin.classList.add("d-none")
        divLogin.classList.remove("d-flex");
        divCarrinho.classList.remove("d-none")
        divCarrinho.classList.add("d-flex");
    }
    if (sessao.tipo === "adm") {
        const painelAdm = document.getElementById("painelAdm")
        painelAdm.classList.remove("d-none")
    }
}

document.addEventListener("DOMContentLoaded", atualizarVisibilidadeBotoes);