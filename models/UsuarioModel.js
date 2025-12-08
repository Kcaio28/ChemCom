import { create, read, update, deleteRecord, comparePassword, hashPassword, getConnection } from '../config/database.js';

const TABELA_empresa = 'empresa'; // nome correto da tabela_empresa
const TABELA_adm = 'useradm';


class UsuarioModel {

    // Listar todas as empresas (com paginação)
    static async listarTodos(pagina = 1, limite = 10) {
        try {
            const offset = (pagina - 1) * limite;
            const connection = await getConnection();

            try {
                const sql = `
                    SELECT * FROM ${TABELA_empresa}
                    WHERE status = 'ATIVO'
                    ORDER BY id DESC
                    LIMIT ? OFFSET ?
                `;
                const [empresas] = await connection.query(sql, [limite, offset]);
                const [totalResult] = await connection.execute(
                    `SELECT COUNT(*) as total FROM ${TABELA_empresa} WHERE status = 'ATIVO'`
                );
                const total = totalResult[0].total;

                return {
                    empresas,
                    total,
                    pagina,
                    limite,
                    totalPaginas: Math.ceil(total / limite)
                };
            } finally {
                connection.release();
            }
        } catch (error) {
            console.error('Erro ao listar empresas:', error);
            throw error;
        }
    }

    // Buscar empresa por ID
    static async buscarPorId(id) {
        try {
            const connection = await getConnection();
            try {
                const [rows] = await connection.query(
                    `SELECT * FROM ${TABELA_empresa} WHERE id = ? AND status = 'ATIVO'`,
                    [id]
                );
                return rows[0] || null;
            } finally {
                connection.release();
            }
        } catch (error) {
            console.error('Erro ao buscar empresa por ID:', error);
            throw error;
        }
    }

    // Buscar empresa por email
    static async buscarPorEmail(email) {
        try {
            const connection = await getConnection();
            const [rows] = await connection.query(
                `SELECT * FROM ${TABELA_empresa} WHERE email = ? LIMIT 1`,
                [email]
            );
            connection.release();
            return rows[0] || null;
        } catch (error) {
            console.error('Erro ao buscar empresa por email:', error);
            throw error;
        }
    }

    // Buscar ADM por email
    static async buscarADM(email) {
        try {
            console.log(`🔍 [ADM] Buscando admin com email: ${email} na tabela ${TABELA_adm}`);
            const connection = await getConnection();
            const [rows] = await connection.query(
                `SELECT * FROM ${TABELA_adm} WHERE email = ? LIMIT 1`,
                [email]
            );
            connection.release();

            if (rows.length > 0) {
                console.log(`✅ [ADM] Admin encontrado: ID ${rows[0].id}, Nome: ${rows[0].nome}`);
            } else {
                console.log(`❌ [ADM] Nenhum admin encontrado com email: ${email}`);
            }

            return rows[0] || null;
        } catch (error) {
            console.error('❌ [ADM] Erro ao buscar adm por email:', error);
            throw error;
        }
    }

    // Criar nova empresa
    static async criar(dadosEmpresa) {
        try {
            const senhaHash = await hashPassword(dadosEmpresa.senha);

            const dadosCompletos = {
                nome: dadosEmpresa.nome,
                CNPJ: dadosEmpresa.cnpj,
                Telefone: dadosEmpresa.telefone,
                email: dadosEmpresa.email,
                senha_hash: senhaHash,
                CEP: dadosEmpresa.cep,
                estado: dadosEmpresa.estado,
                cidade: dadosEmpresa.cidade,
                logradouro: dadosEmpresa.logradouro,
                Nro: dadosEmpresa.numero,

                // 🆕 Dados automáticos da API
                cnae_principal: dadosEmpresa.cnaePrincipal,
                cnaes_secundarios: JSON.stringify(dadosEmpresa.cnaesSecundarios),
                autorizacao_status: dadosEmpresa.autorizacao_status
            };

            return await create(TABELA_empresa, dadosCompletos);

        } catch (error) {
            console.error('Erro ao criar empresa:', error);
            throw error;
        }
    }

    // Atualizar empresa
    static async atualizar(id, dadosEmpresa) {
        try {
            if (dadosEmpresa.senha) {
                dadosEmpresa.senha_hash = await hashPassword(dadosEmpresa.senha);
                delete dadosEmpresa.senha;
            }

            const connection = await getConnection();
            try {
                const set = Object.keys(dadosEmpresa)
                    .map(column => `${column} = ?`)
                    .join(', ');
                const sql = `UPDATE ${TABELA_empresa} SET ${set} WHERE id = ?`;
                const values = [...Object.values(dadosEmpresa), id];
                const [result] = await connection.execute(sql, values);
                return result.affectedRows;
            } finally {
                connection.release();
            }
        } catch (error) {
            console.error('Erro ao atualizar empresa:', error);
            throw error;
        }
    }

