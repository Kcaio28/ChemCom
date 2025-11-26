import express from "express";
import ProdutoController from "../controllers/ProdutoController.js";
import { authMiddleware } from "../middlewares/authMiddleware.js";
import {
  uploadImagens,
  handleUploadError,
} from "../middlewares/uploadMiddleware.js";
import ProdutoModel from "../models/ProdutoModel.js";
import fs from "fs";

const router = express.Router();

// Rotas públicas (não precisam de autenticação)
router.get("/", ProdutoController.listarTodos);
router.get("/:id", ProdutoController.buscarPorId);

// Rotas protegidas (precisam de autenticação)
router.post(
  "/",
  authMiddleware,
  uploadImagens.single("imagem"),
  handleUploadError,
  ProdutoController.criar
);
router.post(
  "/upload",
  authMiddleware,
  uploadImagens.single("imagem"),
  handleUploadError,
  ProdutoController.uploadImagem
);

router.post(
  "/criar",
  uploadImagens.fields([
    { name: "imagem1", maxCount: 1 },
    { name: "imagem2", maxCount: 1 },
    { name: "imagem3", maxCount: 1 }
  ]),
  handleUploadError,
  async (req, res) => {
    try {
      const { nome, descricao, preco, categoria, id_classificacao } = req.body;

      const imagens = {
        imagem1: req.files.imagem1?.[0]?.filename || null,
        imagem2: req.files.imagem2?.[0]?.filename || null,
        imagem3: req.files.imagem3?.[0]?.filename || null
      };

      const produto = await ProdutoModel.criar({
        nome,
        descricao,
        preco,
        categoria,
        id_classificacao,
        ...imagens
      });

      return res.status(201).json({
        mensagem: "Produto criado com sucesso!",
        produto
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({
        mensagem: "Erro ao criar produto."
      });
    }
  }
);

router.delete("/:id", ProdutoController.excluir);

router.put(
  "/:id",
  authMiddleware,
  uploadImagens.single("imagem"),
  handleUploadError,
  ProdutoController.atualizar
);
// router.delete("/:id", authMiddleware, ProdutoController.excluir);

// Rotas OPTIONS para CORS (preflight requests)
router.options("/", (req, res) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
  res.status(200).send();
});

router.options("/upload", (req, res) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
  res.status(200).send();
});


export default router;