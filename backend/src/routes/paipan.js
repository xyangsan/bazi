const express = require('express');
const router = express.Router();
const paipanController = require('../controllers/paipanController');
const { authMiddleware } = require('../middleware/auth');

// 排盘接口（不需要认证）
router.post('/calculate', paipanController.calculate);

// 保存排盘记录（需要认证）
router.post('/save', authMiddleware, paipanController.save);

// 获取当前用户的排盘记录列表（需要认证）
router.get('/records', authMiddleware, paipanController.getRecords);

// 获取排盘详情（专业细盘）
router.get('/detail/:id', paipanController.getDetail);

// 大运列表
router.get('/dayun/:id', paipanController.getDayun);

// 流年列表
router.get('/liunian/:id', paipanController.getLiunian);

// 流月列表
router.get('/liuyue/:id', paipanController.getLiuyue);

// 流日列表
router.get('/liuri/:id', paipanController.getLiuri);

// 流时列表
router.get('/liushi/:id', paipanController.getLiushi);

module.exports = router;
