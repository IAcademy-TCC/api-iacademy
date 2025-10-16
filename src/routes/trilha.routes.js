const router = require('express').Router();
const { listarTrilhasPorJornada, criarTrilha } = require('../controllers/trilhaController');

router.get('/:jornadaId', listarTrilhasPorJornada);
router.post('/', criarTrilha); // Proteger futuramente

module.exports = router;
