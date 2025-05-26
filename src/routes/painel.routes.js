const router = require('express').Router();
const autenticarToken = require('../middlewares/authMiddleware');
const verificarPermissao = require('../middlewares/verificarPermissao');


//Rota para o painel administrativo
router.get('/admin', autenticarToken, verificarPermissao('admin'), (req, res) =>{
    res.json({
        message: 'Bem-vindo ao painel administrativo!',
        user: req.user
    });
});


//Rota para o painel dos professores
router.get('/professor', autenticarToken, verificarPermissao('professor', 'admin'), (req, res) => {
    res.json({
        message: 'Bem-vindo ao painel do professor!',
        user: req.user
    });
});

//Rota para o aluno
router.get('/aluno', autenticarToken, verificarPermissao('aluno'), (req, res) => {
    res.json({
        message: 'Bem-vindo ao painel do aluno!',
        user: req.user
    });
});

module.exports = router;