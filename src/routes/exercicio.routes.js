const router = require('express').Router();
const autenticarToken = require('../middlewares/authMiddleware');
const { obterExercicioPorId, statusExercicio } = require('../controllers/exercicioController');

// Buscar exercício específico dentro de uma unidade
router.get('/status/:id_exercicio', autenticarToken,  statusExercicio);
router.get('/:id_unidade/:id_exercicio', obterExercicioPorId);

module.exports = router;
