import express from 'express';
import UsuarioModel from '../models/UsuarioModel.js';

const router = express.Router();

router.post('/cadastro', async (req, res) => {
    try {
        const { nome, cnpj, email, senha, cidade, estado, telefone, id, cep, numero, logradouro } = req.body;

        const existe = await UsuarioModel.buscarPorEmail(email);
        if (existe) {
            return res.status(400).json({ mensagem: 'Este email já está cadastrado' });
        }

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
            logradouro
        });
        res.status(201).json({ mensagem: 'Empresa cadastrada com sucesso!' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ mensagem: 'Erro ao cadastrar empresa.' });
    }
});

router.post('/login', async (req, res) => {
    try {
        const { email, senha } = req.body;
        const usuario = await UsuarioModel.verificarCredenciais(email, senha);

        if (!usuario) {
            return res.status(401).json({ mensagem: 'Email ou senha inválidos.' });
        }

        res.json({ mensagem: 'Login bem-sucedido!', usuario });
    } catch (error) {
        console.error(error);
        res.status(500).json({ mensagem: 'Erro ao realizar login.' });
    }
});

export default router;