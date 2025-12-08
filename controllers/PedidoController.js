import { pool } from "../config/database.js";
import PedidoModel from "../models/PedidoModel.js";

export const PedidoController = {
  async meusPedidos(req, res) {
    try {
      if (!req.user || !req.user.id) {
        return res.status(401).json({
          sucesso: false,
          erro: "Usuário não autenticado",
        });
      }

      const id_cliente = req.user.id;
      const pagina = parseInt(req.query.pagina) || 1;
      const limite = parseInt(req.query.limite) || 9;

      const resultado = await PedidoModel.listarMeusPedidosComPaginacao(
        id_cliente,
        pagina,
        limite
      );

      return res.json({
        sucesso: true,
        pedidos: resultado.pedidos || [],
        paginacao: resultado.paginacao,
      });
    } catch (err) {
      console.error("Erro em meusPedidos:", err);
      return res.status(500).json({
        sucesso: false,
        erro: err.message || "Erro ao listar pedidos",
      });
    }
  },

  async cancelarPedido(req, res) {
    try {
      const { nro_pedido } = req.params;
      const id_cliente = req.user.id;

      if (!id_cliente) {
        return res.status(401).json({
          erro: "Usuário não autenticado",
          sucesso: false,
        });
      }

      const resultado = await PedidoModel.cancelarPedido(
        parseInt(nro_pedido),
        id_cliente
      );

      return res.json({
        sucesso: true,
        ...resultado,
      });
    } catch (err) {
      console.error("Erro em cancelarPedido:", err);
      return res.status(400).json({
        sucesso: false,
        erro: err.message,
      });
    }
  },

  /**
   * ADMIN - Listar todos os pedidos
   * GET /api/pedidos/admin/todos-pedidos
   */
  async todosPedidos(req, res) {
    try {
      const {
        pagina = 1,
        limite = 10,
        status,
        data_inicio,
        data_fim,
        cliente,
      } = req.query;

      // Validar se é admin
      if (!req.user || req.user.tipo !== "admin") {
        return res.status(403).json({
          erro: "Acesso restrito a administradores",
        });
      }

      const resultado = await PedidoModel.listarTodosPedidos(
        {
          status,
          data_inicio,
          data_fim,
          cliente,
        },
        parseInt(pagina),
        parseInt(limite)
      );

      return res.json({
        sucesso: true,
        pedidos: resultado.pedidos,
        paginacao: resultado.paginacao,
      });
    } catch (err) {
      console.error("Erro em todosPedidos:", err);
      return res.status(500).json({
        sucesso: false,
        erro: err.message,
      });
    }
  },

  /**
   * Detalhar pedido específico
   * GET /api/pedidos/detalhes/:nro_pedido
   */
  async detalharPedido(req, res) {
    try {
      const { nro_pedido, id } = req.params;
      // Se vier como :id, usar como nro_pedido também
      const pedidoId = nro_pedido || id;
      const id_cliente = req.user ? req.user.id : null;
      const isAdmin = req.user && req.user.tipo === "admin";

      if (!pedidoId) {
        return res.status(400).json({
          erro: "Número do pedido não informado",
        });
      }

      const pedido = await PedidoModel.detalharPedido(
        parseInt(pedidoId),
        isAdmin,
        id_cliente
      );

      return res.json({
        sucesso: true,
        pedido,
      });
    } catch (err) {
      console.error("Erro em detalharPedido:", err);

      // Se for erro de acesso negado, retornar 403
      if (
        err.message.includes("não encontrado") ||
        err.message.includes("negado")
      ) {
        return res.status(403).json({
          sucesso: false,
          erro: "Acesso negado ou pedido não encontrado",
        });
      }

      return res.status(500).json({
        sucesso: false,
        erro: err.message,
      });
    }
  },

  async atualizarStatus(req, res) {
    try {
      const { nro_pedido } = req.params;
      const { status } = req.body;

      // Validar se é admin
      if (!req.user || req.user.tipo !== "admin") {
        return res.status(403).json({
          erro: "Acesso restrito a administradores",
          sucesso: false,
        });
      }

      if (!status) {
        return res.status(400).json({
          erro: "Status não informado",
          sucesso: false,
        });
      }

      const resultado = await PedidoModel.atualizarStatus(
        parseInt(nro_pedido),
        status,
        true // isAdmin = true
      );

      return res.json({
        sucesso: true,
        mensagem: `Status atualizado de ${resultado.status_anterior} para ${resultado.status_atual}`,
        ...resultado,
      });
    } catch (err) {
      console.error("Erro em atualizarStatus:", err);
      return res.status(400).json({
        sucesso: false,
        erro: err.message,
      });
    }
  },

  async listarCarrinho(req, res) {
    try {
      const userId = req.user && req.user.id;
      if (!userId) return res.status(401).json({ error: "Não autenticado" });

      const carrinho = await PedidoModel.listarCarrinho(userId);

      // Retornar os números formatados como números (não string), frontend fará formatação
      res.json(carrinho);
    } catch (err) {
      console.error("Erro GET /carrinho", err);
      res.status(500).json({ error: "Erro ao buscar carrinho" });
    }
  },
  async removerItem(req, res) {
    try {
      const nro_pedido = req.params.nro;
      const id_item = req.params.id;

      const resultado = await PedidoModel.removerItem(nro_pedido, id_item);
      return res.json(resultado);
    } catch (err) {
      return res.status(400).json({ erro: err.message });
    }
  },
  async finalizarPedido(req, res) {
    try {
      const id_cliente = req.user.id;
      const nro_pedido = await PedidoModel.finalizarPedido(id_cliente);
      return res.json({ mensagem: "Pedido Finalizado", nro_pedido });
    } catch (err) {
      res.status(500).json({ erro: err.message });
    }
  },
  async listarPedidoPorCliente(req, res) {
    try {
      const id_cliente = req.user.id;

      if (!id_cliente) {
        return res.status(401).json({
          erro: "Usuário não autenticado",
        });
      }

      const resultado = await PedidoModel.listarMeusPedidos(id_cliente);

      return res.json({
        sucesso: true,
        pedidos: resultado.pedidos,
      });
    } catch (err) {
      console.error("Erro em listarPedidoPorCliente:", err);
      return res.status(500).json({
        sucesso: false,
        erro: err.message,
      });
    }
  },
  async adicionarItem(req, res) {
    try {
      const id_cliente = req.user.id;
      const { id_produto, id_lote, qtd } = req.body;

      if (!id_cliente) {
        return res.status(401).json({
          erro: "Usuário não autenticado",
        });
      }

      if (!id_produto || !id_lote || !qtd) {
        return res.status(400).json({
          erro: "Dados incompletos. Necessário: id_produto, id_lote, qtd",
        });
      }

      const resultado = await PedidoModel.adicionarItem(
        id_cliente,
        id_produto,
        id_lote,
        qtd
      );

      return res.json(resultado);
    } catch (err) {
      console.error("Erro em adicionarItem:", err);
      return res.status(500).json({
        sucesso: false,
        erro: err.message,
      });
    }
  },
};

