let categoriasSelecionadas = [];

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
        filtroGroup.innerHTML = ''; // Limpar checkboxes estáticos

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
        
        carregarProdutos();
      }
    });
  }
}

async function carregarProdutos() {
  const container = document.getElementById("container");
  if (!container) return;

  try {
    // Limpar produtos anteriores
    container.innerHTML = '';

    // Construir URL com filtro de categoria
    let url = "/api/produtos?limite=100";
    if (categoriasSelecionadas.length > 0) {
      // Se múltiplas categorias selecionadas, carregar todas e filtrar no frontend
      // Ou usar a primeira categoria selecionada (backend atual suporta apenas uma)
      url += `&categoria=${encodeURIComponent(categoriasSelecionadas[0])}`;
    }

    const resposta = await fetch(url);
    const json = await resposta.json();

    console.log("Retorno da API:", json);

    let produtos = json.dados || json.produtos || json || [];

    if (!Array.isArray(produtos)) {
      throw new Error("A API não retornou um array de produtos.");
    }

    // Se múltiplas categorias selecionadas, filtrar no frontend
    if (categoriasSelecionadas.length > 1) {
      produtos = produtos.filter(prod => 
        categoriasSelecionadas.includes(prod.categoria)
      );
    }

    if (produtos.length === 0) {
      container.innerHTML = `
        <div class="col-12">
          <div class="alert alert-info text-center">
            <p>Nenhum produto encontrado para as categorias selecionadas.</p>
          </div>
        </div>
      `;
      return;
    }

    produtos.forEach(prod => {
      const div = document.createElement("div");
      div.classList.add("col-xl-4", "col-lg-6", "col-md-6", "col-sm-12");

      div.innerHTML = `
              <div class="card produto-card data-categoria="${prod.categoria}">
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
  } catch (err) {
    console.error("Erro ao carregar produtos:", err);
    const container = document.getElementById("container");
    if (container) {
      container.innerHTML = `
        <div class="col-12">
          <div class="alert alert-danger text-center">
            <p>Erro ao carregar produtos. Tente novamente mais tarde.</p>
          </div>
        </div>
      `;
    }
  }
}
document.addEventListener("DOMContentLoaded", () => {
  const checkboxes = document.querySelectorAll(".filtro-categoria");
  const produtos = document.querySelectorAll(".produto-card");

  checkboxes.forEach(chk => {
    chk.addEventListener("change", filtrarProdutos);
  });

  function filtrarProdutos() {
    // pega lista de categorias marcadas
    const selecao = [...checkboxes]
      .filter(c => c.checked)
      .map(c => c.value);

    // Se nada estiver marcado → mostrar todos
    if (selecao.length === 0) {
      produtos.forEach(p => p.style.display = "block");
      return;
    }

    // Filtrar
    produtos.forEach(prod => {
      const categoria = prod.getAttribute("data-categoria");

      if (selecao.includes(categoria)) {
        prod.style.display = "block";
      } else {
        prod.style.display = "none";
      }
    });
  }
});
