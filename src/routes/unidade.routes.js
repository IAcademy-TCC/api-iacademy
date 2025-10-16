const router = require('express').Router();
const { listarUnidadesPorModulo, criarUnidade } = require('../controllers/unidadeController');

router.get('/:moduloId', listarUnidadesPorModulo);
router.post('/', criarUnidade); // Proteger futuramente

module.exports = router;
