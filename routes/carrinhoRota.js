import express from "express"
import {PedidoController} from "../controllers/PedidoController.js"
import { authMiddleware } from "../middlewares/authMiddleware.js"
import {
  uploadImagens,
  handleUploadError,
} from "../middlewares/uploadMiddleware.js";
import PedidoModel from "../models/PedidoModel.js";

const router = express.Router()

router.get('/meusPedidos', authMiddleware, PedidoController.listarPedidoPorCliente)

router.get('/', authMiddleware, PedidoController.listarCarrinho)

router.post('/adicionar', authMiddleware, PedidoController.adicionarItem)

router.post('/finalizar', authMiddleware, PedidoController.finalizarPedido)

router.delete('/delete/:id/:nro', authMiddleware, PedidoController.removerItem)

export default router