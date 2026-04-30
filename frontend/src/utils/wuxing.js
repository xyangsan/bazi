/**
 * 五行相关工具函数
 */

const WU_XING_CLASS = {
  '木': 'wood-color',
  '火': 'fire-color',
  '土': 'soil-color',
  '金': 'gold-color',
  '水': 'water-color',
}

const TIAN_GAN_WU_XING = {
  '甲': '木',
  '乙': '木',
  '丙': '火',
  '丁': '火',
  '戊': '土',
  '己': '土',
  '庚': '金',
  '辛': '金',
  '壬': '水',
  '癸': '水',
}

const DI_ZHI_WU_XING = {
  '子': '水',
  '丑': '土',
  '寅': '木',
  '卯': '木',
  '辰': '土',
  '巳': '火',
  '午': '火',
  '未': '土',
  '申': '金',
  '酉': '金',
  '戌': '土',
  '亥': '水',
}

const WU_XING_ICON = {
  '木': 'wood.png',
  '火': 'fire.png',
  '土': 'soil.png',
  '金': 'gold.png',
  '水': 'water.png',
}

/**
 * 获取五行图标路径
 */
export function getWuxingIcon(wuxing) {
  return `/src/assets/images/${WU_XING_ICON[wuxing] || ''}`
}

/**
 * 获取五行颜色class
 */
export function getWuxingColorClass(wuxing) {
  return WU_XING_CLASS[wuxing] || ''
}

/**
 * 获取天干五行
 */
export function getGanWuxing(gan) {
  return TIAN_GAN_WU_XING[gan] || ''
}

/**
 * 获取地支五行
 */
export function getZhiWuxing(zhi) {
  return DI_ZHI_WU_XING[zhi] || ''
}
