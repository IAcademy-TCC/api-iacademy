const router = require('express').Router();
const autenticarToken = require('../middlewares/authMiddleware');

router.get('/perfil', autenticarToken, (req, res) => {
    res.json({
        message: 'Acesso ao perfil permitido!',
        usuario: req.user
    });
})

module.exports = router;