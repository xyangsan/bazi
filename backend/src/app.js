const express = require('express');
const cors = require('cors');
require('dotenv').config();

const paipanRoute = require('./routes/paipan');
const userRoute = require('./routes/user');
const regionRoute = require('./routes/region');
const pool = require('./config/db');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 路由
app.use('/api/user', userRoute);
app.use('/api/paipan', paipanRoute);
app.use('/api/region', regionRoute);

// 健康检查
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: Date.now() });
});

/**
 * 初始化数据库表
 */
async function initDatabase() {
  try {
    // 创建用户表
    await pool.query(`
      CREATE TABLE IF NOT EXISTS \`user\` (
        \`id\` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
        \`username\` VARCHAR(50) NOT NULL COMMENT '用户名',
        \`password\` VARCHAR(255) NOT NULL COMMENT '密码(加密)',
        \`nickname\` VARCHAR(50) DEFAULT NULL COMMENT '昵称',
        \`created_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        \`updated_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        PRIMARY KEY (\`id\`),
        UNIQUE KEY \`uk_username\` (\`username\`)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='用户表'
    `);
    console.log('用户表 检查/创建成功');

    // 创建排盘记录表
    await pool.query(`
      CREATE TABLE IF NOT EXISTS \`paipan_record\` (
        \`id\` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
        \`user_id\` BIGINT UNSIGNED DEFAULT NULL COMMENT '用户ID',
        \`is_public\` TINYINT(1) DEFAULT 0 COMMENT '是否公开 0私有 1公开',
        \`name\` VARCHAR(50) DEFAULT NULL COMMENT '姓名',
        \`gender\` TINYINT NOT NULL COMMENT '性别 1男 2女',
        \`birth_date\` DATE NOT NULL COMMENT '公历出生日期',
        \`birth_time\` TINYINT NOT NULL COMMENT '出生时辰(0-23)',
        \`birth_place\` VARCHAR(100) DEFAULT NULL COMMENT '出生地',
        \`lunar_year\` INT DEFAULT NULL COMMENT '农历年',
        \`lunar_month\` INT DEFAULT NULL COMMENT '农历月',
        \`lunar_day\` INT DEFAULT NULL COMMENT '农历日',
        \`lunar_is_leap\` TINYINT(1) DEFAULT 0 COMMENT '是否闰月',
        \`year_gan\` VARCHAR(2) NOT NULL COMMENT '年干',
        \`year_zhi\` VARCHAR(2) NOT NULL COMMENT '年支',
        \`month_gan\` VARCHAR(2) NOT NULL COMMENT '月干',
        \`month_zhi\` VARCHAR(2) NOT NULL COMMENT '月支',
        \`day_gan\` VARCHAR(2) NOT NULL COMMENT '日干',
        \`day_zhi\` VARCHAR(2) NOT NULL COMMENT '日支',
        \`hour_gan\` VARCHAR(2) NOT NULL COMMENT '时干',
        \`hour_zhi\` VARCHAR(2) NOT NULL COMMENT '时支',
        \`result_json\` JSON DEFAULT NULL COMMENT '完整排盘结果JSON',
        \`created_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        \`updated_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        PRIMARY KEY (\`id\`),
        INDEX \`idx_user_id\` (\`user_id\`),
        INDEX \`idx_birth_date\` (\`birth_date\`),
        INDEX \`idx_name\` (\`name\`),
        FOREIGN KEY (\`user_id\`) REFERENCES \`user\`(\`id\`) ON DELETE SET NULL
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='排盘记录表'
    `);
    console.log('排盘记录表 检查/创建成功');

    await pool.query(`
      CREATE TABLE IF NOT EXISTS \`region\` (
        \`code\` VARCHAR(12) NOT NULL COMMENT '行政区划代码',
        \`parent_code\` VARCHAR(12) DEFAULT NULL COMMENT '上级区域代码',
        \`level\` TINYINT NOT NULL COMMENT '层级 1省 2市 3区县',
        \`name\` VARCHAR(50) NOT NULL COMMENT '区域名称',
        \`full_name\` VARCHAR(150) DEFAULT NULL COMMENT '完整名称',
        \`pinyin\` VARCHAR(160) DEFAULT NULL COMMENT '拼音',
        \`short_pinyin\` VARCHAR(60) DEFAULT NULL COMMENT '拼音首字母',
        \`longitude\` DECIMAL(10,6) DEFAULT NULL COMMENT '经度',
        \`latitude\` DECIMAL(10,6) DEFAULT NULL COMMENT '纬度',
        \`timezone_name\` VARCHAR(30) DEFAULT '北京时间' COMMENT '时区名称',
        \`gmt_offset_minutes\` SMALLINT DEFAULT 480 COMMENT 'GMT偏移分钟',
        \`sort_order\` INT DEFAULT 0 COMMENT '排序',
        PRIMARY KEY (\`code\`),
        KEY \`idx_parent_code\` (\`parent_code\`),
        KEY \`idx_name\` (\`name\`),
        KEY \`idx_pinyin\` (\`pinyin\`),
        KEY \`idx_short_pinyin\` (\`short_pinyin\`)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='国内行政区域表'
    `);
    console.log('区域表 检查/创建成功');
  } catch (error) {
    console.error('数据库初始化失败:', error.message);
    console.log('请确保MySQL服务已启动，并且数据库配置正确');
  }
}

// 启动服务
app.listen(PORT, async () => {
  console.log(`八字排盘服务已启动: http://localhost:${PORT}`);
  // 初始化数据库表
  await initDatabase();
});
