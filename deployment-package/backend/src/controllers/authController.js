const authService = require('../services/authService');

const registerController = async (req, res) => {
  try {
    const { fullName, email, phoneNumber, password } = req.body;
    
    // Validate required fields
    if (!fullName || !email || !phoneNumber || !password) {
      return res.validationError('All fields are required', ['fullName', 'email', 'phoneNumber', 'password']);
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.validationError('Invalid email format', ['email']);
    }

    // Validate phone number format
    const phoneRegex = /^[0-9]{10,11}$/;
    if (!phoneRegex.test(phoneNumber)) {
      return res.validationError('Invalid phone number format', ['phoneNumber']);
    }

    // Validate password length
    if (password.length < 6) {
      return res.validationError('Password must be at least 6 characters long', ['password']);
    }

    const user = await authService.register(fullName, email, phoneNumber, password);
    return res.created({
      id: user.id,
      fullName,
      email,
      phoneNumber
    }, 'Registration successful');
  } catch (err) {
    if (err.message === "Email already exists") {
      return res.error(err.message, 400);
    }
    return res.serverError(err.message);
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.validationError('Email and password are required', ['email', 'password']);
    }

    const { token, user } = await authService.login(email, password);
    return res.success({
      token,
      user: {
        id: user.id,
        fullName: user.fullName,
        email: user.email,
        phoneNumber: user.phoneNumber,
        createdAt: user.createdAt
      }
    }, 'Login successful');
  } catch (err) {
    return res.unauthorized(err.message);
  }
};

const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    
    if (!email) {
      return res.validationError('Email is required', ['email']);
    }

    await authService.forgotPassword(email);
    return res.success(null, 'Reset code sent to email.');
  } catch (error) {
    return res.error(error.message, 400);
  }
};

module.exports = {
  registerController,
  login,
  forgotPassword,
};
