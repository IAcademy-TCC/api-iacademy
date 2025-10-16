const router = require('express').Router();
const autenticarToken = require('../middlewares/authMiddleware');
const {atualizarPerfil, obterPerfil} = require('../controllers/perfilController');

router.patch('/attperfil', autenticarToken, atualizarPerfil);
router.get('/perfil', autenticarToken, obterPerfil);

module.exports = router;