const {
  solarToLunar,
  getBazi,
  getDayun,
  getLiunian,
  getLiuyue,
  getLiuri,
  getLiushi,
  getShishen,
  getCanggan,
  getNayin,
  getShensha,
  getXingyun,
  getZizuo,
  getKongwang,
} = require('../utils/bazi');
const pool = require('../config/db');

/**
 * 八字排盘核心计算
 */
exports.calculate = async ({ name, gender, birthDate, birthTime, birthPlace }) => {
  // 1. 公历转农历
  const lunar = solarToLunar(birthDate);

  // 2. 计算八字（四柱）
  const bazi = getBazi(birthDate, birthTime, gender);

  // 3. 计算十神
  const shishen = getShishen(bazi);

  // 4. 计算藏干
  const canggan = getCanggan(bazi);

  // 5. 计算纳音
  const nayin = getNayin(bazi);

  // 6. 计算神煞
  const shensha = getShensha(bazi);

  // 7. 计算星运
  const xingyun = getXingyun(bazi);

  // 8. 计算自坐
  const zizuo = getZizuo(bazi);

  // 9. 计算空亡
  const kongwang = getKongwang(bazi);

  // 10. 计算大运
  const dayun = getDayun(bazi, gender, birthDate, birthTime);

  const result = {
    name,
    gender,
    birthDate,
    birthTime,
    birthPlace,
    lunar,
    bazi,
    shishen,
    canggan,
    nayin,
    shensha,
    xingyun,
    zizuo,
    kongwang,
    dayun,
  };

  return result;
};

/**
 * 保存排盘记录到数据库
 */
exports.saveRecord = async (userId, inputData, result) => {
  const { name, gender, birthDate, birthTime, birthPlace } = inputData;
  const { lunar, bazi } = result;

  const sql = `
    INSERT INTO paipan_record 
    (user_id, name, gender, birth_date, birth_time, birth_place, 
     lunar_year, lunar_month, lunar_day, lunar_is_leap,
     year_gan, year_zhi, month_gan, month_zhi, 
     day_gan, day_zhi, hour_gan, hour_zhi, result_json)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

  const params = [
    userId || null,
    name || null,
    gender,
    birthDate,
    birthTime,
    birthPlace || null,
    lunar?.lunarYear || null,
    lunar?.lunarMonth || null,
    lunar?.lunarDay || null,
    lunar?.isLeap ? 1 : 0,
    bazi?.year?.gan || '',
    bazi?.year?.zhi || '',
    bazi?.month?.gan || '',
    bazi?.month?.zhi || '',
    bazi?.day?.gan || '',
    bazi?.day?.zhi || '',
    bazi?.hour?.gan || '',
    bazi?.hour?.zhi || '',
    JSON.stringify(result)
  ];

  const [resultSet] = await pool.query(sql, params);
  return resultSet.insertId;
};

/**
 * 获取用户的排盘记录列表
 */
exports.getRecordsByUserId = async (userId) => {
  const [rows] = await pool.query(
    `SELECT id, name, gender, birth_date, birth_time, 
     year_gan, year_zhi, month_gan, month_zhi, day_gan, day_zhi, hour_gan, hour_zhi,
     created_at 
     FROM paipan_record 
     WHERE user_id = ? 
     ORDER BY created_at DESC 
     LIMIT 100`,
    [userId]
  );
  return rows;
};

/**
 * 获取排盘详情
 */
exports.getDetail = async (id) => {
  // TODO: 从数据库获取历史排盘记录
  return {};
};

/**
 * 获取大运列表
 */
exports.getDayun = async (id, query) => {
  // TODO: 计算指定排盘的大运列表
  return [];
};

/**
 * 获取流年列表
 */
exports.getLiunian = async (id, query) => {
  // TODO: 计算指定大运下的流年列表
  return [];
};

/**
 * 获取流月列表
 */
exports.getLiuyue = async (id, query) => {
  // TODO: 计算指定流年下的流月列表
  return [];
};

/**
 * 获取流日列表
 */
exports.getLiuri = async (id, query) => {
  // TODO: 计算指定流月下的流日列表
  return [];
};

/**
 * 获取流时列表
 */
exports.getLiushi = async (id, query) => {
  // TODO: 计算指定流日下的流时列表
  return [];
};
