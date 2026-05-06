import request from './request'

export function getRegionChildren(parentCode) {
  return request.get('/region/children', { params: { parentCode } })
}

export function searchRegions(q) {
  return request.get('/region/search', { params: { q } })
}
