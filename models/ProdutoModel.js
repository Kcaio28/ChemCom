import { create, read, update, deleteRecord, getConnection } from '../config/database.js';

class ProdutoModel {

    // Listar com paginação
    static async listarTodos(limite, offset) {
        try {
            const connection = await getConnection();
            try {
                const sql = 'SELECT * FROM produto ORDER BY id DESC LIMIT ? OFFSET ?';
                const [produto] = await connection.query(sql, [limite, offset]);

                const [totalResult] = await connection.execute('SELECT COUNT(*) as total FROM produto');
                const total = totalResult[0].total;

                return {
                    produto,
                    total,
                    pagina: offset / limite + 1,
                    limite,
                    totalPaginas: Math.ceil(total / limite)
                };
            } finally {
                connection.release();
            }
        } catch (error) {
            console.error('Erro ao listar produto:', error);
            throw error;
        }
    }

    // Buscar produto por ID
    static async buscarPorId(id) {
        try {
            const rows = await read('produto', `id = ${id}`);
            return rows[0] || null;
        } catch (error) {
            console.error('Erro ao buscar produto por ID:', error);
            throw error;
        }
    }

    // Criar novo produto
    static async criar({ nome, id_classificacao, descricao, preco, categoria, imagem1, imagem2, imagem3 }) {
        const sql = `
        INSERT INTO produto
        (nome, id_classificacao, descricao, preco, categoria, imagem1, imagem2, imagem3)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `;

        const params = [nome, id_classificacao, descricao, preco, categoria, imagem1, imagem2, imagem3];

        const connection = await getConnection();

        try {
            const [result] = await connection.query(sql, params);

            return {
                id: result.insertId,
                nome,
                id_classificacao,
                descricao,
                preco,
                categoria,
                imagem1,
                imagem2,
                imagem3
            };
        } finally {
            connection.release();
        }
    }

    // Atualizar produto
    static async atualizar(id, dadosProduto) {
        try {
            return await update('produto', dadosProduto, `id = ${id}`);
        } catch (error) {
            console.error('Erro ao atualizar produto:', error);
            throw error;
        }
    }

    // Excluir produto
    static async excluir(id) {
        try {
            return await deleteRecord('produto', `id = ${id}`);
        } catch (error) {
            console.error('Erro ao excluir produto:', error);
            throw error;
        }
    }

    // Buscar por categoria
    static async buscarPorCategoria(categoria) {
        try {
            return await read('produto', `categoria = '${categoria}'`);
        } catch (error) {
            console.error('Erro ao buscar produto por categoria:', error);
            throw error;
        }
    }
}

export default ProdutoModel;