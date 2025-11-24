const express = require("express");
const router = express.Router();
const autenticarToken = require('../middlewares/authMiddleware');

const {
  obterRankingGeral,
  obterRankingAluno,
  obterRankingInstituicao
} = require("../controllers/rankingController");

// Ranking geral
router.get("/", autenticarToken, obterRankingGeral);

// Ranking do aluno
router.get("/aluno", autenticarToken, obterRankingAluno);

// Ranking da instituição
router.get("/instituicao", autenticarToken, obterRankingInstituicao);

module.exports = router;