    // Excluir empresa
    static async excluir(id) {
        try {
            const connection = await getConnection();
            try {
                const [result] = await connection.execute(
                    `UPDATE ${TABELA_empresa} SET status = 'INATIVO' WHERE id = ?`,
                    [id]
                );
                return result.affectedRows;
            } finally {
                connection.release();
            }
        } catch (error) {
            console.error("Erro ao inativar empresa:", error);
            throw error;
        }
    }


    // Verificar credenciais de login
    static async verificarCredenciais(email, senha) {
        try {
            console.log("🔍 Verificando email:", email);

            const empresa = await this.buscarPorEmail(email);

            if (!empresa) {
                console.log("❌ EMAIL NÃO ENCONTRADO");
                return null;
            }

            console.log("🔍 Hash encontrado no banco:", empresa.senha_hash);

            const senhaValida = await comparePassword(senha, empresa.senha_hash);

            console.log("🔍 Resultado da comparação:", senhaValida);

            if (!senhaValida) {
                console.log("❌ SENHA INCORRETA");
                return null;
            }

            const { senha_hash, ...resto } = empresa;
            return resto;
        } catch (error) {
            console.error('Erro ao verificar credenciais:', error);
            throw error;
        }
    }

    static async verificarADM(email, senha) {
        try {
            console.log("🔍 [ADM] Verificando email:", email);

            const adm = await this.buscarADM(email);

            if (!adm) {
                console.log("❌ [ADM] EMAIL NÃO ENCONTRADO na tabela useradm");
                return null;
            }

            console.log("🔍 [ADM] Admin encontrado. ID:", adm.id, "Email:", adm.email);
            console.log("🔍 [ADM] Hash encontrado no banco:", adm.senha_hash ? 'Sim' : 'Não');

            const senhaValida = await comparePassword(senha, adm.senha_hash);

            console.log("🔍 [ADM] Resultado da comparação:", senhaValida);

            if (!senhaValida) {
                console.log("❌ [ADM] SENHA INCORRETA");
                return null;
            }

            console.log("✅ [ADM] Credenciais válidas!");
            const { senha_hash, ...resto } = adm;
            return resto;
        } catch (error) {
            console.error('❌ [ADM] Erro ao verificar credenciais:', error);
            throw error;
        }
    }
    // ---------------------------------------------------------
    // SALVAR AUTORIZAÇÃO POR CATEGORIA
    // ---------------------------------------------------------
    static async salvarAutorizacaoCategoria(idEmpresa, categoria) {
        try {
            const connection = await getConnection();

            const sql = `
            INSERT INTO autorizacoes_categoria (id_empresa, categoria)
            VALUES (?, ?)
        `;

            const [result] = await connection.execute(sql, [idEmpresa, categoria]);

            connection.release();
            return result;
        } catch (error) {
            console.error("Erro ao salvar autorização por categoria:", error);
            throw error;
        }
    }

    // ---------------------------------------------------------
    // BUSCAR TODAS AS AUTORIZAÇÕES DE UMA EMPRESA
    // ---------------------------------------------------------
    static async buscarAutorizacoes(idEmpresa) {
        try {
            const connection = await getConnection();

            const sql = `
            SELECT categoria 
            FROM autorizacoes_categoria
            WHERE id_empresa = ?
        `;

            const [rows] = await connection.execute(sql, [idEmpresa]);

            connection.release();
            return rows;
        } catch (error) {
            console.error("Erro ao buscar autorizações:", error);
            throw error;
        }
    }

    // ---------------------------------------------------------
    // REMOVER TODAS AS AUTORIZAÇÕES DE UMA EMPRESA (OPCIONAL)
    // ---------------------------------------------------------
    static async removerAutorizacoes(idEmpresa) {
        try {
            const connection = await getConnection();

            const sql = `DELETE FROM autorizacoes_categoria WHERE id_empresa = ?`;

            const [result] = await connection.execute(sql, [idEmpresa]);

            connection.release();
            return result;
        } catch (error) {
            console.error("Erro ao remover autorizações:", error);
            throw error;
        }
    }

    static async salvarAutorizacaoCategoria(id_empresa, categoria, nivel) {
        try {
            const connection = await getConnection();

            const sql = `
            INSERT INTO autorizacoes_categoria (id_empresa, categoria, nivel)
            VALUES (?, ?, ?)
        `;

            await connection.execute(sql, [id_empresa, categoria, nivel]);
            connection.release();

        } catch (error) {
            console.error("Erro ao salvar autorização por categoria:", error);
            throw error;
        }
    }

}

export default UsuarioModel;
