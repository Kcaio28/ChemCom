import express from "express";
import LoteController from "../controllers/LoteController.js";

const router = express.Router();

router.post("/", LoteController.criar);
router.get("/", LoteController.listar);

router.get("/alertas/validade", LoteController.validadeProxima);
router.put("/saida/:id", LoteController.baixarQuantidade);

router.get("/:id_produto", LoteController.listarPorProduto);
router.put("/:id", LoteController.atualizar);
router.delete("/:id", LoteController.excluir);



export default router;