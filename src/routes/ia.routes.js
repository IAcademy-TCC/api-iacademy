const router = require("express").Router();
const autenticarToken = require("../middlewares/authMiddleware");
const { criarTrilhaPersonalizada, obterTrilhaAtiva } = require("../controllers/iaController");

router.post("/criar-trilha", autenticarToken, criarTrilhaPersonalizada);
router.get("/trilha-ativa", autenticarToken, obterTrilhaAtiva);

module.exports = router