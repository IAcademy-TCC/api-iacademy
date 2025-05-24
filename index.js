const express = require('express');
const dotenv = require('dotenv');
const authRoute = require('./src/routes/auth.routes');
const cors = require('cors');

dotenv.config();
const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.use('/', authRoute);

app.listen(PORT, () => {
    console.log(`Servidor rodando na porta: ${PORT}`);
})
