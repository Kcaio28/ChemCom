// Dropdown de Conta
const btnConta = document.getElementById('btnConta');
const contaDropdown = document.getElementById('contaDropdown');
const btnSair = document.getElementById('btnSair');

// Toggle dropdown ao clicar no botão Conta
if (btnConta) {
    btnConta.addEventListener('click', function (e) {
        e.preventDefault();
        contaDropdown.classList.toggle('show');
    });
}

// Fecha dropdown ao clicar fora
document.addEventListener('click', function (e) {
    if (contaDropdown && !contaDropdown.contains(e.target) && !btnConta.contains(e.target)) {
        contaDropdown.classList.remove('show');
    }
});

// Função de logout
if (btnSair) {
    btnSair.addEventListener('click', function () {
        if (confirm('Tem certeza que deseja sair?')) {
            // Adicione aqui sua lógica de logout
            // localStorage.removeItem('token');
            // sessionStorage.clear();
            localStorage.removeItem('sessaoUsuario');

            alert('Logout realizado com sucesso!');
            window.location.href = 'home.html';
        }
    });
}

// Atualizar nome do usuário
const userName = document.getElementById('userName');
if (userName) {
    const nomeUsuario = localStorage.getItem('nomeUsuario') || 'Usuário';
    userName.textContent = nomeUsuario;
}