const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');

const authRoute = require('./src/routes/auth.routes');
const perfilRoute = require('./src/routes/perfil.routes');
const painelRoutes = require('./src/routes/painel.routes')

dotenv.config();
const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.use('/auth', authRoute);
app.use('/', perfilRoute);
app.use('/painel', painelRoutes);

app.listen(PORT, () => {
    console.log(`Servidor rodando na porta: ${PORT}`);
})
