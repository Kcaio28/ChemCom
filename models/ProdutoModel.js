import { create, read, update, deleteRecord, getConnection } from '../config/database.js';

class ProdutoModel {

    // Listar com paginação e filtro por categoria
    static async listarTodos(limite, offset, categoria = null) {
        try {
            const connection = await getConnection();
            try {
                let whereClause = '';
                let params = [];
                
                if (categoria && categoria.trim() !== '') {
                    whereClause = 'WHERE p.categoria = ?';
                    params.push(categoria);
                }

                const sql = `
                SELECT 
                    p.*,
                    c.nome AS classificacao_nome
                FROM produto p
                JOIN classificacao_risco c 
                    ON p.id_classificacao = c.id
                ${whereClause}
                ORDER BY p.id DESC
                LIMIT ? OFFSET ?
            `;
                params.push(limite, offset);
                const [produto] = await connection.query(sql, params);

                // Contar total com filtro
                let countSql = 'SELECT COUNT(*) as total FROM produto p';
                let countParams = [];
                if (categoria && categoria.trim() !== '') {
                    countSql += ' WHERE p.categoria = ?';
                    countParams.push(categoria);
                }
                const [totalResult] = await connection.query(countSql, countParams);
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

    // Buscar categorias únicas
    static async listarCategorias() {
        try {
            const connection = await getConnection();
            try {
                const [rows] = await connection.query(
                    'SELECT DISTINCT categoria FROM produto WHERE categoria IS NOT NULL AND categoria != "" ORDER BY categoria ASC'
                );
                return rows.map(row => row.categoria);
            } finally {
                connection.release();
            }
        } catch (error) {
            console.error('Erro ao listar categorias:', error);
            throw error;
        }
    }

    // Buscar produto por ID
    static async buscarPorId(id) {
        try {
            const connection = await getConnection();
            try {
                const [rows] = await connection.query(
                    'SELECT * FROM produto WHERE id = ?',
                    [id]
                );
                return rows[0] || null;
            } finally {
                connection.release();
            }
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
            const connection = await getConnection();
            try {
                const set = Object.keys(dadosProduto)
                    .map(column => `${column} = ?`)
                    .join(', ');
                const sql = `UPDATE produto SET ${set} WHERE id = ?`;
                const values = [...Object.values(dadosProduto), id];
                const [result] = await connection.execute(sql, values);
                return result.affectedRows;
            } finally {
                connection.release();
            }
        } catch (error) {
            console.error('Erro ao atualizar produto:', error);
            throw error;
        }
    }

    // Excluir produto
    static async excluir(id) {
        try {
            const connection = await getConnection();
            try {
                const [result] = await connection.execute(
                    'DELETE FROM produto WHERE id = ?',
                    [id]
                );
                return result.affectedRows;
            } finally {
                connection.release();
            }
        } catch (error) {
            console.error('Erro ao excluir produto:', error);
            throw error;
        }
    }

    // Buscar por categoria
    static async buscarPorCategoria(categoria) {
        try {
            const connection = await getConnection();
            try {
                const [rows] = await connection.query(
                    'SELECT * FROM produto WHERE categoria = ?',
                    [categoria]
                );
                return rows;
            } finally {
                connection.release();
            }
        } catch (error) {
            console.error('Erro ao buscar produto por categoria:', error);
            throw error;
        }
    }
}

export default ProdutoModel;