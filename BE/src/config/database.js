const { Sequelize } = require("sequelize");
require("dotenv").config();

const sequelize = new Sequelize("BusTicketSystem2", "sa", "StrongPa$$123", {
  host: "14.225.255.72",
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