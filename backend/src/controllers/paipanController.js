const paipanService = require('../services/paipanService');

/**
 * 八字排盘计算
 * POST /api/paipan/calculate
 * body: { name, gender, birthDate, birthTime, birthPlace }
 */
exports.calculate = async (req, res) => {
  try {
    const {
      name,
      gender,
      birthDate,
      birthTime,
      birthPlace,
      regionCode,
      regionName,
      longitude,
      latitude,
      timezoneName,
      gmtOffsetMinutes,
    } = req.body;
    if (!birthDate || !birthTime || !gender) {
      return res.status(400).json({ code: 400, msg: '缺少必要参数' });
    }
    const result = await paipanService.calculate({
      name,
      gender,
      birthDate,
      birthTime,
      birthPlace,
      regionCode,
      regionName,
      longitude,
      latitude,
      timezoneName,
      gmtOffsetMinutes,
    });
    res.json({ code: 0, data: result });
  } catch (err) {
    console.error('排盘计算失败:', err);
    res.status(500).json({ code: 500, msg: '排盘计算失败' });
  }
};

/**
 * 保存排盘记录
 * POST /api/paipan/save
 * body: { name, gender, birthDate, birthTime, birthPlace, result }
 * 需要认证
 */
exports.save = async (req, res) => {
  try {
    const userId = req.user.id; // 从认证中间件获取
    const {
      name,
      gender,
      birthDate,
      birthTime,
      birthPlace,
      regionCode,
      regionName,
      longitude,
      latitude,
      timezoneName,
      gmtOffsetMinutes,
    } = req.body;
    
    if (!birthDate || !birthTime || !gender) {
      return res.json({ code: 400, message: '缺少必要参数' });
    }

    // 重新计算排盘结果（确保数据一致性）
    const result = await paipanService.calculate({
      name,
      gender,
      birthDate,
      birthTime,
      birthPlace,
      regionCode,
      regionName,
      longitude,
      latitude,
      timezoneName,
      gmtOffsetMinutes,
    });
    
    // 保存到数据库
    const recordId = await paipanService.saveRecord(userId, 
      { name, gender, birthDate, birthTime, birthPlace, regionCode, regionName, longitude, latitude, timezoneName, gmtOffsetMinutes }, 
      result
    );

    res.json({
      code: 0,
      message: '保存成功',
      data: { id: recordId }
    });
  } catch (err) {
    console.error('保存排盘失败:', err);
    res.json({ code: 500, message: err.message || '保存失败' });
  }
};

/**
 * 获取当前用户的排盘记录列表
 * GET /api/paipan/records
 * 需要认证
 */
exports.getRecords = async (req, res) => {
  try {
    const userId = req.user.id;
    const records = await paipanService.getRecordsByUserId(userId);
    res.json({ code: 0, data: records });
  } catch (err) {
    console.error('获取记录失败:', err);
    res.json({ code: 500, message: '获取记录失败' });
  }
};

/**
 * 获取排盘详情
 */
exports.getDetail = async (req, res) => {
  try {
    const result = await paipanService.getDetail(req.params.id);
    res.json({ code: 0, data: result });
  } catch (err) {
    console.error('获取详情失败:', err);
    res.status(500).json({ code: 500, msg: '获取详情失败' });
  }
};

/**
 * 大运列表
 */
exports.getDayun = async (req, res) => {
  try {
    const result = await paipanService.getDayun(req.params.id, req.query);
    res.json({ code: 0, data: result });
  } catch (err) {
    console.error('获取大运失败:', err);
    res.status(500).json({ code: 500, msg: '获取大运失败' });
  }
};

/**
 * 流年列表
 */
exports.getLiunian = async (req, res) => {
  try {
    const result = await paipanService.getLiunian(req.params.id, req.query);
    res.json({ code: 0, data: result });
  } catch (err) {
    console.error('获取流年失败:', err);
    res.status(500).json({ code: 500, msg: '获取流年失败' });
  }
};

/**
 * 流月列表
 */
exports.getLiuyue = async (req, res) => {
  try {
    const result = await paipanService.getLiuyue(req.params.id, req.query);
    res.json({ code: 0, data: result });
  } catch (err) {
    console.error('获取流月失败:', err);
    res.status(500).json({ code: 500, msg: '获取流月失败' });
  }
};

/**
 * 流日列表
 */
exports.getLiuri = async (req, res) => {
  try {
    const result = await paipanService.getLiuri(req.params.id, req.query);
    res.json({ code: 0, data: result });
  } catch (err) {
    console.error('获取流日失败:', err);
    res.status(500).json({ code: 500, msg: '获取流日失败' });
  }
};

/**
 * 流时列表
 */
exports.getLiushi = async (req, res) => {
  try {
    const result = await paipanService.getLiushi(req.params.id, req.query);
    res.json({ code: 0, data: result });
  } catch (err) {
    console.error('获取流时失败:', err);
    res.status(500).json({ code: 500, msg: '获取流时失败' });
  }
};
