const router = require('express').Router();
const autenticarToken = require('../middlewares/authMiddleware');
const {atualizarPerfil} = require('../controllers/perfilController');

router.get('/perfil', autenticarToken, (req, res) => {
    res.json({
        message: 'Acesso ao perfil permitido!',
        usuario: req.user
    });
});

router.patch('/perfil', autenticarToken, atualizarPerfil);

module.exports = router;