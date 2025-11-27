import { create, read, update, deleteRecord } from "../config/database.js";

class LoteController {

    // 📌 Criar lote
    static async criar(req, res) {
        try {
            const { id_produto, data_fab, data_validade, qtd_inicial} = req.body;

            if (!id_produto || !data_fab || !data_validade || !qtd_inicial) {
                return res.status(400).json({
                    sucesso: false,
                    erro: "Todos os campos são obrigatórios."
                });
            }
            let qtd_atual = qtd_inicial;
            const id_lote = await create("lotes", {
                id_produto,
                data_fab,
                data_validade,
                qtd_inicial,
                qtd_atual
            });

            return res.status(201).json({
                sucesso: true,
                mensagem: "Lote criado com sucesso!",
                id_lote
            });

        } catch (erro) {
            console.error("Erro ao criar lote:", erro);
            return res.status(500).json({
                sucesso: false,
                erro: "Erro interno ao criar lote."
            });
        }
    }

    // 📌 Listar todos os lotes
    static async listar(req, res) {
        try {
            const lotes = await read("lotes");

            return res.status(200).json({
                sucesso: true,
                lotes
            });

        } catch (erro) {
            console.error("Erro ao listar lotes:", erro);
            return res.status(500).json({
                sucesso: false,
                erro: "Erro ao listar lotes."
            });
        }
    }

    // 📌 Listar lotes por produto
    static async listarPorProduto(req, res) {
        try {
            const { id_produto } = req.params;

            const lotes = await read("lotes", `id_produto = ${id_produto}`);

            return res.status(200).json({
                sucesso: true,
                lotes
            });

        } catch (erro) {
            console.error("Erro ao listar lotes do produto:", erro);
            return res.status(500).json({
                sucesso: false,
                erro: "Erro ao listar lotes por produto."
            });
        }
    }

    // 📌 Atualizar lote
    static async atualizar(req, res) {
        try {
            const { id } = req.params;
            const dados = req.body;

            const afetados = await update("lotes", dados, `id = ${id}`);

            if (afetados === 0) {
                return res.status(404).json({
                    sucesso: false,
                    erro: "Lote não encontrado."
                });
            }

            return res.status(200).json({
                sucesso: true,
                mensagem: "Lote atualizado com sucesso!"
            });

        } catch (erro) {
            console.error("Erro ao atualizar lote:", erro);
            return res.status(500).json({
                sucesso: false,
                erro: "Erro ao atualizar lote."
            });
        }
    }

    // 📌 Excluir lote
    static async excluir(req, res) {
        try {
            const { id } = req.params;

            const apagados = await deleteRecord("lotes", `id = ${id}`);

            if (apagados === 0) {
                return res.status(404).json({
                    sucesso: false,
                    erro: "Lote não encontrado."
                });
            }

            return res.status(200).json({
                sucesso: true,
                mensagem: "Lote excluído com sucesso!"
            });

        } catch (erro) {
            console.error("Erro ao excluir lote:", erro);
            return res.status(500).json({
                sucesso: false,
                erro: "Erro ao excluir lote."
            });
        }
    }


    // 📌 Baixar quantidade do lote (saída de estoque)
    static async baixarQuantidade(req, res) {
        try {
            const { id } = req.params;
            const { quantidade } = req.body;

            const [lote] = await read("lotes", `id = ${id}`);

            if (!lote) {
                return res.status(404).json({
                    sucesso: false,
                    erro: "Lote não encontrado."
                });
            }

            if (quantidade > lote.qtd_inicial) {
                return res.status(400).json({
                    sucesso: false,
                    erro: "Quantidade insuficiente no lote."
                });
            }

            const novaQtd = lote.qtd_inicial - quantidade;

            await update("lotes", { qtd_inicial: novaQtd }, `id = ${id}`);

            return res.status(200).json({
                sucesso: true,
                mensagem: "Saída registrada!",
                quantidade_restante: novaQtd
            });

        } catch (erro) {
            console.error("Erro ao baixar quantidade:", erro);
            return res.status(500).json({
                sucesso: false,
                erro: "Erro ao processar saída."
            });
        }
    }


    // 📌 Listar produtos com validade próxima (alertas)
    static async validadeProxima(req, res) {
        try {
            const hoje = new Date();
            const limite = new Date();
            limite.setDate(limite.getDate() + 30); // 30 dias antes da validade

            const lotes = await read("lotes");

            const alerta = lotes.filter(l =>
                new Date(l.data_validade) <= limite &&
                new Date(l.data_validade) >= hoje
            );

            return res.status(200).json({
                sucesso: true,
                lotes_alerta: alerta
            });

        } catch (erro) {
            console.error("Erro ao verificar validade:", erro);
            return res.status(500).json({
                sucesso: false,
                erro: "Erro ao verificar validade."
            });
        }
    }
}

export default LoteController;
