// index.js
// Importaciones necesarias
const express = require('express');
const sequelize = require('./config/db');  // Conexión a la base de datos
const soapService = require('./soap/soapService');  // Servicio SOAP
const cors = require('cors'); // Importa el paquete CORS

const app = express();
const port = 3001;

// Habilitar CORS
app.use(cors({
  origin: 'http://localhost:3000', // Permitir el acceso desde el front-end
}));

// Sincronizar la base de datos y luego iniciar el servidor
sequelize.sync({ force: false })  // `force: false` evita que las tablas existentes se eliminen
  .then(() => {
    console.log('Modelos sincronizados con la base de datos.');

    // Iniciar el servicio SOAP
    soapService(app);

    // Levantar el servidor
    app.listen(port, () => {
      console.log(`Servidor ejecutándose en http://localhost:${port}`);
    });
  })
  .catch(err => {
    console.error('Error al sincronizar la base de datos:', err);
  });
