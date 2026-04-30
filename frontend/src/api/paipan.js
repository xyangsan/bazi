import request from './request'

/**
 * 八字排盘计算
 */
export function calculatePaipan(data) {
  return request.post('/paipan/calculate', data)
}

/**
 * 保存排盘记录（需要登录）
 */
export function savePaipan(data) {
  return request.post('/paipan/save', data)
}

/**
 * 获取当前用户的排盘记录列表（需要登录）
 */
export function getPaipanRecords() {
  return request.get('/paipan/records')
}

/**
 * 获取排盘详情
 */
export function getPaipanDetail(id) {
  return request.get(`/paipan/detail/${id}`)
}

/**
 * 获取大运列表
 */
export function getDayun(id, params) {
  return request.get(`/paipan/dayun/${id}`, { params })
}

/**
 * 获取流年列表
 */
export function getLiunian(id, params) {
  return request.get(`/paipan/liunian/${id}`, { params })
}

/**
 * 获取流月列表
 */
export function getLiuyue(id, params) {
  return request.get(`/paipan/liuyue/${id}`, { params })
}

/**
 * 获取流日列表
 */
export function getLiuri(id, params) {
  return request.get(`/paipan/liuri/${id}`, { params })
}

/**
 * 获取流时列表
 */
export function getLiushi(id, params) {
  return request.get(`/paipan/liushi/${id}`, { params })
}
