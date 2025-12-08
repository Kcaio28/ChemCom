import express from 'express';
import jwt from 'jsonwebtoken';
import UsuarioModel from '../models/UsuarioModel.js';
import UsuarioController from "../controllers/UsuarioController.js";
import { JWT_CONFIG } from '../config/jwt.js';
import axios from 'axios';
import { CATEGORIAS_CNAE } from '../utils/cnaes.js';

const router = express.Router();

router.post("/cadastro", async (req, res) => {
    try {
        const {
            nome,
            cnpj,
            email,
            senha,
            cidade,
            estado,
            telefone,
            cep,
            numero,
            logradouro
        } = req.body;

        // 1️⃣ Verifica duplicidade de email
        const existe = await UsuarioModel.buscarPorEmail(email);
        if (existe) {
            return res.status(400).json({
                mensagem: "Este email já está cadastrado."
            });
        }

        // 2️⃣ Limpa CNPJ
        const cnpjLimpo = cnpj.replace(/\D/g, "");

        // 3️⃣ Consulta automática no CNPJ
        const consulta = await axios.get(`https://publica.cnpj.ws/cnpj/${cnpjLimpo}`);
        const dados = consulta.data;

        // 4️⃣ Normaliza CNAEs
        function normalizarCNAE(cnae) {
            if (!cnae) return null;
            cnae = cnae.toString().replace(/\D/g, "");
            return cnae.padEnd(7, "0"); // Exemplo: 19217 => 1921700
        }


        const cnaePrincipal = normalizarCNAE(dados.estabelecimento.atividade_principal.id);

        const cnaesSecundarios = dados.estabelecimento.atividades_secundarias.map(a =>
            normalizarCNAE(a.id)
        );

        const todosCnaes = [cnaePrincipal, ...cnaesSecundarios];

        // 5️⃣ Determina permissões de categorias e níveis
        let categoriasPermitidas = [];

        Object.keys(CATEGORIAS_CNAE).forEach(categoria => {
            Object.keys(CATEGORIAS_CNAE[categoria]).forEach(nivel => {
                const listaCnaes = CATEGORIAS_CNAE[categoria][nivel];

                const possui = todosCnaes.some(c => listaCnaes.includes(c));

                if (possui) {
                    categoriasPermitidas.push({
                        categoria,
                        nivel: Number(nivel.replace("nivel", ""))
                    });
                }
            });
        });

        // 6️⃣ Status geral de autorização
        const autorizado = categoriasPermitidas.length > 0 ? "APROVADO" : "PENDENTE";

        // 7️⃣ Cria usuário no banco
        const idUsuario = await UsuarioModel.criar({
            nome,
            cnpj,
            email,
            senha,
            telefone,
            cep,
            estado,
            cidade,
            numero,
            logradouro,
            cnaePrincipal,
            cnaesSecundarios,
            autorizacao_status: autorizado
        });

        // 8️⃣ Salva permissões da empresa
        for (const item of categoriasPermitidas) {
            await UsuarioModel.salvarAutorizacaoCategoria(
                idUsuario,
                item.categoria,
                item.nivel
            );
        }

        // 9️⃣ Retorno
        return res.status(201).json({
            mensagem: "Empresa cadastrada com sucesso!",
            autorizacao: autorizado,
            cnaes_encontrados: todosCnaes,
            categorias_autorizadas: categoriasPermitidas
        });

    } catch (error) {
        console.error(error);

        // CNPJ não encontrado
        if (error.response && error.response.status === 404) {
            return res.status(400).json({
                mensagem: "CNPJ inválido ou não encontrado."
            });
        }

        return res.status(500).json({
            mensagem: "Erro ao cadastrar empresa."
        });
    }
});


router.post('/login', async (req, res) => {
    try {
        const { email, senha } = req.body;

        if (!email || !senha) {
            return res.status(400).json({ mensagem: 'Email e senha são obrigatórios.' });
        }

        console.log('🔐 Tentativa de login para:', email);

        const usuario = await UsuarioModel.verificarCredenciais(email, senha);
        let adm = null;

        if (!usuario) {
            adm = await UsuarioModel.verificarADM(email, senha);
        }

        if (!usuario && !adm) {
            return res.status(401).json({ mensagem: 'Email ou senha inválidos.' });
        }

        const userData = usuario || adm;
        const userType = usuario ? 'usuario' : 'admin';
        const tipoRetorno = usuario ? 'usuario' : 'adm';

        // 🔹 BUSCAR AUTORIZAÇÕES DO USUÁRIO (só para empresas/usuários)
        let autorizacoes = [];
        if (usuario) {
            autorizacoes = await UsuarioModel.listarAutorizacoes(usuario.id); 
            // implementar listarAutorizacoes no model se ainda não existir
        }

        // Adicionar autorizações ao objeto que será enviado pro frontend
        const dadosComAutorizacoes = {
            ...userData,
            autorizacoes
        };

        // Gerar token JWT
        const token = jwt.sign(
            { id: userData.id, email: userData.email, tipo: userType },
            JWT_CONFIG.secret,
            { expiresIn: JWT_CONFIG.expiresIn }
        );

        return res.json({
            mensagem: "Login bem-sucedido!",
            tipo: tipoRetorno,
            dados: dadosComAutorizacoes,
            token
        });

    } catch (error) {
        console.error('Erro no login:', error);
        res.status(500).json({ mensagem: 'Erro ao realizar login.', erro: error.message });
    }
});



router.get("/", UsuarioController.listarAtivos);
router.get("/:id", UsuarioController.buscarPorId);
router.delete("/:id", UsuarioController.excluir);

export default router;