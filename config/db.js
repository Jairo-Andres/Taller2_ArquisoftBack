// config/db.js
const { Sequelize } = require('sequelize');

// Configuración de la base de datos
const sequelize = new Sequelize('gestion_eventos', 'postgres', '1234', {
  host: 'localhost',
  dialect: 'postgres',
  logging: false
});

sequelize.authenticate()
  .then(() => {
    console.log('Conectado a la base de datos PostgreSQL.');
  })
  .catch((err) => {
    console.error('Error al conectar a la base de datos:', err);
  });

module.exports = sequelize;
