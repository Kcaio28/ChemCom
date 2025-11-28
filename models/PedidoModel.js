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
  static async listarMeusPedidos(id_cliente) {
  const connection = await getConnection();
  
  try {

    const query = `
      SELECT 
        p.nro_pedido,
        DATE_FORMAT(p.data_pedido, '%Y-%m-%d %H:%i:%s') AS data_pedido,
        p.status,
        p.valor_total,
        COALESCE(
          (SELECT SUM(ip.qtd)
           FROM itensPedidos ip
           WHERE ip.nro_pedido = p.nro_pedido), 0
        ) AS quantidade_itens
      FROM ${TABELA} p
      WHERE p.id_cliente = ?
        AND p.status != 'NO CARRINHO'
      ORDER BY p.data_pedido DESC
    `;

    const [pedidos] = await connection.query(query, [id_cliente]);

    return {
      pedidos
    };

  } finally {
    connection.release();
  }
  }

  static async listarTodosPedidos(filtros = {}, pagina = 1, limite = 10) {
  const connection = await getConnection();
  
  try {
    let where = "WHERE p.status != 'NO CARRINHO'";
    const params = [];

    // Aplicar filtros
    if (filtros.status) {
      where += " AND p.status = ?";
      params.push(filtros.status);
    }

    if (filtros.data_inicio) {
      where += " AND DATE(p.data_pedido) >= ?";
      params.push(filtros.data_inicio);
    }

    if (filtros.data_fim) {
      where += " AND DATE(p.data_pedido) <= ?";
      params.push(filtros.data_fim);
    }

    if (filtros.cliente) {
      where += " AND (u.nome LIKE ? OR u.email LIKE ?)";
      params.push(`%${filtros.cliente}%`, `%${filtros.cliente}%`);
    }

    // Contar total de registros
    const [totalResult] = await connection.query(
      `SELECT COUNT(*) as total FROM ${TABELA} p INNER JOIN usuario u ON u.id = p.id_cliente ${where}`,
      params
    );
    const total = totalResult[0].total;

    // Calcular offset
    const offset = (pagina - 1) * limite;

    // Query principal com paginação
    const query = `
      SELECT 
        p.nro_pedido,
        DATE_FORMAT(p.data_pedido, '%Y-%m-%d %H:%i:%s') AS data_pedido,
        p.status,
        p.valor_total,
        u.nome AS cliente,
        u.email,
        COALESCE(
          (SELECT SUM(ip.qtd)
           FROM itensPedidos ip
           WHERE ip.nro_pedido = p.nro_pedido), 0
        ) AS quantidade_itens
      FROM ${TABELA} p
      INNER JOIN usuario u ON u.id = p.id_cliente
      ${where}
      ORDER BY p.data_pedido DESC
      LIMIT ? OFFSET ?
    `;

    const [pedidos] = await connection.query(query, [...params, limite, offset]);

    return {
      pedidos,
      paginacao: {
        pagina_atual: pagina,
        limite,
        total_itens: total,
        total_paginas: Math.ceil(total / limite)
      }
    };

  } finally {
    connection.release();
  }
}


  /**
   * Detalhar um pedido específico
   * @param {number} nro_pedido - Número do pedido
   * @param {boolean} isAdmin - Se é administrador
   * @param {number} id_cliente - ID do cliente (usado se não for admin)
   * @returns {Promise<Object>} - Detalhes completos do pedido
   */
  static async detalharPedido(nro_pedido, isAdmin = false, id_cliente = null) {
    const connection = await getConnection();
    
    try {
      // Query base para buscar pedido
      let query = `
        SELECT 
          p.nro_pedido,
          DATE_FORMAT(p.data_pedido, '%Y-%m-%d %H:%i:%s') AS data_pedido,
          p.status,
          p.valor_total,
          u.nome AS cliente,
          u.email AS email_cliente,
          u.id AS id_cliente
        FROM ${TABELA} p
        INNER JOIN usuario u ON u.id = p.id_cliente
        WHERE p.nro_pedido = ?
      `;

      const params = [nro_pedido];

      // Se não for admin, verificar propriedade do pedido
      if (!isAdmin && id_cliente) {
        query += " AND p.id_cliente = ?";
        params.push(id_cliente);
      }

      const [pedidos] = await connection.query(query, params);

      if (pedidos.length === 0) {
        throw new Error('Pedido não encontrado ou acesso negado');
      }

      const pedido = pedidos[0];

      // Buscar itens do pedido
      const [itens] = await connection.query(
        `SELECT 
          ip.id_item,
          ip.qtd,
          ip.preco_unitario,
          p.nome AS produto,
          p.id AS id_produto,
          l.id AS id_lote,
          (ip.qtd * ip.preco_unitario) AS subtotal
        FROM itensPedidos ip
        INNER JOIN item i ON i.id = ip.id_item
        INNER JOIN produto p ON p.id = i.id_produto
        INNER JOIN lotes l ON l.id = i.id_lote
        WHERE ip.nro_pedido = ?
        ORDER BY ip.id_item`,
        [nro_pedido]
      );

      return {
        ...pedido,
        itens,
        quantidade_itens: itens.reduce((sum, item) => sum + item.qtd, 0)
      };
    } finally {
      connection.release();
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

      const id_item = await create("item", {
        id_produto,
        id_lote,
        qtd,
        nro_pedido,
      });

      connection.release();

      return {
        sucesso: true,
        nro_pedido,
        id_item: id_item,
      };
    } catch (error) {
      console.error("Erro ao adicionar item ao carrinho:", error);
      throw error;
    }
  }

  static async removerItem(nro_pedido, id_item) {
    const connection = await getConnection();
    try {
      await connection.query(
        "DELETE FROM item WHERE id = ? AND nro_pedido = ?",
        [id_item, nro_pedido]
      );
      return { mensagem: `Item ${id_item} excluído com sucesso.` };
    } catch (error) {
      console.error("Erro ao remover item do carrinho:", error);
      throw error;
    } finally {
      connection.release();
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

      // Validação de estoque e cálculo total
      for (const i of itens) {
        const [lote] = await connection.query(
          `SELECT qtd_inicial FROM lotes WHERE id = ? FOR UPDATE`,
          [i.id_lote]
        );

        if (lote.length === 0) throw new Error(`Lote ${i.id_lote} inválido`);

        if (lote[0].qtd_inicial < i.qtd)
          throw new Error(`Estoque insuficiente para o lote ${i.id_lote}`);

        total += Number(i.preco) * Number(i.qtd);
      }

      // Baixa de estoque + itensPedidos
      for (const i of itens) {
        const [lote] = await connection.query(
          `SELECT qtd_inicial FROM lotes WHERE id = ? FOR UPDATE`,
          [i.id_lote]
        );

        await connection.query(
          "UPDATE lotes SET qtd_inicial = ? WHERE id = ?",
          [lote[0].qtd_inicial - i.qtd, i.id_lote]
        );

        await create("itensPedidos", {
          id_item: i.id_item,
          nro_pedido,
          qtd: i.qtd,
          preco_unitario: i.preco,
        });
      }

      // Atualiza pedido para PENDENTE
      await connection.query(
        `UPDATE ${TABELA} SET valor_total = ?, status = ? WHERE nro_pedido = ?`,
        [total, "PENDENTE", nro_pedido]
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

export default PedidoModel;
