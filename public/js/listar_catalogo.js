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

        paginaAtual = 1; // Resetar página ao filtrar
        carregarProdutos();
      }
    });
  }
}

async function carregarProdutos() {
  const container = document.getElementById("container");
  if (!container) return;

  try {
    container.innerHTML = '<div class="col-12 text-center"><p>Carregando produtos...</p></div>';

    // Buscar todos os produtos (ou limitar para evitar muitos dados)
    const url = `/api/produtos?limite=100&pagina=1`;
    const resposta = await fetch(url);
    const json = await resposta.json();

    let produtos = json.dados || [];

    // Filtrar por múltiplas categorias no frontend
    if (categoriasSelecionadas.length > 0) {
      produtos = produtos.filter(prod =>
        categoriasSelecionadas.includes(prod.categoria)
      );
    }

    // Paginação manual no frontend
    const totalPaginas = Math.ceil(produtos.length / ITENS_POR_PAGINA);
    const inicio = (paginaAtual - 1) * ITENS_POR_PAGINA;
    const fim = inicio + ITENS_POR_PAGINA;
    const produtosPagina = produtos.slice(inicio, fim);

    container.innerHTML = '';

    if (produtosPagina.length === 0) {
      container.innerHTML = `
        <div class="col-12">
          <div class="alert alert-info text-center">
            <p>Nenhum produto encontrado para as categorias selecionadas.</p>
          </div>
        </div>
      `;
      renderizarPaginacao({ pagina: paginaAtual, totalPaginas, total: produtos.length });
      return;
    }

    const ehAdmin = isAdmin();

    produtosPagina.forEach(prod => {
      const div = document.createElement("div");
      div.classList.add("col-xl-4", "col-lg-6", "col-md-6", "col-sm-12");
      div.innerHTML = `
        <div class="card produto-card" data-categoria="${prod.categoria}">
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
              <a href="atualizarProduto.html?id=${prod.id}" class="menu-opcoes-item">Editar</a>
              <div class="menu-opcoes-item deletar" onclick="confirmarExclusao(${prod.id}, '${prod.nome}')">Excluir</div>
            </div>
          </div>` : ''}
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

    renderizarPaginacao({ pagina: paginaAtual, totalPaginas, total: produtos.length });

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

// Funções auxiliares para opções de admin
function toggleMenuOpcoes(event, produtoId) {
  event.stopPropagation();
  document.querySelectorAll('.menu-opcoes-dropdown').forEach(menu => {
    if (menu.id !== `menu-${produtoId}`) menu.classList.remove('show');
  });
  const menu = document.getElementById(`menu-${produtoId}`);
  menu.classList.toggle('show');
}

document.addEventListener('click', (e) => {
  if (!e.target.closest('.produto-opcoes')) {
    document.querySelectorAll('.menu-opcoes-dropdown').forEach(menu => menu.classList.remove('show'));
  }
});

async function confirmarExclusao(id, nome) {
  if (!confirm(`Tem certeza que deseja excluir o produto "${nome}"?`)) return;
  try {
    const response = await fetch(`/api/produtos/${id}`, { method: 'DELETE' });
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

// Paginação
function renderizarPaginacao(paginacao) {
  let paginacaoDiv = document.getElementById('paginacao-catalogo');
  if (!paginacaoDiv) {
    paginacaoDiv = document.createElement('div');
    paginacaoDiv.id = 'paginacao-catalogo';
    paginacaoDiv.className = 'paginacao-catalogo';
    const mainContent = document.querySelector('.col-lg-10.col-md-9');
    if (mainContent) mainContent.appendChild(paginacaoDiv);
  }

  paginacaoDiv.innerHTML = '';

  const { pagina, totalPaginas } = paginacao;
  if (!totalPaginas || totalPaginas <= 1) return;

  let html = `<div class="paginacao-controles">
    <button class="btn-pag ${pagina === 1 ? 'disabled' : ''}" ${pagina === 1 ? 'disabled' : ''} onclick="irParaPagina(${pagina - 1})">← Anterior</button>`;

  for (let i = 1; i <= totalPaginas; i++) {
    if (i === 1 || i === totalPaginas || (i >= pagina - 2 && i <= pagina + 2)) {
      html += `<button class="btn-pag ${i === pagina ? 'active' : ''}" onclick="irParaPagina(${i})">${i}</button>`;
    } else if (i === pagina - 3 || i === pagina + 3) {
      html += `<span class="pag-ellipsis">...</span>`;
    }
  }

  html += `<button class="btn-pag ${pagina === totalPaginas ? 'disabled' : ''}" ${pagina === totalPaginas ? 'disabled' : ''} onclick="irParaPagina(${pagina + 1})">Próximo →</button></div>`;

  paginacaoDiv.innerHTML = html;
}

window.irParaPagina = function(pagina) {
  paginaAtual = pagina;
  carregarProdutos();
  const mainContent = document.querySelector('.col-lg-10.col-md-9');
  if (mainContent) mainContent.scrollIntoView({ behavior: 'smooth', block: 'start' });
};
