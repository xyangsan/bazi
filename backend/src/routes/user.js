const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { authMiddleware } = require('../middleware/auth');

// 用户注册
router.post('/register', userController.register);

// 用户登录
router.post('/login', userController.login);

// 获取当前登录用户信息（需要认证）
router.get('/profile', authMiddleware, userController.getProfile);

module.exports = router;
