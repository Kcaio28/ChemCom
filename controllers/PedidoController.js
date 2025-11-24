import { PedidoModel } from "../models/PedidoModel.js";

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
