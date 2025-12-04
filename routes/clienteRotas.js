import express from 'express';
import jwt from 'jsonwebtoken';
import UsuarioModel from '../models/UsuarioModel.js';
import { JWT_CONFIG } from '../config/jwt.js';
import axios from 'axios';
import { CNAES_PERMITIDOS } from '../utils/cnaes.js';

const router = express.Router();

router.post('/cadastro', async (req, res) => {
    try {
        const { nome, cnpj, email, senha, cidade, estado, telefone, cep, numero, logradouro } = req.body;

        // Verifica email duplicado
        const existe = await UsuarioModel.buscarPorEmail(email);
        if (existe) {
            return res.status(400).json({ mensagem: 'Este email já está cadastrado.' });
        }

        const cnpjLimpo = cnpj.replace(/\D/g, "");
        // 1️⃣ CONSULTA AUTOMÁTICA NO CNPJ
        const consulta = await axios.get(`https://publica.cnpj.ws/cnpj/${cnpjLimpo}`);
        const dados = consulta.data;

        const cnaePrincipal = dados.estabelecimento.atividade_principal.id.replace(/\D/g, "");
        const cnaesSecundarios = dados.estabelecimento.atividades_secundarias.map(a =>
            a.id.replace(/\D/g, "")
        );

        // 2️⃣ VERIFICA SE O CNAE É PERMITIDO
        const autorizado =
            CNAES_PERMITIDOS.includes(cnaePrincipal) ||
            cnaesSecundarios.some(c => CNAES_PERMITIDOS.includes(c));

        const status = autorizado ? "APROVADO" : "PENDENTE";

        // 3️⃣ CRIAR NO BANCO
        await UsuarioModel.criar({
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
            autorizacao_status: status
        });

        res.status(201).json({
            mensagem: 'Empresa cadastrada com sucesso!',
            autorizacao: status
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ mensagem: 'Erro ao cadastrar empresa.' });
    }
});

router.post('/login', async (req, res) => {
    try {
        const { email, senha } = req.body;

        if (!email || !senha) {
            return res.status(400).json({
                mensagem: 'Email e senha são obrigatórios.'
            });
        }

        // Verificar se JWT_SECRET está configurado
        if (!JWT_CONFIG.secret) {
            console.error('ERRO: JWT_SECRET não está configurado no arquivo .env');
            return res.status(500).json({
                mensagem: 'Erro de configuração do servidor. Contate o administrador.'
            });
        }

        console.log('🔐 Tentativa de login para:', email);

        const usuario = await UsuarioModel.verificarCredenciais(email, senha);
        let adm = null;

        if (!usuario) {
            console.log('👤 Usuário comum não encontrado, tentando como admin...');
            try {
                adm = await UsuarioModel.verificarADM(email, senha);
                if (adm) {
                    console.log('✅ Admin encontrado e autenticado!');
                } else {
                    console.log('❌ Admin não encontrado ou credenciais inválidas');
                }
            } catch (admError) {
                console.error('❌ Erro ao verificar admin:', admError);
                // Continuar para retornar erro genérico
            }
        }

        if (!usuario && !adm) {
            console.log('❌ Credenciais inválidas para:', email);
            return res.status(401).json({
                mensagem: 'Email ou senha inválidos.'
            });
        }

        const userData = usuario || adm;
        // Padronizar tipo: 'adm' -> 'admin' para compatibilidade com middleware
        const userType = usuario ? 'usuario' : 'admin';
        const tipoRetorno = usuario ? 'usuario' : 'adm'; // Manter 'adm' na resposta para compatibilidade com frontend

        console.log('✅ Credenciais válidas. Tipo:', userType, 'ID:', userData.id);

        // Gerar token JWT
        try {
            if (!JWT_CONFIG.secret) {
                throw new Error('JWT_SECRET não está configurado');
            }

            const token = jwt.sign(
                {
                    id: userData.id,
                    email: userData.email,
                    tipo: userType // Usar 'admin' no token para compatibilidade com middleware
                },
                JWT_CONFIG.secret,
                { expiresIn: JWT_CONFIG.expiresIn }
            );

            console.log('✅ Token gerado com sucesso. Tipo no token:', userType);

            return res.json({
                mensagem: "Login bem-sucedido!",
                tipo: tipoRetorno, // Retornar 'adm' na resposta para compatibilidade com frontend
                dados: userData,
                token: token
            });
        } catch (tokenError) {
            console.error('❌ Erro ao gerar token JWT:', tokenError);
            console.error('JWT_CONFIG:', {
                secret: JWT_CONFIG.secret ? 'Configurado' : 'NÃO CONFIGURADO',
                expiresIn: JWT_CONFIG.expiresIn
            });
            return res.status(500).json({
                mensagem: 'Erro ao gerar token de autenticação.',
                erro: process.env.NODE_ENV === 'development' ? tokenError.message : undefined
            });
        }
    } catch (error) {
        console.error('Erro no login:', error);
        res.status(500).json({
            mensagem: 'Erro ao realizar login.',
            erro: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
});

export default router;