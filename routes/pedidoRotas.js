import express from "express";
import { finalizarCompra } from "../controllers/PedidoController.js";
import { PedidoController } from "../controllers/PedidoController.js";
import { authMiddleware, adminMiddleware } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.post("/finalizar", finalizarCompra);

router.get("/meus-pedidos", authMiddleware, PedidoController.meusPedidos);

router.get("/detalhes/:nro_pedido", authMiddleware, PedidoController.detalharPedido);

router.patch('/cancelar/:nro_pedido', authMiddleware, PedidoController.cancelarPedido)

router.patch('/admin/status/:nro_pedido', authMiddleware, adminMiddleware, PedidoController.atualizarStatus)

router.get("/admin/todos-pedidos", authMiddleware, adminMiddleware, PedidoController.todosPedidos);

router.get("/admin/detalhes/:nro_pedido", authMiddleware, adminMiddleware, PedidoController.detalharPedido);

export default router;