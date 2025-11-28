import dotenv from 'dotenv';

// Carregar variáveis do arquivo .env
dotenv.config();

// Configurações JWT
export const JWT_CONFIG = {
    secret: process.env.JWT_SECRET || 'fallback-secret-key-change-in-production',
    expiresIn: process.env.JWT_EXPIRES_IN || '24h'
};

// Validar se JWT_SECRET está configurado em produção
if (process.env.NODE_ENV === 'production' && !process.env.JWT_SECRET) {
    console.warn('⚠️ AVISO: JWT_SECRET não está configurado. Usando chave padrão (INSEGURO PARA PRODUÇÃO)');
}

// Configurações de Upload
export const UPLOAD_CONFIG = {
    path: process.env.UPLOAD_PATH || './uploads',
    maxFileSize: parseInt(process.env.MAX_FILE_SIZE) || 5242880, // 5MB
    allowedTypes: process.env.ALLOWED_FILE_TYPES ? 
        process.env.ALLOWED_FILE_TYPES.split(',') : 
        [
            'image/jpeg', 'image/png', 'image/gif', 'image/webp',
            'application/pdf', 'application/msword', 
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'application/vnd.ms-excel',
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'text/plain', 'text/csv',
            'application/zip', 'application/x-rar-compressed'
        ]
};

