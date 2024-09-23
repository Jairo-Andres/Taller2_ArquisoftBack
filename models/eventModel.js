// models/eventModel.js
const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Event = sequelize.define('Event', {
  title: {
    type: DataTypes.STRING,
    allowNull: false
  },
  date: {
    type: DataTypes.DATE,
    allowNull: false
  },
  location: {
    type: DataTypes.STRING,
    allowNull: false
  },
  availableSeats: {
    type: DataTypes.INTEGER,
    allowNull: false
  }
}, {});

module.exports = Event;
