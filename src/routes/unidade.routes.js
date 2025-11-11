const router = require('express').Router();
const { listarUnidadesPorModulo, criarUnidade, obterUnidadePorId } = require('../controllers/unidadeController');

router.get('/:moduloId', listarUnidadesPorModulo);
router.get('/:id', obterUnidadePorId);
router.post('/', criarUnidade); // Proteger futuramente

module.exports = router;
