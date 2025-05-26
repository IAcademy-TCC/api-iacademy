const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');

const authRoute = require('./src/routes/auth.routes');
const perfilRoute = require('./src/routes/perfil.routes');

dotenv.config();
const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.use('/', authRoute);
app.use('/', perfilRoute);

app.listen(PORT, () => {
    console.log(`Servidor rodando na porta: ${PORT}`);
})
