import {
  create,
  read,
  update,
  deleteRecord,
  comparePassword,
  hashPassword,
  getConnection,
} from "../config/database.js";

const TABELA = "Pedido"; // nome correto da tabela

class PedidoModel {
  // Listar todas as empresas (com paginação)
  static async listarTodos(pagina = 1, limite = 10) {
    try {
      const offset = (pagina - 1) * limite;
      const connection = await getConnection();

      try {
        const sql = `SELECT * FROM ${TABELA} ORDER BY nro_pedido DESC LIMIT ? OFFSET ?`;
        const [Pedidos] = await connection.query(sql, [limite, offset]);

        const [totalResult] = await connection.execute(
          `SELECT COUNT(*) as total FROM ${TABELA}`
        );
        const total = totalResult[0].total;

        return {
          Pedidos,
          total,
          pagina,
          limite,
          totalPaginas: Math.ceil(total / limite),
        };
      } finally {
        connection.release();
      }
    } catch (error) {
      console.error("Erro ao listar pedidos:", error);
      throw error;
    }
  }

  static async getOrCreateCarrinho(id_cliente) {
    try {
      const connection = await getConnection();

      // Verifica se já existe pedido "NO CARRINHO"
      const [rows] = await connection.query(
        `SELECT nro_pedido FROM ${TABELA}
                 WHERE id_cliente = ? AND status = 'NO CARRINHO'
                 LIMIT 1`,
        [id_cliente]
      );

      connection.release();

      if (rows.length > 0) {
        return rows[0].nro_pedido;
      }

      // Criar carrinho usando CREATE()
      const nro_pedido = await create(TABELA, {
        id_cliente,
        valor_total: 0,
        data_pedido: new Date(),
        status: "NO CARRINHO",
      });

      return nro_pedido;
    } catch (error) {
      console.error("Erro ao criar/obter carrinho:", error);
      throw error;
    }
  }

  static async adicionarItem(id_cliente, id_produto, id_lote, qtd) {
    try {
      const nro_pedido = await this.getOrCreateCarrinho(id_cliente);

      const connection = await getConnection();

      const [result] = await create("item", {
        id_produto,
        id_lote,
        qtd,
        nro_pedido,
      });

      connection.release();

      return {
        sucesso: true,
        nro_pedido,
        id_item: result.insertId,
      };
    } catch (error) {
      console.error("Erro ao adicionar item ao carrinho:", error);
      throw error;
    }
  }

  static async removerItem(nro_pedido, id_item) {
    try {
      const connection = await getConnection();

      await deleteRecord(
        "itensPedido",
        `id_item = ${id_item} and nro_pedido = ${nro_pedido}`
      )
      return (`Item ${nro_pedido} exclúido com sucesso.`)
    } catch (error) {
      console.error("Erro ao remover item do carrinho:", error);
      throw error;
    }
  }

  static async listarCarrinho(id_cliente) {
    try {
      const connection = await getConnection();

      const [pedido] = await connection.query(
        `SELECT nro_pedido FROM ${TABELA}
                 WHERE id_cliente = ? AND status = 'NO CARRINHO'
                 LIMIT 1`,
        [id_cliente]
      );

      if (pedido.length === 0) {
        connection.release();
        return { nro_pedido: null, itens: [] };
      }

      const nro_pedido = pedido[0].nro_pedido;

      const [itens] = await connection.query(
        `SELECT it.id AS id_item, it.qtd,
                        p.nome, p.preco,
                        l.id AS id_lote
                 FROM item it
                 JOIN produto p ON p.id = it.id_produto
                 JOIN lotes l ON l.id = it.id_lote
                 WHERE it.nro_pedido = ?`,
        [nro_pedido]
      );

      connection.release();

      return { nro_pedido, itens };
    } catch (error) {
      console.error("Erro ao listar carrinho:", error);
      throw error;
    }
  }

  // Verificar credenciais de login
  static async finalizarPedido(id_cliente) {
    const connection = await getConnection();

    try {
      await connection.beginTransaction();

      const [pedido] = await connection.query(
        `SELECT nro_pedido FROM ${TABELA}
                 WHERE id_cliente = ? AND status = 'NO CARRINHO'
                 LIMIT 1 FOR UPDATE`,
        [id_cliente]
      );

      if (pedido.length === 0) throw new Error("Carrinho inexistente");

      const nro_pedido = pedido[0].nro_pedido;

      const [itens] = await connection.query(
        `SELECT it.id AS id_item, it.qtd, it.id_lote,
                        p.id AS id_produto, p.preco
                 FROM item it
                 JOIN produto p ON p.id = it.id_produto
                 WHERE it.nro_pedido = ?`,
        [nro_pedido]
      );

      if (itens.length === 0) throw new Error("Carrinho vazio");

      let total = 0;

      const [lote] = await connection.query(
        `SELECT qtd_inicial FROM lotes WHERE id = ? FOR UPDATE`,
        [i.id_lote]
      );

      // Validação de estoque e cálculo total
      for (const i of itens) {
        if (lote.length === 0) throw new Error("Lote inválido");

        if (lote[0].qtd_inicial < i.qtd)
          throw new Error("Estoque insuficiente");

        total += Number(i.preco) * Number(i.qtd);
      }

      // Baixa de estoque + itensPedidos
      for (const i of itens) {
        await update(
          "lotes",
          {
            qtd_inicial: lote[0].qtd_inicial - i.qtd,
          },
          `id = ${i.id_lote}`
        );

        await create("itensPedidos", {
          id_item: i.id_item,
          nro_pedido,
          preco_unitario: i.preco,
        });
      }

      // Atualiza pedido para PENDENTE
      await update(
        TABELA,
        {
          valor_total: total,
          status: "PENDENTE",
        },
        `nro_pedido = ${nro_pedido}`
      );

      await connection.commit();
      connection.release();

      return nro_pedido;
    } catch (error) {
      await connection.rollback();
      connection.release();
      console.error("Erro ao finalizar pedido:", error);
      throw error;
    }
  }
}

export default UsuarioModel;
