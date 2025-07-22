const Admin = require('../models/AdminModel');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const login = async (username, password) => {
  const admin = await Admin.findOne({ where: { username, isActive: true } });
  if (!admin) throw new Error('Invalid username or password');
  console.log(password, admin.passwordHash);
  const match = password == admin.passwordHash;
  if (!match) throw new Error('Invalid username or password');

  // Update last login
  await admin.update({ lastLoginAt: new Date() });

  const token = jwt.sign(
    { id: admin.id, username: admin.username, role: admin.role },
    process.env.JWT_SECRET || 'your_jwt_secret',
    { expiresIn: '1d' }
  );

  return {
    token,
    admin: {
      id: admin.id,
      fullName: admin.fullName,
      username: admin.username,
      role: admin.role,
      isActive: admin.isActive,
      createdAt: admin.createdAt,
      lastLoginAt: admin.lastLoginAt
    }
  };
};

module.exports = { login }; 