import { create, read, update, deleteRecord, comparePassword, hashPassword, getConnection } from '../config/database.js';

const TABELA = 'empresa'; // nome correto da tabela

class UsuarioModel {

    // Listar todas as empresas (com paginação)
    static async listarTodos(pagina = 1, limite = 10) {
        try {
            const offset = (pagina - 1) * limite;
            const connection = await getConnection();

            try {
                const sql = `SELECT * FROM ${TABELA} ORDER BY id DESC LIMIT ? OFFSET ?`;
                const [empresas] = await connection.query(sql, [limite, offset]);

                const [totalResult] = await connection.execute(`SELECT COUNT(*) as total FROM ${TABELA}`);
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
            const rows = await read(TABELA, `id = ${id}`);
            return rows[0] || null;
        } catch (error) {
            console.error('Erro ao buscar empresa por ID:', error);
            throw error;
        }
    }

    // Buscar empresa por email
    static async buscarPorEmail(email) {
        try {
            const rows = await read(TABELA, `email = '${email}'`);
            return rows[0] || null;
        } catch (error) {
            console.error('Erro ao buscar empresa por email:', error);
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
                senha_hash: senhaHash, // nome da coluna correto
                CEP: dadosEmpresa.cep,
                estado: dadosEmpresa.estado,
                cidade: dadosEmpresa.cidade,
                logradouro: dadosEmpresa.logradouro,
                Nro: dadosEmpresa.numero
            };

            return await create(TABELA, dadosCompletos);
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

            return await update(TABELA, dadosEmpresa, `id = ${id}`);
        } catch (error) {
            console.error('Erro ao atualizar empresa:', error);
            throw error;
        }
    }

    // Excluir empresa
    static async excluir(id) {
        try {
            return await deleteRecord(TABELA, `id = ${id}`);
        } catch (error) {
            console.error('Erro ao excluir empresa:', error);
            throw error;
        }
    }

    // Verificar credenciais de login
    static async verificarCredenciais(email, senha) {
        try {
            const empresa = await this.buscarPorEmail(email);

            if (!empresa) {
                return null;
            }

            const senhaValida = await comparePassword(senha, empresa.senha_hash);

            if (!senhaValida) {
                return null;
            }

            // Remove o hash antes de retornar
            const { senha_hash, ...empresaSemSenha } = empresa;
            return empresaSemSenha;
        } catch (error) {
            console.error('Erro ao verificar credenciais:', error);
            throw error;
        }
    }
}

export default UsuarioModel;
