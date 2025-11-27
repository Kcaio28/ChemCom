import express from "express";
import { finalizarCompra } from "../controllers/PedidoController.js";

const router = express.Router();

router.post("/finalizar", finalizarCompra);

export default router;