const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');

const authRoute = require('./src/routes/auth.routes');
const perfilRoute = require('./src/routes/perfil.routes');
const painelRoutes = require('./src/routes/painel.routes')
const jornadaRoutes = require('./src/routes/jornadas.routes')
const trilhaRoutes = require('./src/routes/trilha.routes')
const moduloRoutes = require('./src/routes/modulo.routes')
const unidadeRoutes = require('./src/routes/unidade.routes')

dotenv.config();
const app = express();
const PORT = process.env.PORT || 10000;

app.use(cors());
app.use(express.json());

app.use('/auth', authRoute);
app.use('/', perfilRoute);
app.use('/painel', painelRoutes);
app.use('/jornada', jornadaRoutes);
app.use('/trilhas', trilhaRoutes);
app.use('/modulos', moduloRoutes);
app.use('/unidades', unidadeRoutes);

app.listen(PORT, () => {
    console.log(`Servidor rodando na porta: ${PORT}`);
})
