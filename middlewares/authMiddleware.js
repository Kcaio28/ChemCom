import jwt from 'jsonwebtoken';
import { JWT_CONFIG } from '../config/jwt.js';

// Middleware de autenticação JWT
const authMiddleware = (req, res, next) => {
    try {
        // Verificar se o header Authorization existe
        const authHeader = req.headers.authorization;
        
        if (!authHeader) {
            console.log('❌ Token não fornecido - Header Authorization ausente');
            return res.status(401).json({ 
                sucesso: false,
                erro: 'Token de acesso não fornecido',
                mensagem: 'É necessário fornecer um token de autenticação'
            });
        }

        // Extrair o token do header (formato: "Bearer TOKEN")
        const token = authHeader.split(' ')[1];
        
        if (!token) {
            console.log('❌ Token inválido - Formato incorreto');
            return res.status(401).json({ 
                sucesso: false,
                erro: 'Token de acesso inválido',
                mensagem: 'Formato do token incorreto'
            });
        }

        // Verificar se JWT_SECRET está configurado
        if (!JWT_CONFIG.secret) {
            console.error('❌ JWT_SECRET não configurado');
            return res.status(500).json({ 
                sucesso: false,
                erro: 'Erro de configuração do servidor',
                mensagem: 'JWT_SECRET não está configurado'
            });
        }

        // Verificar e decodificar o token
        const decoded = jwt.verify(token, JWT_CONFIG.secret);
        
        // Adicionar informações do usuário ao request
        req.user = {
            id: decoded.id,
            tipo: decoded.tipo,
            email: decoded.email
        };
        // Manter compatibilidade com req.usuario também
        req.usuario = req.user;

        console.log('✅ Usuário autenticado:', { id: req.user.id, tipo: req.user.tipo });
        next();
    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            console.log('❌ Token expirado');
            return res.status(401).json({ 
                sucesso: false,
                erro: 'Token expirado',
                mensagem: 'Faça login novamente'
            });
        }
        
        if (error.name === 'JsonWebTokenError') {
            console.log('❌ Token inválido:', error.message);
            return res.status(401).json({ 
                sucesso: false,
                erro: 'Token inválido',
                mensagem: 'Token de autenticação inválido'
            });
        }

        console.error('❌ Erro no middleware de autenticação:', error);
        return res.status(500).json({ 
            sucesso: false,
            erro: 'Erro interno do servidor',
            mensagem: 'Erro ao processar autenticação'
        });
    }
};

// Middleware para verificar se o usuário é administrador
const adminMiddleware = (req, res, next) => {
    const user = req.user || req.usuario;
    if (!user || user.tipo !== 'admin') {
        return res.status(403).json({ 
            erro: 'Acesso negado',
            mensagem: 'Apenas administradores podem acessar este recurso'
        });
    }
    next();
};

export { authMiddleware, adminMiddleware };