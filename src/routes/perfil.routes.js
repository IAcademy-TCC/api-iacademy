const router = require('express').Router();
const autenticarToken = require('../middlewares/authMiddleware');
const {atualizarPerfil, obterPerfil, adicionarPontos} = require('../controllers/perfilController');



router.get('/', autenticarToken, obterPerfil)

router.patch('/attperfil', autenticarToken, atualizarPerfil);

router.patch("/pontos", autenticarToken, adicionarPontos);
  

module.exports = router;