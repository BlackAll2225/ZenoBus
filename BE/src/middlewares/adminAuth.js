const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.unauthorized('Bạn cần đăng nhập với quyền admin');
  }
  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your_jwt_secret');
    if (decoded.role !== 'admin') {
      return res.unauthorized('Chỉ admin mới được phép thực hiện thao tác này');
    }
    req.admin = decoded;
    next();
  } catch (err) {
    return res.unauthorized('Token không hợp lệ hoặc đã hết hạn');
  }
}; 