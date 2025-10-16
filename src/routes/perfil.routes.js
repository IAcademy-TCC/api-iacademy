const router = require('express').Router();
const autenticarToken = require('../middlewares/authMiddleware');
const {atualizarPerfil, obterPerfil} = require('../controllers/perfilController');



router.get('/', autenticarToken, obterPerfil)

router.patch('/attperfil', autenticarToken, atualizarPerfil);

module.exports = router;