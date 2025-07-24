const { Sequelize } = require("sequelize");
require("dotenv").config();

const sequelize = new Sequelize("BusTicketSystem2", "sa", "YourPassword123", {
  host: "localhost",
  dialect: "mssql",
  dialectOptions: {
    options: {
      trustServerCertificate: true,
      encrypt: false,
    },
  },
  logging: false,
});

// Test connection
sequelize
  .authenticate()
  .then(() => {
    console.log("Connection has been established successfully.");
  })
  .catch((err) => {
    console.error("Unable to connect to the database:", err);
  });

module.exports = sequelize;