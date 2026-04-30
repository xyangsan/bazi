const pool = require('../config/db');

const User = {
  /**
   * 根据用户名查找用户
   */
  async findByUsername(username) {
    const [rows] = await pool.query(
      'SELECT * FROM `user` WHERE `username` = ? LIMIT 1',
      [username]
    );
    return rows[0] || null;
  },

  /**
   * 根据ID查找用户
   */
  async findById(id) {
    const [rows] = await pool.query(
      'SELECT id, username, nickname, created_at FROM `user` WHERE `id` = ? LIMIT 1',
      [id]
    );
    return rows[0] || null;
  },

  /**
   * 创建用户
   */
  async create(userData) {
    const { username, password, nickname } = userData;
    const [result] = await pool.query(
      'INSERT INTO `user` (`username`, `password`, `nickname`) VALUES (?, ?, ?)',
      [username, password, nickname || null]
    );
    return result.insertId;
  },

  /**
   * 更新用户信息
   */
  async update(id, userData) {
    const { nickname } = userData;
    await pool.query(
      'UPDATE `user` SET `nickname` = ? WHERE `id` = ?',
      [nickname, id]
    );
  }
};

module.exports = User;
