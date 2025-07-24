const sql = require("mssql");

const config = {
  user: "sa",
  password: "YourPassword123",
  server: "localhost",
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