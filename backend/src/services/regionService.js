const pool = require('../config/db');

function mapRegion(row) {
  if (!row) return null;
  return {
    code: row.code,
    parentCode: row.parent_code,
    level: row.level,
    name: row.name,
    fullName: row.full_name || row.name,
    pinyin: row.pinyin || '',
    shortPinyin: row.short_pinyin || '',
    longitude: row.longitude === null || row.longitude === undefined ? null : Number(row.longitude),
    latitude: row.latitude === null || row.latitude === undefined ? null : Number(row.latitude),
    timezoneName: row.timezone_name || '北京时间',
    gmtOffsetMinutes: row.gmt_offset_minutes ?? 480,
  };
}

exports.getChildren = async (parentCode = null) => {
  const params = [];
  let where = 'parent_code IS NULL';

  if (parentCode && parentCode !== 'null') {
    where = 'parent_code = ?';
    params.push(parentCode);
  }

  const [rows] = await pool.query(
    `SELECT code, parent_code, level, name, full_name, pinyin, short_pinyin,
            longitude, latitude, timezone_name, gmt_offset_minutes
     FROM region
     WHERE ${where}
     ORDER BY sort_order ASC, code ASC`,
    params
  );

  return rows.map(mapRegion);
};

exports.search = async (keyword) => {
  const q = String(keyword || '').trim();
  if (!q) return [];

  const like = `%${q}%`;
  const [rows] = await pool.query(
    `SELECT r.code, r.parent_code, r.level, r.name, r.full_name, r.pinyin, r.short_pinyin,
            r.longitude, r.latitude, r.timezone_name, r.gmt_offset_minutes,
            p.code AS province_code, p.name AS province_name,
            c.code AS city_code, c.name AS city_name
     FROM region r
     LEFT JOIN region c ON r.level = 3 AND r.parent_code = c.code
     LEFT JOIN region p ON (r.level = 3 AND c.parent_code = p.code)
                         OR (r.level = 2 AND r.parent_code = p.code)
     WHERE r.name LIKE ?
        OR r.full_name LIKE ?
        OR r.pinyin LIKE ?
        OR r.short_pinyin LIKE ?
     ORDER BY r.level DESC, r.sort_order ASC, r.code ASC
     LIMIT 50`,
    [like, like, like, like]
  );

  return rows.map(row => {
    const item = mapRegion(row);
    const provinceCode = row.province_code || (row.level === 1 ? row.code : '');
    const provinceName = row.province_name || (row.level === 1 ? row.name : '');
    const cityCode = row.city_code || (row.level === 2 ? row.code : '');
    const cityName = row.city_name || (row.level === 2 ? row.name : '');
    
    // 构建完整路径显示
    let displayPath = '';
    if (row.level === 1) {
      displayPath = row.name;
    } else if (row.level === 2) {
      displayPath = `${provinceName} / ${row.name}`;
    } else {
      displayPath = `${provinceName} / ${cityName} / ${row.name}`;
    }
    
    return {
      ...item,
      provinceCode,
      provinceName,
      cityCode,
      cityName,
      displayPath,
    };
  });
};

exports.getByCode = async (code) => {
  const [rows] = await pool.query(
    `SELECT code, parent_code, level, name, full_name, pinyin, short_pinyin,
            longitude, latitude, timezone_name, gmt_offset_minutes
     FROM region
     WHERE code = ?
     LIMIT 1`,
    [code]
  );

  return mapRegion(rows[0]);
};
