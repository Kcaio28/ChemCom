class GerenciadorAdminPedidos {
  constructor() {
    this.paginaAtual = 1;
    this.itensPorPagina = 10;
    this.filtros = {
      status: '',
      data_inicio: '',
      data_fim: '',
      cliente: ''
    };
  }

  async init() {
    this.setupEventListeners();
    await this.carregarPedidos();
  }

  setupEventListeners() {
    const btnFiltrar = document.getElementById('btnFiltrar');
    if (btnFiltrar) {
      btnFiltrar.addEventListener('click', async () => {
        this.paginaAtual = 1;
        this.aplicarFiltros();
        await this.carregarPedidos();
      });
    }

    // Enter nos campos de filtro
    ['dataInicio', 'dataFim', 'filtroStatus', 'filtroCliente'].forEach(id => {
      const elemento = document.getElementById(id);
      if (elemento) {
        elemento.addEventListener('keypress', (e) => {
          if (e.key === 'Enter') {
            btnFiltrar.click();
          }
        });
      }
    });
  }

  aplicarFiltros() {
    this.filtros = {
      status: document.getElementById('filtroStatus')?.value || '',
      data_inicio: document.getElementById('dataInicio')?.value || '',
      data_fim: document.getElementById('dataFim')?.value || '',
      cliente: document.getElementById('filtroCliente')?.value || ''
    };
  }

  async carregarPedidos() {
    try {
      const params = new URLSearchParams({
        pagina: this.paginaAtual,
        limite: this.itensPorPagina,
        ...this.filtros
      });

      const token = localStorage.getItem('token');
      const response = await fetch(`/api/pedidos/admin/todos-pedidos?${params}`, {
        credentials: 'include',
        headers: {
          'Authorization': token ? `Bearer ${token}` : ''
        }
      });

      if (!response.ok) {
        if (response.status === 403) {
          throw new Error('Acesso negado. Você precisa ser administrador.');
        }
        throw new Error('Erro ao carregar pedidos');
      }

      const data = await response.json();
      
      if (data.sucesso) {
        this.renderizarTabela(data.pedidos);
        this.renderizarPaginacao(data.paginacao);
      }
    } catch (error) {
      console.error('Erro:', error);
      this.mostrarErro(error.message);
    }
  }

  renderizarTabela(pedidos) {
    const tbody = document.getElementById('tabelaPedidos');
    
    if (!tbody) return;

    if (pedidos.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="7" style="text-align: center; padding: 2rem;">
            Nenhum pedido encontrado
          </td>
        </tr>
      `;
      return;
    }

    tbody.innerHTML = pedidos.map(pedido => `
      <tr>
        <td>#${String(pedido.nro_pedido).padStart(3, '0')}</td>
        <td>
          <div class="cliente-info">
            <strong>${pedido.cliente}</strong>
            <small>${pedido.email}</small>
          </div>
        </td>
        <td>${this.formatarData(pedido.data_pedido)}</td>
        <td>${pedido.quantidade_itens}</td>
        <td><strong>R$ ${this.formatarValor(pedido.valor_total)}</strong></td>
        <td>
          <span class="badge status-${pedido.status.toLowerCase()}">
            ${this.formatarStatus(pedido.status)}
          </span>
        </td>
        <td>
          <button 
            class="btn-acao" 
            onclick="adminPedidos.verDetalhes(${pedido.nro_pedido})"
            title="Ver detalhes"
          >
            👁️
          </button>
          </button>
          <button 
            class="btn-acao btn-status" 
            onclick="adminPedidos.abrirModalStatus(${pedido.nro_pedido}, '${pedido.status}')"
            title="Alterar status"
          >
            ✏️
          </button>
        </td>
      </tr>
    `).join('');
  }

  renderizarPaginacao(paginacao) {
    const container = document.getElementById('paginacao');
    
    if (!container || paginacao.total_paginas <= 1) {
      if (container) container.innerHTML = '';
      return;
    }

    const { pagina_atual, total_paginas, total_itens } = paginacao;
    
    let html = `
      <div class="paginacao-info">
        Total: ${total_itens} pedido(s)
      </div>
      <div class="paginacao-controles">
        <button 
          class="btn-pag" 
          ${pagina_atual === 1 ? 'disabled' : ''}
          onclick="adminPedidos.irParaPagina(${pagina_atual - 1})"
        >
          ← Anterior
        </button>
    `;

    for (let i = 1; i <= total_paginas; i++) {
      if (i === 1 || i === total_paginas || (i >= pagina_atual - 2 && i <= pagina_atual + 2)) {
        html += `
          <button 
            class="btn-pag ${i === pagina_atual ? 'active' : ''}"
            onclick="adminPedidos.irParaPagina(${i})"
          >
            ${i}
          </button>
        `;
      } else if (i === pagina_atual - 3 || i === pagina_atual + 3) {
        html += `<span>...</span>`;
      }
    }

    html += `
        <button 
          class="btn-pag"
          ${pagina_atual === total_paginas ? 'disabled' : ''}
          onclick="adminPedidos.irParaPagina(${pagina_atual + 1})"
        >
          Próximo →
        </button>
      </div>
    `;

    container.innerHTML = html;
  }

  async verDetalhes(nro_pedido) {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/pedidos/admin/detalhes/${nro_pedido}`, {
        credentials: 'include',
        headers: {
          'Authorization': token ? `Bearer ${token}` : ''
        }
      });

      if (!response.ok) throw new Error('Erro ao carregar detalhes');

      const data = await response.json();
      
      if (data.sucesso) {
        this.mostrarModalDetalhes(data.pedido);
      }
    } catch (error) {
      console.error('Erro:', error);
      alert('Erro ao carregar detalhes do pedido');
    }
  }

  mostrarModalDetalhes(pedido) {
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.innerHTML = `
      <div class="modal-content modal-large">
        <div class="modal-header">
          <h2>Detalhes do Pedido #${String(pedido.nro_pedido).padStart(3, '0')}</h2>
          <button class="btn-fechar" onclick="this.closest('.modal-overlay').remove()">×</button>
        </div>
        <div class="modal-body">
          <div class="grid-info">
            <div class="info-card">
              <h3>Cliente</h3>
              <p><strong>${pedido.cliente}</strong></p>
              <p>${pedido.email_cliente}</p>
            </div>
            
            <div class="info-card">
              <h3>Pedido</h3>
              <p>Data: ${this.formatarData(pedido.data_pedido)}</p>
              <p>Status: <span class="badge status-${pedido.status.toLowerCase()}">${this.formatarStatus(pedido.status)}</span></p>
            </div>
          </div>
          
          <h3>Itens do Pedido</h3>
          <table class="tabela-detalhes">
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
        </div>
      </div>
    `;
    
    document.body.appendChild(modal);
  }
  abrirModalStatus(nro_pedido, statusAtual) {
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.innerHTML = `
      <div class="modal-content modal-small">
        <div class="modal-header">
          <h2>Alterar Status do Pedido #${String(nro_pedido).padStart(3, '0')}</h2>
          <button class="btn-fechar" onclick="this.closest('.modal-overlay').remove()">×</button>
        </div>
        <div class="modal-body">
          <div class="form-group">
            <label for="novoStatus">Status Atual: <strong>${this.formatarStatus(statusAtual)}</strong></label>
            <select id="novoStatus" class="form-control">
              <option value="">Selecione o novo status</option>
              <option value="PENDENTE" ${statusAtual === 'PENDENTE' ? 'selected' : ''}>⏳ Pendente</option>
              <option value="CONCLUIDO" ${statusAtual === 'CONCLUIDO' ? 'selected' : ''}>✅ Concluído</option>
              <option value="CANCELADO" ${statusAtual === 'CANCELADO' ? 'selected' : ''}>❌ Cancelado</option>
            </select>
            <p style="margin-top: 0.5rem; font-size: 0.875rem; color: #6b7280;">
              Como administrador, você pode alterar para qualquer status.
            </p>
          </div>
          
          <div class="modal-actions">
            <button class="btn-cancelar" onclick="this.closest('.modal-overlay').remove()">
              Cancelar
            </button>
            <button class="btn-confirmar" onclick="adminPedidos.confirmarAlteracaoStatus(${nro_pedido}, this)">
              Confirmar Alteração
            </button>
          </div>
        </div>
      </div>
    `;
    
    document.body.appendChild(modal);
  }
  async confirmarAlteracaoStatus(nro_pedido, btnElement) {
    try {
      const modal = btnElement.closest('.modal-overlay');
      const novoStatus = document.getElementById('novoStatus').value;

      if (!novoStatus) {
        alert('Por favor, selecione um status');
        return;
      }

      // Desabilitar botão durante requisição
      btnElement.disabled = true;
      btnElement.textContent = 'Atualizando...';
      const token = localStorage.getItem("token");

      const response = await fetch(`/api/pedidos/admin/status/${nro_pedido}`, {
        method: 'PATCH',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ status: novoStatus })
      });

      const data = await response.json();

      if (!response.ok || !data.sucesso) {
        throw new Error(data.erro || 'Erro ao atualizar status');
      }

      // Fechar modal
      modal.remove();

      // Mostrar mensagem de sucesso
      this.mostrarNotificacao('Status atualizado com sucesso!', 'sucesso');

      // Recarregar lista de pedidos
      await this.carregarPedidos();

    } catch (error) {
      console.error('Erro:', error);
      alert('Erro ao atualizar status: ' + error.message);
      btnElement.disabled = false;
      btnElement.textContent = 'Confirmar Alteração';
    }
  }
   mostrarNotificacao(mensagem, tipo = 'info') {
    const notificacao = document.createElement('div');
    notificacao.className = `notificacao notificacao-${tipo}`;
    notificacao.textContent = mensagem;
    notificacao.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      padding: 1rem 1.5rem;
      background: ${tipo === 'sucesso' ? '#10b981' : '#3b82f6'};
      color: white;
      border-radius: 8px;
      box-shadow: 0 4px 6px rgba(0,0,0,0.1);
      z-index: 10000;
      animation: slideIn 0.3s ease-out;
    `}

  async irParaPagina(pagina) {
    this.paginaAtual = pagina;
    await this.carregarPedidos();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  formatarData(data) {
    return new Date(data).toLocaleDateString('pt-BR');
  }

  formatarValor(valor) {
    return Number(valor).toFixed(2).replace('.', ',');
  }

  formatarStatus(status) {
    const labels = {
      'PENDENTE': 'Pendente',
      'CONCLUIDO': 'Concluído',
      'CANCELADO': 'Cancelado',
      'NO CARRINHO': 'Carrinho'
    };
    return labels[status] || status;
  }

  mostrarErro(mensagem) {
    const tbody = document.getElementById('tabelaPedidos');
    if (tbody) {
      tbody.innerHTML = `
        <tr>
          <td colspan="7" style="text-align: center; color: red;">
            ${mensagem}
          </td>
        </tr>
      `;
    }
  }
}

const adminPedidos = new GerenciadorAdminPedidos();

document.addEventListener('DOMContentLoaded', () => {
  adminPedidos.init();
});