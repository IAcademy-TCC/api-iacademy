const router = require('express').Router();
const autenticarToken = require('../middlewares/authMiddleware');
const {atualizarPerfil, obterPerfil} = require('../controllers/perfilController');

router.get('/perfil', autenticarToken, obterPerfil)

router.patch('/perfil', autenticarToken, atualizarPerfil);

module.exports = router;