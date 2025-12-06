// Pegar ID do produto da URL
const urlParams = new URLSearchParams(window.location.search);
const produtoId = urlParams.get('id');

if (!produtoId) {
    alert('ID do produto não encontrado!');
    window.location.href = 'catalogo.html';
}

// Mostrar loading enquanto carrega
document.getElementById('formAtualizarProduto').innerHTML = `
    <div class="text-center py-5">
        <div class="spinner-border text-success" role="status" style="width: 3rem; height: 3rem;">
            <span class="visually-hidden">Carregando...</span>
        </div>
        <p class="mt-3 text-muted">Carregando dados do produto...</p>
    </div>
`;

// Carregar dados do produto
async function carregarProduto() {
    try {
        const response = await fetch(`/api/produtos/${produtoId}`);
        const json = await response.json();

        if (!json.sucesso) {
            alert('Produto não encontrado!');
            window.location.href = 'catalogo.html';
            return;
        }

        const produto = json.dados;

        // Restaurar formulário completo
        document.getElementById('formAtualizarProduto').innerHTML = `
            <div class="mb-3">
                <label class="form-label fw-bold">Nome do Produto</label>
                <input type="text" name="nome" class="form-control" id="produtoNome" value="${produto.nome || ''}" required>
            </div>

            <div class="mb-3">
                <label class="form-label fw-bold">Descrição</label>
                <textarea name="descricao" class="form-control" rows="4" id="produtoDescricao" required>${produto.descricao || ''}</textarea>
            </div>

            <div class="mb-3">
                <label class="form-label fw-bold">Preço (R$)</label>
                <input type="number" step="0.01" name="preco" class="form-control" id="produtoPreco" value="${produto.preco || ''}" required>
            </div>

            <div class="mb-3">
                <label class="form-label fw-bold">Categoria</label>
                <select name="categoria" class="form-control" id="produtoCategoria" required>
                    <option value="">Selecione...</option>
                    <option value="Ácido" ${produto.categoria === 'Ácido' ? 'selected' : ''}>Ácido</option>
                    <option value="Base" ${produto.categoria === 'Base' ? 'selected' : ''}>Base</option>
                    <option value="Sal" ${produto.categoria === 'Sal' ? 'selected' : ''}>Sal</option>
                    <option value="Solvente" ${produto.categoria === 'Solvente' ? 'selected' : ''}>Solvente</option>
                    <option value="Polímero" ${produto.categoria === 'Polímero' ? 'selected' : ''}>Polímero</option>
                    <option value="Agricultura" ${produto.categoria === 'Agricultura' ? 'selected' : ''}>Agricultura</option>
                    <option value="Farmacêuticos" ${produto.categoria === 'Farmacêuticos' ? 'selected' : ''}>Farmacêuticos</option>
                    <option value="Cosméticos" ${produto.categoria === 'Cosméticos' ? 'selected' : ''}>Cosméticos</option>
                    <option value="Reagente" ${produto.categoria === 'Reagente' ? 'selected' : ''}>Reagente</option>
                </select>
            </div>

            <div class="mb-3">
                <label class="form-label fw-bold">Classificação de Periculosidade</label>
                <select name="id_classificacao" class="form-control" id="produtoClassificacao" required>
                    <option value="">Selecione...</option>
                    <option value="1" ${produto.id_classificacao == 1 ? 'selected' : ''}>Baixa Periculosidade (1)</option>
                    <option value="2" ${produto.id_classificacao == 2 ? 'selected' : ''}>Média Periculosidade (2)</option>
                    <option value="3" ${produto.id_classificacao == 3 ? 'selected' : ''}>Alta Periculosidade (3)</option>
                </select>
            </div>

            <div class="mb-4">
                <label class="form-label fw-bold">Imagens do Produto</label>
                <div class="row g-3 mb-3" id="imagensAtuais">
                    ${produto.imagem1 ? `
                        <div class="col-4">
                            <div class="border rounded p-2 text-center bg-light">
                                <img src="../uploads/imagens/${produto.imagem1}" 
                                     class="img-fluid rounded mb-2" 
                                     style="max-height: 150px; object-fit: contain; background: white; padding: 5px;">
                                <small class="text-muted d-block fw-bold">Imagem 1 atual</small>
                            </div>
                        </div>
                    ` : ''}
                    ${produto.imagem2 ? `
                        <div class="col-4">
                            <div class="border rounded p-2 text-center bg-light">
                                <img src="../uploads/imagens/${produto.imagem2}" 
                                     class="img-fluid rounded mb-2" 
                                     style="max-height: 150px; object-fit: contain; background: white; padding: 5px;">
                                <small class="text-muted d-block fw-bold">Imagem 2 atual</small>
                            </div>
                        </div>
                    ` : ''}
                    ${produto.imagem3 ? `
                        <div class="col-4">
                            <div class="border rounded p-2 text-center bg-light">
                                <img src="../uploads/imagens/${produto.imagem3}" 
                                     class="img-fluid rounded mb-2" 
                                     style="max-height: 150px; object-fit: contain; background: white; padding: 5px;">
                                <small class="text-muted d-block fw-bold">Imagem 3 atual</small>
                            </div>
                        </div>
                    ` : ''}
                </div>
                
                <div class="alert alert-info">
                    <small><strong>💡 Dica:</strong> Selecione novas imagens apenas se quiser substituir as atuais. Deixe em branco para manter as imagens existentes.</small>
                </div>
                
                <div class="mb-2">
                    <label class="form-label">Nova Imagem 1 (opcional)</label>
                    <input type="file" name="imagem1" class="form-control" accept="image/*">
                </div>
                <div class="mb-2">
                    <label class="form-label">Nova Imagem 2 (opcional)</label>
                    <input type="file" name="imagem2" class="form-control" accept="image/*">
                </div>
                <div class="mb-2">
                    <label class="form-label">Nova Imagem 3 (opcional)</label>
                    <input type="file" name="imagem3" class="form-control" accept="image/*">
                </div>
            </div>

            <div class="d-flex gap-3 justify-content-center mt-4">
                <button type="button" class="btn btn-secondary px-4" onclick="window.history.back()">
                    ← Cancelar
                </button>
                <button type="submit" class="btn px-4" style="background-color: #00bf63; color: white;">
                    💾 Salvar Alterações
                </button>
            </div>
        `;

        // Reattach event listener ao formulário
        document.getElementById('formAtualizarProduto').addEventListener('submit', atualizarProduto);

        console.log('✅ Produto carregado:', produto.nome);

    } catch (error) {
        console.error('Erro ao carregar produto:', error);
        alert('Erro ao carregar dados do produto.');
        window.location.href = 'catalogo.html';
    }
}

// Atualizar produto
async function atualizarProduto(e) {
    e.preventDefault();

    const formData = new FormData(e.target);
    
    // Mostrar loading no botão
    const btnSubmit = e.target.querySelector('button[type="submit"]');
    const textoOriginal = btnSubmit.innerHTML;
    btnSubmit.disabled = true;
    btnSubmit.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Salvando...';

    try {
        const response = await fetch(`/api/produtos/update/${produtoId}`, {
            method: 'POST',
            body: formData
        });

        const resultado = await response.json();

        if (response.ok) {
            // Mostrar sucesso
            btnSubmit.innerHTML = '✅ Salvo com sucesso!';
            btnSubmit.style.backgroundColor = '#28a745';
            
            setTimeout(() => {
                alert('Produto atualizado com sucesso!');
                window.location.href = 'catalogo.html';
            }, 1000);
        } else {
            throw new Error(resultado.mensagem || 'Erro ao atualizar produto.');
        }
    } catch (error) {
        console.error('Erro ao atualizar produto:', error);
        alert('❌ ' + error.message);
        
        // Restaurar botão
        btnSubmit.disabled = false;
        btnSubmit.innerHTML = textoOriginal;
    }
}

// Carregar produto ao iniciar
carregarProduto();