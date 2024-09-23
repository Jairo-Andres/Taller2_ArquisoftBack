// models/reservationModel.js
const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');
const Event = require('./eventModel');

const Reservation = sequelize.define('Reservation', {
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false
  },
  seats: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  eventId: {
    type: DataTypes.INTEGER,
    references: {
      model: Event,
      key: 'id'
    }
  }
}, {});

Reservation.belongsTo(Event, { foreignKey: 'eventId' });

module.exports = Reservation;
