let categoriasSelecionadas = [];
let paginaAtual = 1;
const ITENS_POR_PAGINA = 9;

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

    // Renderizar produtos
    produtos.forEach(prod => {
      const div = document.createElement("div");
      div.classList.add("col-xl-4", "col-lg-6", "col-md-6", "col-sm-12");

      div.innerHTML = `
        <div class="card produto-card" data-categoria="${prod.categoria}">
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
window.irParaPagina = function(pagina) {
  paginaAtual = pagina;
  carregarProdutos();
  
  // Scroll suave para o topo da lista de produtos
  const mainContent = document.querySelector('.col-lg-10.col-md-9');
  if (mainContent) {
    mainContent.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
};