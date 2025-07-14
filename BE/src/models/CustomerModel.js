const { sql, poolPromise } = require('../config/db');

const createCustomer = async (accountId, fullName, email, phone) => {
  try {
    const pool = await poolPromise;
    const request = pool.request();
    request.input('AccountID', sql.Int, accountId);
    request.input('FullName', sql.NVarChar, fullName);
    request.input('Email', sql.NVarChar, email);
    request.input('Phone', sql.NVarChar, phone);

    await request.query(`
      INSERT INTO Customer (AccountID, FullName, Email, Phone)
      VALUES (@AccountID, @FullName, @Email, @Phone)
    `);
  } catch (error) {
    throw new Error('createCustomer failed: ' + error.message);
  }
};

module.exports = {
  createCustomer
};
