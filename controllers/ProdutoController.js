import ProdutoModel from '../models/ProdutoModel.js';
import { fileURLToPath } from 'url';
import fs from "fs/promises";
import path from 'path';
import { removerArquivoAntigo } from '../middlewares/uploadMiddleware.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Controller para operações com produto
class ProdutoController {

    // GET /produto - Listar todos os produto (com paginação)
    static async listarTodos(req, res) {
        try {

            let pagina = parseInt(req.query.pagina) || 1;
            let limite = parseInt(req.query.limite) || 100;

            if (pagina <= 0) {
                return res.status(400).json({
                    sucesso: false,
                    erro: 'Página inválida',
                    mensagem: 'A página deve ser um número maior que zero'
                });
            }
            if (limite <= 0) {
                return res.status(400).json({
                    sucesso: false,
                    erro: 'Limite inválido',
                    mensagem: 'O limite deve ser um número maior que zero'
                });
            }

            const limiteMaximo = parseInt(process.env.PAGINACAO_LIMITE_MAXIMO) || 100;
            if (limite > limiteMaximo) {
                return res.status(400).json({
                    sucesso: false,
                    erro: 'Limite inválido',
                    mensagem: `O limite deve ser um número entre 1 e ${limiteMaximo}`
                });
            }

            const offset = (pagina - 1) * limite;
            const categoria = req.query.categoria || null;

            const resultado = await ProdutoModel.listarTodos(limite, offset, categoria);

            res.status(200).json({
                sucesso: true,
                dados: resultado.produto,
                paginacao: {
                    pagina: resultado.pagina,
                    limite: resultado.limite,
                    total: resultado.total,
                    totalPaginas: resultado.totalPaginas
                }
            });
        } catch (error) {
            console.error('Erro ao listar produto:', error);
            res.status(500).json({
                sucesso: false,
                erro: 'Erro interno do servidor',
                mensagem: 'Não foi possível listar os produto'
            });
        }
    }

    // GET /produto/categorias - Listar todas as categorias
    static async listarCategorias(req, res) {
        try {
            const categorias = await ProdutoModel.listarCategorias();
            res.status(200).json({
                sucesso: true,
                categorias: categorias
            });
        } catch (error) {
            console.error('Erro ao listar categorias:', error);
            res.status(500).json({
                sucesso: false,
                erro: 'Erro interno do servidor',
                mensagem: 'Não foi possível listar as categorias'
            });
        }
    }

    // GET /produto/:id - Buscar produto por ID
    static async buscarPorId(req, res) {
        try {
            const { id } = req.params;

            // Validação básica do ID
            if (!id || isNaN(id)) {
                return res.status(400).json({
                    sucesso: false,
                    erro: 'ID inválido',
                    mensagem: 'O ID deve ser um número válido'
                });
            }

            const produto = await ProdutoModel.buscarPorId(id);

            if (!produto) {
                return res.status(404).json({
                    sucesso: false,
                    erro: 'Produto não encontrado',
                    mensagem: `Produto com ID ${id} não foi encontrado`
                });
            }

            res.status(200).json({
                sucesso: true,
                dados: produto
            });
        } catch (error) {
            console.error('Erro ao buscar produto:', error);
            res.status(500).json({
                sucesso: false,
                erro: 'Erro interno do servidor',
                mensagem: 'Não foi possível buscar o produto'
            });
        }
    }

    // POST /produto - Criar novo produto
    static async criar(req, res) {
        try {
            const { nome, descricao, preco, categoria } = req.body;

            // Validações manuais - coletar todos os erros
            const erros = [];

            // Validar nome
            if (!nome || nome.trim() === '') {
                erros.push({
                    campo: 'nome',
                    mensagem: 'Nome é obrigatório'
                });
            } else {
                if (nome.trim().length < 3) {
                    erros.push({
                        campo: 'nome',
                        mensagem: 'O nome deve ter pelo menos 3 caracteres'
                    });
                }

                if (nome.trim().length > 255) {
                    erros.push({
                        campo: 'nome',
                        mensagem: 'O nome deve ter no máximo 255 caracteres'
                    });
                }
            }

            // Validar preço
            if (!preco || isNaN(preco) || preco <= 0) {
                erros.push({
                    campo: 'preco',
                    mensagem: 'Preço deve ser um número positivo'
                });
            }

            // Se houver erros, retornar todos de uma vez
            if (erros.length > 0) {
                return res.status(400).json({
                    sucesso: false,
                    erro: 'Dados inválidos',
                    detalhes: erros
                });
            }

            // Preparar dados do produto
            const dadosProduto = {
                nome: nome.trim(),
                descricao: descricao ? descricao.trim() : null,
                preco: parseFloat(preco),
                categoria: categoria ? categoria.trim() : 'Geral'
            };

            // Adicionar imagem se foi enviada
            if (req.file) {
                dadosProduto.imagem = req.file.filename;
            }

            const produtoId = await ProdutoModel.criar(dadosProduto);

            res.status(201).json({
                sucesso: true,
                mensagem: 'Produto criado com sucesso',
                dados: {
                    id: produtoId,
                    ...dadosProduto
                }
            });
        } catch (error) {
            console.error('Erro ao criar produto:', error);
            res.status(500).json({
                sucesso: false,
                erro: 'Erro interno do servidor',
                mensagem: 'Não foi possível criar o produto'
            });
        }
    }

