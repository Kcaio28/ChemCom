import UsuarioModel from "../models/UsuarioModel.js";

class UsuarioController {
    
    // LISTAR APENAS USUÁRIOS ATIVOS
    static async listarAtivos(req, res) {
        try {
            const pagina = parseInt(req.query.pagina) || 1;
            const limite = parseInt(req.query.limite) || 50;

            const resultado = await UsuarioModel.listarTodos(pagina, limite);

            return res.json({
                sucesso: true,
                usuarios: resultado.empresas,
                paginacao: {
                    pagina: resultado.pagina,
                    limite: resultado.limite,
                    total: resultado.total,
                    totalPaginas: resultado.totalPaginas
                }
            });
        } catch (erro) {
            console.error(erro);
            return res.status(500).json({
                sucesso: false,
                mensagem: "Erro ao listar usuários."
            });
        }
    }

    // BUSCAR POR ID
    static async buscarPorId(req, res) {
        try {
            const { id } = req.params;
            const usuario = await UsuarioModel.buscarPorId(id);

            if (!usuario || usuario.status !== "ATIVO") {
                return res.status(404).json({
                    sucesso: false,
                    mensagem: "Usuário não encontrado ou está inativo"
                });
            }

            return res.json({
                sucesso: true,
                usuario
            });

        } catch (erro) {
            console.log(erro);
            return res.status(500).json({
                sucesso: false,
                mensagem: "Erro ao buscar usuário."
            });
        }
    }

    // EXCLUIR (INATIVAR)
    static async excluir(req, res) {
        try {
            const { id } = req.params;

            const usuario = await UsuarioModel.buscarPorId(id);
            if (!usuario) {
                return res.status(404).json({
                    sucesso: false,
                    mensagem: "Usuário não encontrado"
                });
            }

            await UsuarioModel.excluir(id);

            return res.json({
                sucesso: true,
                mensagem: "Usuário marcado como INATIVO!"
            });

        } catch (erro) {
            console.error(erro);
            return res.status(500).json({
                sucesso: false,
                mensagem: "Erro ao excluir usuário."
            });
        }
    }
}

export default UsuarioController;
