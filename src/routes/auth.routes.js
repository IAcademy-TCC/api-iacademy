const express = require('express');
const { register, login } = require('../controllers/authController');
const { validarEmailInstitucional } = require('../middlewares/validarEmail')
const router = express.Router();

router.post('/register', validarEmailInstitucional, register);
router.post('/login', login)

module.exports = router;