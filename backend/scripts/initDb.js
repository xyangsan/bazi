const mysql = require('mysql2/promise');
require('dotenv').config();

async function initDatabase() {
  let connection;
  
  try {
    // 先创建数据库连接（不指定数据库）
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      port: process.env.DB_PORT || 3306,
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '123456',
    });

    console.log('数据库连接成功');

    // 创建数据库
    await connection.query(`CREATE DATABASE IF NOT EXISTS \`${process.env.DB_NAME || 'bazi'}\` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`);
    console.log(`数据库 ${process.env.DB_NAME || 'bazi'} 创建成功`);

    // 使用数据库
    await connection.query(`USE \`${process.env.DB_NAME || 'bazi'}\``);

    // 创建用户表
    await connection.query(`
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
    console.log('用户表创建成功');

    // 创建排盘记录表
    await connection.query(`
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
    console.log('排盘记录表创建成功');

    console.log('数据库初始化完成！');
  } catch (error) {
    console.error('数据库初始化失败:', error);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

initDatabase();
