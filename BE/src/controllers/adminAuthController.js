const adminAuthService = require('../services/adminAuthService');

const login = async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.validationError('Username and password are required', ['username', 'password']);
    }
    const { token, admin } = await adminAuthService.login(username, password);
    return res.success({ token, admin }, 'Admin login successful');
  } catch (err) {
    return res.unauthorized(err.message);
  }
};

module.exports = { login }; 