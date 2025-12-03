// Pegar parâmetro ID da URL
const params = new URLSearchParams(window.location.search);
const id = params.get("id");

if (!id) {
  alert("Produto não encontrado!");
  window.location.href = "catalogo.html";
}

// Buscar dados do produto
async function carregarProduto() {
  try {
    const resp = await fetch(`/api/produtos/${id}`);
    const json = await resp.json();

    if (!json.sucesso) {
      alert("Produto não encontrado!");
      return;
    }

    const prod = json.dados;

    // Preencher elementos básicos
    document.title = prod.nome;
    document.querySelector("h3").textContent = prod.nome;
    document.querySelector(".h6").textContent = prod.descricao;
    document.querySelector("h1").innerHTML = `R$ ${Number(prod.preco).toFixed(
      2
    )}`;

    // Trocar imagens
    document.querySelectorAll(
      "#thumb-gallery img"
    )[0].src = `../uploads/imagens/${prod.imagem1}`;
    document.querySelectorAll(
      "#thumb-gallery img"
    )[1].src = `../uploads/imagens/${prod.imagem2}`;
    document.querySelectorAll(
      "#thumb-gallery img"
    )[2].src = `../uploads/imagens/${prod.imagem3}`;

    document.querySelectorAll(
      ".carousel-item img"
    )[0].src = `../uploads/imagens/${prod.imagem1}`;
    document.querySelectorAll(
      ".carousel-item img"
    )[1].src = `../uploads/imagens/${prod.imagem2}`;
    document.querySelectorAll(
      ".carousel-item img"
    )[2].src = `../uploads/imagens/${prod.imagem3}`;
    document.querySelectorAll(".info-value")[0].textContent = prod.id;
    document.querySelectorAll(".info-value")[2].textContent = prod.categoria;
  } catch (err) {
    console.error(err);
  }
}

carregarProduto();

function getCarrinho() {
  const usuario = JSON.parse(localStorage.getItem("sessaoUsuario"));
  if (!usuario) {
    alert("Você precisa estar logado para adicionar ao carrinho.");
    window.location.href = "login_cliente.html";
    return [];
  }

  let carrinho = localStorage.getItem(`carrinho_${usuario.id}`);
  return carrinho ? JSON.parse(carrinho) : [];
}

function salvarCarrinho(carrinho) {
  const usuario = JSON.parse(localStorage.getItem("sessaoUsuario"));
  localStorage.setItem(`carrinho_${usuario.id}`, JSON.stringify(carrinho));
}

document
  .getElementById("botaoAdicionarAoCarrinho")
  .addEventListener("click", async () => {
    const resp = await fetch(`/api/produtos/${id}`);
    const json = await resp.json();
    const prod = json.dados;

    let carrinho = getCarrinho();

    const itemExistente = carrinho.find((p) => p.id_produto === prod.id);

    if (itemExistente) {
      itemExistente.quantidade += 1;
    } else {
      carrinho.push({
        id_produto: prod.id,
        nome: prod.nome,
        preco: Number(prod.preco),
        imagem: prod.imagem1,
        quantidade: 1,
      });
    }

    salvarCarrinho(carrinho);

    window.location.href = "/carrinho.html";
  });
