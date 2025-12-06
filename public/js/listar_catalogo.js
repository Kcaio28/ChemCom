let categoriasSelecionadas = [];
let paginaAtual = 1;
const ITENS_POR_PAGINA = 9;

function isAdmin() {
  const sessao = JSON.parse(localStorage.getItem('sessaoUsuario'));
  return sessao && (sessao.tipo === 'admin' || sessao.tipo === 'adm');
}

document.addEventListener("DOMContentLoaded", async () => {
  await carregarCategorias();
  await carregarProdutos();
  configurarFiltros();
});

async function carregarCategorias() {
  try {
    const resposta = await fetch("/api/produtos/categorias");
    const json = await resposta.json();

    if (json.sucesso && json.categorias) {
      const filtroGroup = document.querySelector('.filtro-group');
      if (filtroGroup) {
        filtroGroup.innerHTML = '';

        json.categorias.forEach(categoria => {
          const label = document.createElement('label');
          label.className = 'filtro-item';

          const checkbox = document.createElement('input');
          checkbox.type = 'checkbox';
          checkbox.value = categoria;
          checkbox.dataset.categoria = categoria;

          const span = document.createElement('span');
          span.textContent = categoria;

          label.appendChild(checkbox);
          label.appendChild(span);
          filtroGroup.appendChild(label);
        });
      }
    }
  } catch (err) {
    console.error("Erro ao carregar categorias:", err);
  }
}

function configurarFiltros() {
  const filtroGroup = document.querySelector('.filtro-group');
  if (filtroGroup) {
    filtroGroup.addEventListener('change', (e) => {
      if (e.target.type === 'checkbox') {
        const categoria = e.target.value;

        if (e.target.checked) {
          if (!categoriasSelecionadas.includes(categoria)) {
            categoriasSelecionadas.push(categoria);
          }
        } else {
          categoriasSelecionadas = categoriasSelecionadas.filter(c => c !== categoria);
        }

        // Resetar para página 1 ao filtrar
        paginaAtual = 1;
        carregarProdutos();
      }
    });
  }
}

async function carregarProdutos() {
  const container = document.getElementById("container");
  if (!container) return;

  try {
    // Mostrar loading
    container.innerHTML = '<div class="col-12 text-center"><p>Carregando produtos...</p></div>';

    // Construir URL com paginação
    let url = `/api/produtos?limite=${ITENS_POR_PAGINA}&pagina=${paginaAtual}`;

    // Adicionar filtro de categoria se houver
    if (categoriasSelecionadas.length > 0) {
      url += `&categoria=${encodeURIComponent(categoriasSelecionadas[0])}`;
    }

    const resposta = await fetch(url);
    const json = await resposta.json();

    console.log("Retorno da API:", json);

    let produtos = json.dados || [];
    const paginacao = json.paginacao || {};

    if (!Array.isArray(produtos)) {
      throw new Error("A API não retornou um array de produtos.");
    }

    // Filtrar por múltiplas categorias no frontend se necessário
    if (categoriasSelecionadas.length > 1) {
      produtos = produtos.filter(prod =>
        categoriasSelecionadas.includes(prod.categoria)
      );
    }

    // Limpar container
    container.innerHTML = '';

    if (produtos.length === 0) {
      container.innerHTML = `
        <div class="col-12">
          <div class="alert alert-info text-center">
            <p>Nenhum produto encontrado para as categorias selecionadas.</p>
          </div>
        </div>
      `;
      renderizarPaginacao(paginacao);
      return;
    }

    const ehAdmin = isAdmin();

    // Renderizar produtos
    produtos.forEach(prod => {
      const div = document.createElement("div");
      div.classList.add("col-xl-4", "col-lg-6", "col-md-6", "col-sm-12");

      div.innerHTML = `<div class="card produto-card" data-categoria="${prod.categoria}">
          ${ehAdmin ? `
            <div class="produto-opcoes">
              <button class="btn-opcoes" onclick="toggleMenuOpcoes(event, ${prod.id})">
                <svg width="20" height="20" viewBox="0 0 16 16">
                  <circle cx="8" cy="3" r="1.5"/>
                  <circle cx="8" cy="8" r="1.5"/>
                  <circle cx="8" cy="13" r="1.5"/>
                </svg>
              </button>
              <div class="menu-opcoes-dropdown" id="menu-${prod.id}">
                <a href="atualizarProduto.html?id=${prod.id}" class="menu-opcoes-item">
                  <svg viewBox="0 0 16 16" fill="currentColor">
                    <path d="M12.146.146a.5.5 0 0 1 .708 0l3 3a.5.5 0 0 1 0 .708l-10 10a.5.5 0 0 1-.168.11l-5 2a.5.5 0 0 1-.65-.65l2-5a.5.5 0 0 1 .11-.168l10-10zM11.207 2.5 13.5 4.793 14.793 3.5 12.5 1.207 11.207 2.5zm1.586 3L10.5 3.207 4 9.707V10h.5a.5.5 0 0 1 .5.5v.5h.5a.5.5 0 0 1 .5.5v.5h.293l6.5-6.5zm-9.761 5.175-.106.106-1.528 3.821 3.821-1.528.106-.106A.5.5 0 0 1 5 12.5V12h-.5a.5.5 0 0 1-.5-.5V11h-.5a.5.5 0 0 1-.468-.325z"/>
                  </svg>
                  Editar
                </a>
                <div class="menu-opcoes-item deletar" onclick="confirmarExclusao(${prod.id}, '${prod.nome}')">
                  <svg viewBox="0 0 16 16" fill="currentColor">
                    <path d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0V6z"/>
                    <path fill-rule="evenodd" d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1v1zM4.118 4 4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4H4.118zM2.5 3V2h11v1h-11z"/>
                  </svg>
                  Excluir
                </div>
              </div>
            </div>
          ` : ''}
          <div class="card-img-wrapper">
            <img src="../uploads/imagens/${prod.imagem1 || 'placeholder.jpg'}" alt="${prod.nome}" class="card-img-top">
          </div>
          <div class="card-body">
            <h5 class="produto-nome">${prod.nome}</h5>
            <p class="produto-empresa">Classificação: ${prod.classificacao_nome || 'N/A'}</p>
            <p class="produto-categoria">Categoria: ${prod.categoria || 'N/A'}</p>
            <p class="produto-preco">Preço: R$ ${Number(prod.preco).toFixed(2)}</p>
            <a href="produto.html?id=${prod.id}">
              <button class="btn btn-comprar">Comprar</button>
            </a>
          </div>
        </div>
      `;

      container.appendChild(div);
    });

    // Renderizar controles de paginação
    renderizarPaginacao(paginacao);

  } catch (err) {
    console.error("Erro ao carregar produtos:", err);
    container.innerHTML = `
      <div class="col-12">
        <div class="alert alert-danger text-center">
          <p>Erro ao carregar produtos. Tente novamente mais tarde.</p>
        </div>
      </div>
    `;
  }
}

