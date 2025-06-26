const router = require('express').Router();
const { listarModulosPorTrilha, criarModulo } = require('../controllers/moduloController');

router.get('/:trilhaId', listarModulosPorTrilha);
router.post('/', criarModulo); // Proteger futuramente

module.exports = router;
