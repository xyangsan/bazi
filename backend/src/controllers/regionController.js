const regionService = require('../services/regionService');

exports.children = async (req, res) => {
  try {
    const list = await regionService.getChildren(req.query.parentCode || null);
    res.json({ code: 0, data: list });
  } catch (err) {
    console.error('获取区域列表失败:', err);
    res.json({ code: 500, message: '获取区域列表失败' });
  }
};

exports.search = async (req, res) => {
  try {
    const list = await regionService.search(req.query.q || '');
    res.json({ code: 0, data: list });
  } catch (err) {
    console.error('搜索区域失败:', err);
    res.json({ code: 500, message: '搜索区域失败' });
  }
};

exports.detail = async (req, res) => {
  try {
    const region = await regionService.getByCode(req.params.code);
    res.json({ code: 0, data: region });
  } catch (err) {
    console.error('获取区域详情失败:', err);
    res.json({ code: 500, message: '获取区域详情失败' });
  }
};