function toggleMenuOpcoes(event, produtoId) {
  event.stopPropagation();
  
  // Fechar todos os outros menus
  document.querySelectorAll('.menu-opcoes-dropdown').forEach(menu => {
    if (menu.id !== `menu-${produtoId}`) {
      menu.classList.remove('show');
    }
  });
  
  // Toggle do menu atual
  const menu = document.getElementById(`menu-${produtoId}`);
  menu.classList.toggle('show');
}

// Fechar menus ao clicar fora
document.addEventListener('click', (e) => {
  if (!e.target.closest('.produto-opcoes')) {
    document.querySelectorAll('.menu-opcoes-dropdown').forEach(menu => {
      menu.classList.remove('show');
    });
  }
});

// Confirmar exclusão
async function confirmarExclusao(id, nome) {
  if (!confirm(`Tem certeza que deseja excluir o produto "${nome}"?`)) {
    return;
  }

  try {
    const response = await fetch(`/api/produtos/${id}`, {
      method: 'DELETE'
    });

    const resultado = await response.json();

    if (response.ok) {
      alert('Produto excluído com sucesso!');
      carregarProdutos();
    } else {
      alert(resultado.mensagem || 'Erro ao excluir produto.');
    }
  } catch (error) {
    console.error('Erro ao excluir produto:', error);
    alert('Erro ao excluir produto. Tente novamente.');
  }
}


function renderizarPaginacao(paginacao) {
  // Remover paginação existente se houver
  let paginacaoDiv = document.getElementById('paginacao-catalogo');
  if (!paginacaoDiv) {
    // Criar div de paginação se não existir
    paginacaoDiv = document.createElement('div');
    paginacaoDiv.id = 'paginacao-catalogo';
    paginacaoDiv.className = 'paginacao-catalogo';

    const mainContent = document.querySelector('.col-lg-10.col-md-9');
    if (mainContent) {
      mainContent.appendChild(paginacaoDiv);
    }
  }

  paginacaoDiv.innerHTML = '';

  if (!paginacao || !paginacao.totalPaginas || paginacao.totalPaginas <= 1) {
    return;
  }

  const { pagina, totalPaginas, total } = paginacao;

  let html = `
    <div class="paginacao-controles">
      <button 
        class="btn-pag ${pagina === 1 ? 'disabled' : ''}" 
        ${pagina === 1 ? 'disabled' : ''}
        onclick="irParaPagina(${pagina - 1})"
      >
        ← Anterior
      </button>
  `;

  // Mostrar páginas
  for (let i = 1; i <= totalPaginas; i++) {
    if (i === 1 || i === totalPaginas || (i >= pagina - 2 && i <= pagina + 2)) {
      html += `
        <button 
          class="btn-pag ${i === pagina ? 'active' : ''}"
          onclick="irParaPagina(${i})"
        >
          ${i}
        </button>
      `;
    } else if (i === pagina - 3 || i === pagina + 3) {
      html += `<span class="pag-ellipsis">...</span>`;
    }
  }

  html += `
      <button 
        class="btn-pag ${pagina === totalPaginas ? 'disabled' : ''}"
        ${pagina === totalPaginas ? 'disabled' : ''}
        onclick="irParaPagina(${pagina + 1})"
      >
        Próximo →
      </button>
    </div>
  `;

  paginacaoDiv.innerHTML = html;
}

// Função global para navegação de páginas
window.irParaPagina = function (pagina) {
  paginaAtual = pagina;
  carregarProdutos();

  // Scroll suave para o topo da lista de produtos
  const mainContent = document.querySelector('.col-lg-10.col-md-9');
  if (mainContent) {
    mainContent.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
};