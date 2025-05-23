const express = require('express');
const dotenv = require('dotenv');
const testeRoute = require('./src/routes/testeRoute');

dotenv.config();
const PORT = process.env.PORT || 5000;



const app = express();
app.use(express.json());

app.use('/api', testeRoute);

app.listen(PORT, () => {
    console.log(`Servidor rodando na porta: ${PORT}`);
})
