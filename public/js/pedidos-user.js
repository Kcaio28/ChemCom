class GerenciadorMeusPedidos {
  constructor() {
    this.paginaAtual = 1;
    this.itensPorPagina = 10;
    this.filtroStatus = "";
  }

  /**
   * Inicializar a página
   */
  async init() {
    this.setupEventListeners();
    await this.carregarPedidos();
  }

  /**
   * Configurar event listeners
   */
  setupEventListeners() {
    const filtroStatus = document.getElementById("filtroStatus");
    if (filtroStatus) {
      filtroStatus.addEventListener("change", async (e) => {
        this.filtroStatus = e.target.value;
        this.paginaAtual = 1;
        await this.carregarPedidos();
      });
    }
  }

  /**
   * Carregar pedidos do cliente
   */
  async carregarPedidos() {
    try {
      const params = new URLSearchParams({
        pagina: this.paginaAtual,
        limite: this.itensPorPagina,
      });

      if (this.filtroStatus) {
        params.append("status", this.filtroStatus);
      }

      const token = localStorage.getItem("token");
      if (!token) {
        this.mostrarErro(
          "Você precisa estar logado para ver seus pedidos. Redirecionando para login..."
        );
        setTimeout(() => {
          window.location.href = "/login_cliente.html";
        }, 2000);
        return;
      }

      const response = await fetch(`/api/pedidos/meus-pedidos`, {
        method: "GET",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.erro || `Erro ${response.status}: ${response.statusText}`
        );
      }

      const data = await response.json();

      if (data.sucesso) {
        this.renderizarPedidos(data.pedidos || []);
      } else {
        this.mostrarErro(data.erro || "Erro ao carregar pedidos");
      }
    } catch (error) {
      console.error("Erro ao carregar pedidos:", error);
      this.mostrarErro(
        error.message ||
          "Erro ao carregar pedidos. Verifique se você está logado."
      );
    }
  }

  /**
   * Renderizar lista de pedidos
   */
  renderizarPedidos(pedidos) {
    const container = document.getElementById("listaPedidos");

    if (!container) return;

    if (pedidos.length === 0) {
      container.innerHTML = `
        <div class="card-vazio">
          <p>Nenhum pedido encontrado</p>
        </div>
      `;
      return;
    }

    container.innerHTML = pedidos
      .map(
        (pedido) => `
      <div class="card-pedido">
        <div class="pedido-header">
          <span class="pedido-numero">#${String(pedido.nro_pedido).padStart(
            3,
            "0"
          )}</span>
          <span class="pedido-data">${this.formatarData(
            pedido.data_pedido
          )}</span>
          <span class="pedido-status status-${pedido.status.toLowerCase()}">
            ${this.formatarStatus(pedido.status)}
          </span>
        </div>
        <div class="pedido-body">
          <div class="pedido-info">
            <span>${pedido.quantidade_itens} ${
          pedido.quantidade_itens === 1 ? "item" : "itens"
        }</span>
            <span class="pedido-total">R$ ${this.formatarValor(
              pedido.valor_total
            )}</span>
          </div>
          <button class="btn-detalhes" onclick="gerenciadorPedidos.verDetalhes(${
            pedido.nro_pedido
          })">
            Ver Detalhes
          </button>
        </div>
      </div>
    `
      )
      .join("");
  }

  /**
   * Renderizar paginação
   */
  renderizarPaginacao(paginacao) {
    const container = document.getElementById("paginacao");

    if (!container || paginacao.total_paginas <= 1) {
      if (container) container.innerHTML = "";
      return;
    }

    const { pagina_atual, total_paginas } = paginacao;

    let html = `
      <button 
        class="btn-pag" 
        ${pagina_atual === 1 ? "disabled" : ""}
        onclick="gerenciadorPedidos.irParaPagina(${pagina_atual - 1})"
      >
        Anterior
      </button>
    `;

    // Mostrar páginas
    for (let i = 1; i <= total_paginas; i++) {
      if (
        i === 1 ||
        i === total_paginas ||
        (i >= pagina_atual - 2 && i <= pagina_atual + 2)
      ) {
        html += `
          <button 
            class="btn-pag ${i === pagina_atual ? "active" : ""}"
            onclick="gerenciadorPedidos.irParaPagina(${i})"
          >
            ${i}
          </button>
        `;
      } else if (i === pagina_atual - 3 || i === pagina_atual + 3) {
        html += `<span class="pag-ellipsis">...</span>`;
      }
    }

    html += `
      <button 
        class="btn-pag"
        ${pagina_atual === total_paginas ? "disabled" : ""}
        onclick="gerenciadorPedidos.irParaPagina(${pagina_atual + 1})"
      >
        Próximo
      </button>
    `;

    container.innerHTML = html;
  }

  /**
   * Ver detalhes do pedido
   */
  async verDetalhes(nro_pedido) {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        alert("Você precisa estar logado para ver os detalhes do pedido.");
        window.location.href = "/login_cliente.html";
        return;
      }

      const response = await fetch(`/api/pedidos/detalhes/${nro_pedido}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        credentials: "include",
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.erro || "Erro ao carregar detalhes");
      }

      const data = await response.json();

      if (data.sucesso) {
        this.mostrarModalDetalhes(data.pedido);
      } else {
        alert(data.erro || "Erro ao carregar detalhes do pedido");
      }
    } catch (error) {
      console.error("Erro ao carregar detalhes:", error);
      alert(error.message || "Erro ao carregar detalhes do pedido");
    }
  }

  /**
   * Mostrar modal com detalhes
   */
  mostrarModalDetalhes(pedido) {
    const podeCancelar = pedido.status === 'PENDENTE';
    const modal = document.createElement("div");
    modal.className = "modal-overlay";
    modal.innerHTML = `<div class="modal-content">
        <div class="modal-header">
          <h2>Pedido #${String(pedido.nro_pedido).padStart(3, '0')}</h2>
          <button class="btn-fechar" onclick="this.closest('.modal-overlay').remove()">×</button>
        </div>
        <div class="modal-body">
          <div class="info-grupo">
            <label>Data do Pedido:</label>
            <span>${this.formatarData(pedido.data_pedido)}</span>
          </div>
          <div class="info-grupo">
            <label>Status:</label>
            <span class="pedido-status status-${pedido.status.toLowerCase()}">
              ${this.formatarStatus(pedido.status)}
            </span>
          </div>
          
          <h3>Itens do Pedido</h3>
          <table class="tabela-itens">
            <thead>
              <tr>
                <th>Produto</th>
                <th>Qtd</th>
                <th>Preço Unit.</th>
                <th>Subtotal</th>
              </tr>
            </thead>
            <tbody>
              ${pedido.itens.map(item => `
                <tr>
                  <td>${item.produto}</td>
                  <td>${item.qtd}</td>
                  <td>R$ ${this.formatarValor(item.preco_unitario)}</td>
                  <td>R$ ${this.formatarValor(item.subtotal)}</td>
                </tr>
              `).join('')}
            </tbody>
            <tfoot>
              <tr>
                <td colspan="3"><strong>Total:</strong></td>
                <td><strong>R$ ${this.formatarValor(pedido.valor_total)}</strong></td>
              </tr>
            </tfoot>
          </table>

          ${podeCancelar ? `
            <div class="modal-actions" style="margin-top: 1.5rem; border-top: 1px solid #e5e7eb; padding-top: 1.5rem;">
              <button 
                class="btn-cancelar-pedido" 
                onclick="gerenciadorPedidos.confirmarCancelamento(${pedido.nro_pedido}, this)"
                style="background-color: #ef4444; color: white; padding: 0.75rem 1.5rem; border: none; border-radius: 8px; cursor: pointer; font-weight: 600;"
              >
                🗑️ Cancelar Pedido
              </button>
              <p style="margin-top: 0.5rem; font-size: 0.875rem; color: #6b7280;">
                Esta ação devolverá os produtos ao estoque.
              </p>
            </div>
          ` : ''}
        </div>
      </div>
    `;

    document.body.appendChild(modal);
  }

  async confirmarCancelamento(nro_pedido, btnElement) {
    if (
      !confirm(
        "Tem certeza que deseja cancelar este pedido? Os itens serão devolvidos ao estoque."
      )
    ) {
      return;
    }

    try {
      btnElement.disabled = true;
      btnElement.textContent = "⏳ Cancelando...";
      const token = localStorage.getItem("token");
      const response = await fetch(`/api/pedidos/cancelar/${nro_pedido}`, {
        method: "PATCH",
        credentials: "include",
        headers: {

          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
      });

      const data = await response.json();

      if (!response.ok || !data.sucesso) {
        throw new Error(data.erro || "Erro ao cancelar pedido");
      }

      // Fechar modal
      btnElement.closest(".modal-overlay").remove();

      // Mostrar mensagem de sucesso
      alert("✅ " + data.mensagem);

      // Recarregar pedidos
      await this.carregarPedidos();
    } catch (error) {
      console.error("Erro:", error);
      alert("❌ " + error.message);
      btnElement.disabled = false;
      btnElement.textContent = "🗑️ Cancelar Pedido";
    }
  }

  /**
   * Ir para página específica
   */
  async irParaPagina(pagina) {
    this.paginaAtual = pagina;
    await this.carregarPedidos();
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  /**
   * Helpers de formatação
   */
  formatarData(data) {
    return new Date(data).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  }

  formatarValor(valor) {
    return Number(valor).toFixed(2).replace(".", ",");
  }

  formatarStatus(status) {
    const labels = {
      PENDENTE: "Pendente",
      CONCLUIDO: "Concluído",
      CANCELADO: "Cancelado",
      "NO CARRINHO": "Carrinho",
    };
    return labels[status] || status;
  }

  mostrarErro(mensagem) {
    const container = document.getElementById("listaPedidos");
    if (container) {
      container.innerHTML = `
        <div class="alert-erro">
          <p>${mensagem}</p>
        </div>
      `;
    }
  }
}

// Instância global
const gerenciadorPedidos = new GerenciadorMeusPedidos();

// Inicializar quando o DOM estiver pronto
document.addEventListener("DOMContentLoaded", () => {
  gerenciadorPedidos.init();
});
