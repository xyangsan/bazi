const jwt = require('jsonwebtoken');
require('dotenv').config();

const JWT_SECRET = process.env.JWT_SECRET || 'bazi_secret_key_2026';

/**
 * JWT认证中间件
 */
function authMiddleware(req, res, next) {
  try {
    // 从请求头获取token
    const authHeader = req.headers['authorization'];
    
    console.log('认证头:', authHeader ? '已提供' : '未提供');
    
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      console.log('请求中未找到 token');
      return res.status(401).json({
        code: 401,
        message: '未登录，请先登录'
      });
    }

    console.log('收到 token:', token.substring(0, 20) + '...');

    // 验证token
    jwt.verify(token, JWT_SECRET, (err, decoded) => {
      if (err) {
        console.log('Token 验证失败:', err.message);
        return res.status(403).json({
          code: 403,
          message: '登录已过期，请重新登录'
        });
      }
      
      console.log('Token 验证成功，用户:', decoded.username);
      
      // 将用户信息附加到请求对象
      req.user = decoded;
      next();
    });
  } catch (error) {
    console.error('认证中间件错误:', error);
    return res.status(500).json({
      code: 500,
      message: '服务器错误'
    });
  }
}

/**
 * 生成JWT Token
 */
function generateToken(user) {
  return jwt.sign(
    { id: user.id, username: user.username },
    JWT_SECRET,
    { expiresIn: '7d' } // 7天过期
  );
}

module.exports = {
  authMiddleware,
  generateToken
};
