const express = require('express');
const dotenv = require('dotenv');
const testeRoute = require('./src/routes/testeRoute');
const cors = require('cors')

dotenv.config();
const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.use('/', testeRoute);

app.listen(PORT, () => {
    console.log(`Servidor rodando na porta: ${PORT}`);
})
