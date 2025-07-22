const jwt = require('jsonwebtoken');

// Middleware kiểm tra role cụ thể
const requireRole = (allowedRoles) => {
  return (req, res, next) => {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.unauthorized('Bạn cần đăng nhập với quyền admin');
    }
    
    const token = authHeader.split(' ')[1];
    
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your_jwt_secret');
      
      // Kiểm tra role
      if (!allowedRoles.includes(decoded.role)) {
        return res.forbidden(`Chỉ ${allowedRoles.join(', ')} mới được phép thực hiện thao tác này`);
      }
      
      // Lưu thông tin user vào request
      req.user = decoded;
      req.userRole = decoded.role;
      
      next();
    } catch (err) {
      return res.unauthorized('Token không hợp lệ hoặc đã hết hạn');
    }
  };
};

// Middleware cho admin
const requireAdmin = requireRole(['admin']);

// Middleware cho admin và manager
const requireAdminOrManager = requireRole(['admin', 'manager']);

// Middleware cho admin, manager và support
const requireAdminManagerOrSupport = requireRole(['admin', 'manager', 'support']);

// Middleware kiểm tra quyền cleanup (chỉ admin)
const requireCleanupPermission = (req, res, next) => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.unauthorized('Bạn cần đăng nhập với quyền admin');
  }
  
  const token = authHeader.split(' ')[1];
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your_jwt_secret');
    
    // Chỉ admin mới được phép cleanup
    if (decoded.role !== 'admin') {
      return res.forbidden('Chỉ admin mới được phép thực hiện thao tác cleanup');
    }
    
    req.user = decoded;
    req.userRole = decoded.role;
    
    next();
  } catch (err) {
    return res.unauthorized('Token không hợp lệ hoặc đã hết hạn');
  }
};

module.exports = {
  requireRole,
  requireAdmin,
  requireAdminOrManager,
  requireAdminManagerOrSupport,
  requireCleanupPermission
}; 