const router = require('express').Router();
const {
  listarJornadas,
  obterJornadaPorId,
  criarJornada,
} = require('../controllers/jornadaControllers');

// trilhas visíveis
router.get('/', listarJornadas);
router.get('/:id', obterJornadaPorId);

// rota protegida (admin)
const autenticarToken = require('../middlewares/authMiddleware');
router.post('/', autenticarToken, criarJornada);

module.exports = router;
