const { hashPassword, comparePassword } = require("../utils/hash");
const jwt = require("jsonwebtoken");
const User = require('../models/UserModel');

const register = async (fullName, email, phoneNumber, password) => {
  // Check if email already exists
  const existingUser = await User.findOne({ where: { email } });
  if (existingUser) {
    throw new Error("Email already exists");
  }

  const passwordHash = password;
  
  // Create new user
  const user = await User.create({
    fullName,
    email,
    phoneNumber,
    passwordHash
  });

  return user;
};

const login = async (email, password) => {
  const user = await User.findOne({ where: { email } });
  if (!user) throw new Error("Invalid email or password");

  const match = password == user.passwordHash;
  if (!match) throw new Error("Invalid email or password");

  const token = jwt.sign(
    { id: user.id, email: user.email },
    process.env.JWT_SECRET || "your_jwt_secret",
    { expiresIn: "1d" }
  );
  
  return { 
    token, 
    user: {
      id: user.id,
      fullName: user.fullName,
      email: user.email,
      phoneNumber: user.phoneNumber,
      createdAt: user.createdAt
    }
  };
};

const forgotPassword = async (email) => {
  const user = await User.findOne({ where: { email } });
  if (!user) throw new Error('Email not found.');

  const resetCode = Math.floor(100000 + Math.random() * 900000);
  console.log(`Reset code for ${email}: ${resetCode}`);
};

module.exports = {
  register,
  login,
  forgotPassword,
};
