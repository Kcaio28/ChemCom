import {pool} from "../config/database.js";
import PedidoModel from "../models/PedidoModel.js";

export const PedidoController = {
  async listarPedidosPorCliente(req, res) {
    try {
      const id_cliente = req.user.id;
      const pedidos = await PedidoModel.listarPedidosPorCliente(id_cliente);
      return res.json(pedidos);
    } catch (err) {
      return res.status(500).json({ erro: err.message });
    }
  },
  async listarCarrinho(req, res) {
    try {
      const id_cliente = req.user.id;
      const carrinho = await PedidoModel.listarCarrinho(id_cliente);
      res.json(carrinho);
    } catch (err) {
      res.status(500).json({ erro: err.message });
    }
  },
  async adicionarItem(req, res) {
    try {
      const id_cliente = req.user.id;
      const { id_produto, id_lote, qtd } = req.body;

      const resposta = await PedidoModel.adicionarItem(
        id_cliente,
        id_produto,
        id_lote,
        qtd
      );
      return res.json(resposta);
    } catch (err) {
      res.json({ erro: err.message });
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
};

export const finalizarCompra = async (req, res) => {
  const { id_cliente, itens } = req.body;

  if (!id_cliente || !itens || itens.length === 0) {
    return res.status(400).json({
      sucesso: false,
      mensagem: "Dados inválidos"
    });
  }

  const conn = await pool.getConnection();

  try {
    await conn.beginTransaction();

    // 1 - Calcular valor total
    const valor_total = itens.reduce((total, item) =>
      total + (Number(item.preco) * Number(item.qtd)), 0
    );

    // 2 - Criar pedido
    const [pedidoResult] = await conn.query(
      `INSERT INTO pedido (id_cliente, valor_total, data_pedido, status)
       VALUES (?, ?, NOW(), ?)`,
      [id_cliente, valor_total, "PENDENTE"]
    );

    const nro_pedido = pedidoResult.insertId;

    // 3 - Processar cada item do carrinho
    for (const item of itens) {
      const { id_produto, qtd } = item;

      let quantidadeSolicitada = Number(qtd);

      // Buscar lotes válidos (ordem por validade)
      const [lotes] = await conn.query(
        `SELECT * FROM lotes 
         WHERE id_produto = ? AND qtd_atual > 0
         ORDER BY data_validade ASC`,
        [id_produto]
      );

      if (lotes.length === 0) {
        throw new Error(`Produto ${id_produto} sem estoque`);
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

        // Registrar item no pedido
        await conn.query(
          `INSERT INTO itensPedidos 
           (nro_pedido, id_produto, id_lote, qtd, preco_unitario)
           VALUES (?, ?, ?, ?, ?)`,
          [nro_pedido, id_produto, lote.id, usar, precoUnitario]
        );

        // Atualizar lote
        await conn.query(
          `UPDATE lotes SET qtd_atual = qtd_atual - ? WHERE id = ?`,
          [usar, lote.id]
        );

        quantidadeSolicitada -= usar;
      }

      if (quantidadeSolicitada > 0) {
        throw new Error(`Estoque insuficiente para o produto ${id_produto}`);
      }
    }

    await conn.commit();

    res.json({
      sucesso: true,
      mensagem: "Compra finalizada com sucesso!",
      pedido: nro_pedido
    });

  } catch (err) {
    await conn.rollback();
    console.error(err);

    res.status(500).json({
      sucesso: false,
      erro: err.message
    });

  } finally {
    conn.release();
  }
};
