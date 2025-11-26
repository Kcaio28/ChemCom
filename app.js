import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Importar rotas
import produtoRotas from './routes/produtoRotas.js';
import authRotas from './routes/authRotas.js';
import criptografiaRotas from './routes/criptografiaRotas.js';
import usuarioRotas from './routes/usuarioRotas.js';
import clienteRotas from './routes/clienteRotas.js';

// Importar middlewares
// import { logMiddleware } from './middlewares/logMiddleware.js';
import { errorMiddleware } from './middlewares/errorMiddleware.js';

// Carregar variáveis do arquivo .env
dotenv.config();

const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configurações do servidor
const PORT = process.env.PORT || 3000;

// Middlewares globais
// app.use(
//   helmet({
//     contentSecurityPolicy: {
//       directives: {
//         defaultSrc: ["'self'"],
//         scriptSrc: [
//           "'self'",
//           "https://cdn.jsdelivr.net",
//           "'unsafe-inline'"   // se quiser remover scripts inline, posso te ajudar a retirar
//         ],
//         styleSrc: [
//           "'self'",
//           "https://cdn.jsdelivr.net",
//           "https://fonts.googleapis.com",
//           "'unsafe-inline'"
//         ],
//         imgSrc: ["'self'", "data:", "blob:"],
//         fontSrc: [
//           "'self'",
//           "https://fonts.gstatic.com",
//           "https://cdn.jsdelivr.net"
//         ],
//         connectSrc: [
//           "'self'",
//           "https://cdn.jsdelivr.net"
//         ],
//         objectSrc: ["'none'"],
//         mediaSrc: ["'self'"],
//         frameSrc: ["'self'"]
//       },
//     },
//   })
// );


// Configuração CORS global
app.use(cors({
    origin: '*', // Permitir todas as origens. Ajuste conforme necessário. Ex.: 'http://meufrontend.com'
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'], // Métodos permitidos
    allowedHeaders: ['Content-Type', 'Authorization'], // Cabeçalhos permitidos
    preflightContinue: false, // Não passar para o próximo middleware
    optionsSuccessStatus: 200 // Responder com 200 para requisições OPTIONS
}));

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


//  Servir arquivos estáticos
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Middleware para log de requisições (salva no banco de dados)
// app.use(logMiddleware);

// Rotas da API
app.use('/api/auth', authRotas);
app.use('/api/produtos', produtoRotas);
app.use('/api/criptografia', criptografiaRotas);
app.use('/api/usuarios', usuarioRotas);
app.use('/clienteRotas', clienteRotas);

// Rota raiz

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "home.html"));
});


// Middleware para tratar rotas não encontradas
app.use('*', (req, res) => {
    res.status(404).json({
        sucesso: false,
        erro: 'Rota não encontrada',
        mensagem: `A rota ${req.method} ${req.originalUrl} não foi encontrada`
    });
});

// Middleware global de tratamento de erros (deve ser o último)
app.use(errorMiddleware);

// Iniciar servidor
app.listen(PORT, () => {
    console.log(`Acesse: http://localhost:${PORT}`);
    console.log(`API de Produtos - Sistema de Gestão`);
    console.log(`Ambiente: ${process.env.NODE_ENV || 'development'}`);
});

export default app;

