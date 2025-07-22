const sql = require("mssql");

const config = {
  user: "sa",
  password: "StrongPa$$123",
  server: "14.225.255.72",
  database: "BusTicketSystem2",
  options: {
    trustServerCertificate: true,
  },
};

const poolPromise = new sql.ConnectionPool(config)
  .connect()
  .then((pool) => {
    console.log("Connected to SQL Server");
    return pool;
  })
  .catch((err) => console.error("DB Connection Failed", err));

module.exports = {
  sql,
  poolPromise,
};