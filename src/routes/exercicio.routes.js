const router = require('express').Router();
const { obterExercicioPorId } = require('../controllers/exercicioController');

// Buscar exercício específico dentro de uma unidade
router.get('/:id_unidade/:id_exercicio', obterExercicioPorId);

module.exports = router;
