const sequelize = require('./database');
const User = require('../models/UserModel');

const initDatabase = async () => {
  try {
    // Test database connection
    await sequelize.authenticate();
    console.log('Database connection has been established successfully.');

    // Sync all models
    // Note: In production, you might want to use migrations instead
    await sequelize.sync();
    console.log('All models were synchronized successfully.');
  } catch (error) {
    console.error('Unable to connect to the database:', error);
  }
};

module.exports = initDatabase; 