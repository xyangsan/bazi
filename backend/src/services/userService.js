const User = require('../models/user');
const bcrypt = require('bcryptjs');

const userService = {
  /**
   * 用户注册
   */
  async register(username, password, nickname) {
    // 检查用户名是否已存在
    const existingUser = await User.findByUsername(username);
    if (existingUser) {
      throw new Error('用户名已存在');
    }

    // 加密密码
    const salt = bcrypt.genSaltSync(10);
    const hashedPassword = bcrypt.hashSync(password, salt);

    // 创建用户
    const userId = await User.create({
      username,
      password: hashedPassword,
      nickname: nickname || username
    });

    return { id: userId, username, nickname: nickname || username };
  },

  /**
   * 用户登录
   */
  async login(username, password) {
    // 查找用户
    const user = await User.findByUsername(username);
    if (!user) {
      throw new Error('用户不存在');
    }

    // 验证密码
    const isPasswordValid = bcrypt.compareSync(password, user.password);
    if (!isPasswordValid) {
      throw new Error('密码错误');
    }

    return {
      id: user.id,
      username: user.username,
      nickname: user.nickname
    };
  },

  /**
   * 获取用户信息
   */
  async getUserInfo(id) {
    const user = await User.findById(id);
    if (!user) {
      throw new Error('用户不存在');
    }
    return user;
  }
};

module.exports = userService;
