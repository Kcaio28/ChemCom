import express from "express";
import ProdutoController from "../controllers/ProdutoController.js";
import { authMiddleware } from "../middlewares/authMiddleware.js";
import {
  uploadImagens,
  handleUploadError,
} from "../middlewares/uploadMiddleware.js";
import { ProdutoModel } from "../models/ProdutoModel.js";
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
router.put(
  "/:id",
  authMiddleware,
  uploadImagens.single("imagem"),
  handleUploadError,
  ProdutoController.atualizar
);
router.delete("/:id", authMiddleware, ProdutoController.excluir);

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

router.options("/:id", (req, res) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET, PUT, DELETE, OPTIONS");
  res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
  const id = parseInt(req.params.id)
  fs.readFile("./public/produto.html", "utf8", (erro, produto) => {
    if (erro) {
      console.error("Erro ao ler HTML:", erro);
      res.status(500).send("Erro ao carregar página.");
      return;
    }

    const produto = ProdutoModel.buscarPorId()

    let paginaFinal = null

    try {
        paginaFinal = produto
        paginaFinal = paginaFinal.replaceAll('[nome]', produto.nome)
        paginaFinal = paginaFinal.replaceAll('[descricao]', produto.descricao)
        paginaFinal = paginaFinal.replaceAll('[preco]', produto.preco.toFixed(2))
        paginaFinal = paginaFinal.replaceAll('imagens[0]', produto.imagem1)
        paginaFinal = paginaFinal.replaceAll('imagens[1]', produto.imagem2)
        paginaFinal = paginaFinal.replaceAll('imagens[2]', produto.imagem3)
        paginaFinal = paginaFinal.replaceAll('[categoria]', produto.categoria)
    } catch (error) {

    }

    if (!paginaFinal) {
        return;
    }
    res.status(200).send(paginaFinal)

  });
  res.status(200).send();
});

export default router;