document.getElementById("formLogin").addEventListener("submit", async (e) => {
    e.preventDefault();
    
    try {
        const formData = new FormData(e.target);
        const dados = Object.fromEntries(formData.entries());

        console.log('📤 Enviando requisição de login...');

        const resposta = await fetch("/clienteRotas/login", {
            method: "POST",
            headers: { "Content-type": "application/json" },
            body: JSON.stringify(dados)
        });

        console.log('📥 Resposta recebida. Status:', resposta.status);

        const resultado = await resposta.json();
        console.log('📦 Dados recebidos:', { 
            tipo: resultado.tipo, 
            temToken: !!resultado.token,
            mensagem: resultado.mensagem 
        });
        
        if (resposta.ok) {
            // Limpar dados antigos
            localStorage.clear();
            
            // Verificar se o token foi retornado
            if (!resultado.token) {
                console.error('❌ Token não recebido do servidor');
                console.error('Resposta completa:', resultado);
                alert('Erro: Token de autenticação não foi recebido. Tente novamente.');
                return;
            }

            if (resultado.tipo === "usuario") {
                localStorage.setItem("sessaoUsuario", JSON.stringify({
                    tipo: "usuario",
                    dados: resultado.dados
                }));
                localStorage.setItem("token", resultado.token);
                console.log('✅ Login realizado com sucesso - Usuário');
                console.log('💾 Token salvo:', resultado.token.substring(0, 20) + '...');
            } else if (resultado.tipo === "adm") {
                localStorage.setItem("sessaoUsuario", JSON.stringify({
                    tipo: "adm",
                    dados: resultado.dados
                }));
                localStorage.setItem("token", resultado.token);
                console.log('✅ Login realizado com sucesso - Admin');
                console.log('💾 Token salvo:', resultado.token.substring(0, 20) + '...');
            } else {
                console.error('❌ Tipo de usuário desconhecido:', resultado.tipo);
                alert('Erro: Tipo de usuário inválido.');
                return;
            }

            // Verificar se o token foi salvo
            const tokenSalvo = localStorage.getItem('token');
            if (!tokenSalvo) {
                console.error('❌ Erro: Token não foi salvo no localStorage');
                alert('Erro ao salvar token. Tente novamente.');
                return;
            }

            console.log('🚀 Redirecionando para home...');
            window.location.href = "/home.html";
        } else {
            console.error('❌ Erro no login:', resultado);
            alert(resultado.mensagem || 'Erro ao fazer login. Verifique suas credenciais.');
        }
    } catch (error) {
        console.error('❌ Erro ao processar login:', error);
        alert('Erro ao fazer login. Verifique sua conexão e tente novamente.');
    }
})