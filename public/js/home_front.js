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
    const teste = document.getElementById('teste');

    console.log("Sessão carregada:", sessao);

    if (sessao) {
        teste.classList.add("d-none")
        teste.classList.remove("d-flex");
    }
}

document.addEventListener("DOMContentLoaded", atualizarVisibilidadeBotoes);