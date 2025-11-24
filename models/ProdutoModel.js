import { create, read, update, deleteRecord, getConnection } from '../config/database.js';

class ProdutoModel {

    // Listar com paginação
    static async listarTodos(limite, offset) {
        try {
            const connection = await getConnection();
            try {
                const sql = 'SELECT * FROM produtos ORDER BY id DESC LIMIT ? OFFSET ?';
                const [produtos] = await connection.query(sql, [limite, offset]);

                const [totalResult] = await connection.execute('SELECT COUNT(*) as total FROM produtos');
                const total = totalResult[0].total;

                return {
                    produtos,
                    total,
                    pagina: offset / limite + 1,
                    limite,
                    totalPaginas: Math.ceil(total / limite)
                };
            } finally {
                connection.release();
            }
        } catch (error) {
            console.error('Erro ao listar produtos:', error);
            throw error;
        }
    }

    // Buscar produto por ID
    static async buscarPorId(id) {
        try {
            const rows = await read('produtos', `id = ${id}`);
            return rows[0] || null;
        } catch (error) {
            console.error('Erro ao buscar produto por ID:', error);
            throw error;
        }
    }

    // Criar novo produto
    static async criar(dadosProduto) {
        try {
            console.log("📦 Dados recebidos para criar produto:", dadosProduto);
            
            const insertedId = await create('produtos', dadosProduto);

            console.log("🆔 ID gerado:", insertedId);
            
            return insertedId;
        } catch (error) {
            console.error('Erro ao criar produto:', error);
            throw error;
        }
    }

    // Atualizar produto
    static async atualizar(id, dadosProduto) {
        try {
            return await update('produtos', dadosProduto, `id = ${id}`);
        } catch (error) {
            console.error('Erro ao atualizar produto:', error);
            throw error;
        }
    }

    // Excluir produto
    static async excluir(id) {
        try {
            return await deleteRecord('produtos', `id = ${id}`);
        } catch (error) {
            console.error('Erro ao excluir produto:', error);
            throw error;
        }
    }

    // Buscar por categoria
    static async buscarPorCategoria(categoria) {
        try {
            return await read('produtos', `categoria = '${categoria}'`);
        } catch (error) {
            console.error('Erro ao buscar produtos por categoria:', error);
            throw error;
        }
    }
}

export default ProdutoModel;