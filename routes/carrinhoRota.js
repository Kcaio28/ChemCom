import express from "express";
import ProdutoController from "../controllers/ProdutoController.js";
import { authMiddleware } from "../middlewares/authMiddleware.js";
import {
  uploadImagens,
  handleUploadError,
} from "../middlewares/uploadMiddleware.js";
import { PedidoModel } from "../models/PedidoModel.js";
import fs from "fs";

const router = express.Router();

router.post('/adicionar', (req, res) => {
    const {id_cliente, id_produto, id_lote, qtd} = req.body
    if(!id_cliente || !id_produto || !id_lote || !qtd) {
        return res.status(400).json({erro: "Faltam parâmetros"})
    }
    
    try {
        const nro_pedido = await
    }
})