export const finalizarCompra = async (req, res) => {
  const { id_cliente, itens } = req.body;

  if (!id_cliente || !itens || itens.length === 0) {
    return res.status(400).json({
      sucesso: false,
      mensagem: "Dados inválidos",
    });
  }

  const conn = await pool.getConnection();

  try {
    await conn.beginTransaction();

    // ============================================================
    // 1. BUSCAR AUTORIZAÇÕES DA EMPRESA
    // ============================================================
    const [autorizacoes] = await conn.query(
      `SELECT categoria, nivel FROM autorizacoes_categoria WHERE id_empresa = ?`,
      [id_cliente]
    );
    console.log("AUTORIZAÇÕES ENCONTRADAS NO BANCO:", autorizacoes);

    if (autorizacoes.length === 0) {
      throw new Error("Esta empresa não possui nenhuma autorização cadastrada.");
    }

    // Criar mapa: { acidos: 3, bases: 0 ... }
    const mapaAutorizacoes = {};
    autorizacoes.forEach(a => {
      mapaAutorizacoes[a.categoria.toLowerCase()] = Number(a.nivel);
    });

    // ============================================================
    // 2. VALIDAR AUTORIZAÇÃO PARA CADA PRODUTO DO CARRINHO
    // ============================================================
    for (const item of itens) {
      const { id_produto } = item;

      const [[produto]] = await conn.query(
        `SELECT categoria, id_classificacao FROM produto WHERE id = ?`,
        [id_produto]
      );

      if (!produto) {
        throw new Error(`Produto ${id_produto} não encontrado.`);
      }

      // Buscar classificação de risco para obter o nível
      const [[classificacao]] = await conn.query(
        `SELECT id FROM classificacao_risco WHERE id = ?`,
        [produto.id_classificacao]
      );

      const categoriaProd = produto.categoria.toLowerCase();
      const nivelProd = classificacao.id; // id = nível

      const nivelAutorizado = mapaAutorizacoes[categoriaProd] || 0;

      if (nivelAutorizado < nivelProd) {
        throw new Error(
          `A empresa não possui autorização para comprar ${produto.categoria} nível ${nivelProd}. (Autorizado até nível ${nivelAutorizado})`
        );
      }
    }
    console.log("MAPA AUTORIZAÇÕES:", mapaAutorizacoes);

    console.log("✔ Autorização validada para todos os produtos.");

    // ============================================================
    // 3. CALCULAR VALOR TOTAL
    // ============================================================
    const valor_total = itens.reduce(
      (total, item) => total + Number(item.preco) * Number(item.qtd),
      0
    );

    // ============================================================
    // 4. CRIAR PEDIDO
    // ============================================================
    const [pedidoResult] = await conn.query(
      `INSERT INTO pedido (id_cliente, valor_total, data_pedido, status)
       VALUES (?, ?, NOW(), ?)`,
      [id_cliente, valor_total, "PENDENTE"]
    );

    const nro_pedido = pedidoResult.insertId;

    // ============================================================
    // 5. PROCESSAR ITENS (estoque por lote)
    // ============================================================
    for (const item of itens) {
      const { id_produto, qtd } = item;

      let quantidadeSolicitada = Number(qtd);

      // Buscar lotes válidos (ordem: mais próximo de vencer)
      const [lotes] = await conn.query(
        `SELECT * FROM lotes 
         WHERE id_produto = ? AND qtd_atual > 0
         ORDER BY data_validade ASC`,
        [id_produto]
      );

      if (lotes.length === 0) {
        throw new Error(`Produto ${id_produto} sem estoque.`);
      }

      for (const lote of lotes) {
        if (quantidadeSolicitada <= 0) break;

        const usar = Math.min(quantidadeSolicitada, lote.qtd_atual);

        // Buscar preço do produto
        const [[produtoInfo]] = await conn.query(
          `SELECT preco FROM produto WHERE id = ?`,
          [id_produto]
        );

        const precoUnitario = Number(produtoInfo.preco);

        // Inserir item no pedido
        await conn.query(
          `INSERT INTO itensPedidos 
           (nro_pedido, id_produto, id_lote, qtd, preco_unitario)
           VALUES (?, ?, ?, ?, ?)`,
          [nro_pedido, id_produto, lote.id, usar, precoUnitario]
        );

        // Atualizar estoque do lote
        await conn.query(
          `UPDATE lotes SET qtd_atual = qtd_atual - ? WHERE id = ?`,
          [usar, lote.id]
        );

        quantidadeSolicitada -= usar;
      }

      if (quantidadeSolicitada > 0) {
        throw new Error(`Estoque insuficiente para o produto ${id_produto}.`);
      }
    }

    // ============================================================
    // 6. FINALIZA TRANSAÇÃO
    // ============================================================
    await conn.commit();

    res.json({
      sucesso: true,
      mensagem: "Compra finalizada com sucesso!",
      pedido: nro_pedido,
    });

  } catch (err) {
    await conn.rollback();
    console.error(err);

    res.status(500).json({
      sucesso: false,
      erro: err.message,
    });

  } finally {
    conn.release();
  }
};