    // PUT /produto/:id - Atualizar produto

    static async atualizar(req, res) {
        try {
            const { id } = req.params;

            if (!id || isNaN(id)) {
                return res.status(400).json({ sucesso: false, mensagem: "ID inválido." });
            }

            const produtoExistente = await ProdutoModel.buscarPorId(id);

            if (!produtoExistente) {
                return res.status(404).json({ sucesso: false, mensagem: "Produto não encontrado." });
            }

            // Campos que podem ser atualizados
            const dados = {
                nome: req.body.nome || produtoExistente.nome,
                descricao: req.body.descricao || produtoExistente.descricao,
                preco: req.body.preco || produtoExistente.preco,
                categoria: req.body.categoria || produtoExistente.categoria,
                id_classificacao: req.body.id_classificacao || produtoExistente.id_classificacao
            };

            const novasImagens = {};

            const camposImagens = ["imagem1", "imagem2", "imagem3"];

            for (const campo of camposImagens) {
                if (req.files[campo]?.length) {

                    // Deletar imagem antiga
                    const antiga = produtoExistente[campo];
                    if (antiga) {
                        const caminhoAntigo = path.join(process.cwd(), "uploads", "imagens", antiga);
                        try {
                            await fs.unlink(caminhoAntigo);
                            console.log("Imagem antiga deletada:", caminhoAntigo);
                        } catch (err) {
                            console.log("Erro ao deletar imagem antiga:", err.message);
                        }
                    }

                    // Salvar nova imagem
                    novasImagens[campo] = req.files[campo][0].filename;

                } else {
                    novasImagens[campo] = produtoExistente[campo];
                }
            }

            await ProdutoModel.atualizar(id, { ...dados, ...novasImagens });

            return res.json({
                sucesso: true,
                mensagem: "Produto atualizado com sucesso!"
            });

        } catch (erro) {
            console.error(erro);
            return res.status(500).json({
                sucesso: false,
                mensagem: "Erro ao atualizar produto."
            });
        }
    }


    static async excluir(req, res) {
        try {
            const { id } = req.params;

            console.log("ID recebido:", id);

            if (!id || isNaN(id)) {
                return res.status(400).json({
                    sucesso: false,
                    mensagem: "ID inválido"
                });
            }

            const produto = await ProdutoModel.buscarPorId(id);

            if (!produto) {
                return res.status(404).json({
                    sucesso: false,
                    mensagem: "Produto não encontrado."
                });
            }

            // Campos das imagens
            const camposImagens = ["imagem1", "imagem2", "imagem3"];

            for (const campo of camposImagens) {
                const nomeArquivo = produto[campo];

                if (nomeArquivo) {
                    const caminho = path.join(process.cwd(), "uploads", "imagens", nomeArquivo);

                    try {
                        await fs.unlink(caminho);
                        console.log("Imagem deletada:", caminho);
                    } catch (err) {
                        console.log("Erro ao deletar imagem:", err.message);
                    }
                }
            }

            await ProdutoModel.excluir(id);

            return res.json({
                sucesso: true,
                mensagem: "Produto e imagens deletados com sucesso!"
            });

        } catch (erro) {
            console.error(erro);
            return res.status(500).json({
                sucesso: false,
                mensagem: "Erro ao excluir produto."
            });
        }
    }


    // POST /produto/upload - Upload de imagem para produto
    static async uploadImagem(req, res) {
        try {
            const { produto_id } = req.body;

            // Validações básicas
            if (!produto_id || isNaN(produto_id)) {
                return res.status(400).json({
                    sucesso: false,
                    erro: 'ID de produto inválido',
                    mensagem: 'O ID do produto é obrigatório e deve ser um número válido'
                });
            }

            if (!req.file) {
                return res.status(400).json({
                    sucesso: false,
                    erro: 'Imagem não fornecida',
                    mensagem: 'É necessário enviar uma imagem'
                });
            }

            // Verificar se o produto existe
            const produtoExistente = await ProdutoModel.buscarPorId(produto_id);
            if (!produtoExistente) {
                return res.status(404).json({
                    sucesso: false,
                    erro: 'Produto não encontrado',
                    mensagem: `Produto com ID ${produto_id} não foi encontrado`
                });
            }

            // Remover imagem antiga se existir
            if (produtoExistente.imagem) {
                await removerArquivoAntigo(produtoExistente.imagem, 'imagem');
            }

            // Atualizar produto com a nova imagem
            await ProdutoModel.atualizar(produto_id, { imagem: req.file.filename });

            res.status(200).json({
                sucesso: true,
                mensagem: 'Imagem enviada com sucesso',
                dados: {
                    nomeArquivo: req.file.filename,
                    caminho: `/uploads/imagens/${req.file.filename}`
                }
            });
        } catch (error) {
            console.error('Erro ao fazer upload de imagem:', error);
            res.status(500).json({
                sucesso: false,
                erro: 'Erro interno do servidor',
                mensagem: 'Não foi possível fazer upload da imagem'
            });
        }
    }
}

export default ProdutoController;

