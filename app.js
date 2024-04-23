require('dotenv').config();
const express = require('express')
const app = express()
const port = process.env.port || 3500
const routes = require('./routes/routes')
const cors = require('cors')

app.use(cors());

/* app.use(cors({
  origin: 'https://easysom.com.br',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
})); */
app.use(express.json())
app.use('/', routes);

app.listen(port, () => {
    console.log(`Servidor rodando na porta: ${port}`);
  });


