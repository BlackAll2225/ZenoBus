const { poolPromise, sql } = require("../config/db");

const createAccount = async (username, passwordHash, role = 'Customer') => {
  const pool = await poolPromise;
  const result = await pool
    .request()
    .input("Username", sql.NVarChar, username)
    .input("PasswordHash", sql.NVarChar, passwordHash)
    .input("Role", sql.NVarChar, role)
    .query(`
      INSERT INTO Account (Username, PasswordHash, Role, CreatedAt)
      OUTPUT INSERTED.*
      VALUES (@Username, @PasswordHash, @Role, GETDATE())
    `);
  return result.recordset[0];
};

const findAccountByUsername = async (username) => {
  const pool = await poolPromise;
  const result = await pool
    .request()
    .input("Username", sql.NVarChar, username)
    .query("SELECT * FROM Account WHERE Username = @Username");
  return result.recordset[0];
};

module.exports = {
  createAccount,
  findAccountByUsername,
};
