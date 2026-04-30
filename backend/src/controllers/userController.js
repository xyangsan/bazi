const userService = require('../services/userService');
const { generateToken } = require('../middleware/auth');

const userController = {
  /**
   * 用户注册
   */
  async register(req, res) {
    try {
      const { username, password, nickname } = req.body;

      // 验证参数
      if (!username || !password) {
        return res.json({
          code: 400,
          message: '用户名和密码不能为空'
        });
      }

      if (password.length < 6) {
        return res.json({
          code: 400,
          message: '密码长度不能少于6位'
        });
      }

      // 注册用户
      const user = await userService.register(username, password, nickname);

      // 生成token
      const token = generateToken(user);

      res.json({
        code: 0,
        message: '注册成功',
        data: {
          token,
          user
        }
      });
    } catch (error) {
      console.error('注册失败:', error);
      res.json({
        code: 500,
        message: error.message || '注册失败'
      });
    }
  },

  /**
   * 用户登录
   */
  async login(req, res) {
    try {
      const { username, password } = req.body;

      // 验证参数
      if (!username || !password) {
        return res.json({
          code: 400,
          message: '用户名和密码不能为空'
        });
      }

      // 登录验证
      const user = await userService.login(username, password);

      // 生成token
      const token = generateToken(user);

      res.json({
        code: 0,
        message: '登录成功',
        data: {
          token,
          user
        }
      });
    } catch (error) {
      console.error('登录失败:', error);
      res.json({
        code: 500,
        message: error.message || '登录失败'
      });
    }
  },

  /**
   * 获取当前登录用户信息
   */
  async getProfile(req, res) {
    try {
      const user = await userService.getUserInfo(req.user.id);
      res.json({
        code: 0,
        data: user
      });
    } catch (error) {
      console.error('获取用户信息失败:', error);
      res.json({
        code: 500,
        message: error.message || '获取用户信息失败'
      });
    }
  }
};

module.exports = userController;
