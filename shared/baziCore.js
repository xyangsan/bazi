/**
 * 八字排盘核心算法 - 共享模块（CommonJS格式）
 * 前后端共用，确保计算一致性
 */

// ==================== 基础数据 ====================

// 天干
const TIAN_GAN = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸'];

// 地支
const DI_ZHI = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'];

// 五行映射 - 天干
const TIAN_GAN_WU_XING = {
  '甲': '木', '乙': '木',
  '丙': '火', '丁': '火',
  '戊': '土', '己': '土',
  '庚': '金', '辛': '金',
  '壬': '水', '癸': '水',
};

// 五行映射 - 地支
const DI_ZHI_WU_XING = {
  '子': '水', '丑': '土', '寅': '木', '卯': '木',
  '辰': '土', '巳': '火', '午': '火', '未': '土',
  '申': '金', '酉': '金', '戌': '土', '亥': '水',
};

// 五行颜色class
const WU_XING_CLASS = {
  '木': 'wood-color',
  '火': 'fire-color',
  '土': 'soil-color',
  '金': 'gold-color',
  '水': 'water-color',
};

// 地支藏干表
const DI_ZHI_CANG_GAN = {
  '子': ['癸'],
  '丑': ['己', '癸', '辛'],
  '寅': ['甲', '丙', '戊'],
  '卯': ['乙'],
  '辰': ['戊', '乙', '癸'],
  '巳': ['丙', '庚', '戊'],
  '午': ['丁', '己'],
  '未': ['己', '丁', '乙'],
  '申': ['庚', '壬', '戊'],
  '酉': ['辛'],
  '戌': ['戊', '辛', '丁'],
  '亥': ['壬', '甲'],
};

// 纳音表（六十甲子纳音）
const NA_YIN = [
  '海中金', '海中金', '炉中火', '炉中火', '大林木', '大林木',
  '路旁土', '路旁土', '剑锋金', '剑锋金', '山头火', '山头火',
  '涧下水', '涧下水', '城头土', '城头土', '白蜡金', '白蜡金',
  '杨柳木', '杨柳木', '泉中水', '泉中水', '屋上土', '屋上土',
  '霹雳火', '霹雳火', '松柏木', '松柏木', '长流水', '长流水',
  '砂石金', '砂石金', '山下火', '山下火', '平地木', '平地木',
  '壁上土', '壁上土', '金箔金', '金箔金', '覆灯火', '覆灯火',
  '天河水', '天河水', '大驿土', '大驿土', '钗环金', '钗环金',
  '桑柘木', '桑柘木', '大溪水', '大溪水', '沙中土', '沙中土',
  '天上火', '天上火', '石榴木', '石榴木', '大海水', '大海水',
];

// 十神关系矩阵
const SHI_SHEN_MAP = {
  '甲': { '甲': '比肩', '乙': '劫财', '丙': '食神', '丁': '伤官', '戊': '偏财', '己': '正财', '庚': '七杀', '辛': '正官', '壬': '偏印', '癸': '正印' },
  '乙': { '甲': '劫财', '乙': '比肩', '丙': '伤官', '丁': '食神', '戊': '正财', '己': '偏财', '庚': '正官', '辛': '七杀', '壬': '正印', '癸': '偏印' },
  '丙': { '甲': '偏印', '乙': '正印', '丙': '比肩', '丁': '劫财', '戊': '食神', '己': '伤官', '庚': '偏财', '辛': '正财', '壬': '七杀', '癸': '正官' },
  '丁': { '甲': '正印', '乙': '偏印', '丙': '劫财', '丁': '比肩', '戊': '伤官', '己': '食神', '庚': '正财', '辛': '偏财', '壬': '正官', '癸': '七杀' },
  '戊': { '甲': '七杀', '乙': '正官', '丙': '偏印', '丁': '正印', '戊': '比肩', '己': '劫财', '庚': '食神', '辛': '伤官', '壬': '偏财', '癸': '正财' },
  '己': { '甲': '正官', '乙': '七杀', '丙': '正印', '丁': '偏印', '戊': '劫财', '己': '比肩', '庚': '伤官', '辛': '食神', '壬': '正财', '癸': '偏财' },
  '庚': { '甲': '偏财', '乙': '正财', '丙': '七杀', '丁': '正官', '戊': '偏印', '己': '正印', '庚': '比肩', '辛': '劫财', '壬': '食神', '癸': '伤官' },
  '辛': { '甲': '正财', '乙': '偏财', '丙': '正官', '丁': '七杀', '戊': '正印', '己': '偏印', '庚': '劫财', '辛': '比肩', '壬': '伤官', '癸': '食神' },
  '壬': { '甲': '食神', '乙': '伤官', '丙': '偏财', '丁': '正财', '戊': '七杀', '己': '正官', '庚': '偏印', '辛': '正印', '壬': '比肩', '癸': '劫财' },
  '癸': { '甲': '伤官', '乙': '食神', '丙': '正财', '丁': '偏财', '戊': '正官', '己': '七杀', '庚': '正印', '辛': '偏印', '壬': '劫财', '癸': '比肩' },
};

// 十二长生状态
const SHI_ER_CHANG_SHENG = ['长生', '沐浴', '冠带', '临官', '帝旺', '衰', '病', '死', '墓', '绝', '胎', '养'];

// 地支顺序
const DI_ZHI_ORDER = {
  '子': 1, '丑': 2, '寅': 3, '卯': 4, '辰': 5, '巳': 6,
  '午': 7, '未': 8, '申': 9, '酉': 10, '戌': 11, '亥': 12,
};

// 天干长生地支
const TIAN_GAN_CHANG_SHENG = {
  '甲': '亥', '乙': '午', '丙': '寅', '丁': '酉', '戊': '寅',
  '己': '酉', '庚': '巳', '辛': '子', '壬': '申', '癸': '卯',
};

// ==================== 计算函数 ====================

/**
 * 计算十神
 */
function getShishen(dayMaster, gan) {
  return SHI_SHEN_MAP[dayMaster]?.[gan] || '';
}

/**
 * 计算十神（完整对象）
 */
function calculateShishen(bazi) {
  const dayMaster = bazi.dayMaster;
  const pillars = ['yearPillar', 'monthPillar', 'dayPillar', 'hourPillar'];
  
  const result = {};
  pillars.forEach(p => {
    const pillar = bazi[p];
    result[p] = {
      ganShishen: SHI_SHEN_MAP[dayMaster][pillar.gan],
      zhiShishen: DI_ZHI_CANG_GAN[pillar.zhi].map(cg => ({
        gan: cg,
        shishen: SHI_SHEN_MAP[dayMaster][cg],
      })),
    };
  });
  
  return result;
}

/**
 * 计算藏干
 */
function calculateCanggan(bazi) {
  const pillars = ['yearPillar', 'monthPillar', 'dayPillar', 'hourPillar'];
  const result = {};
  
  pillars.forEach(p => {
    const zhi = bazi[p].zhi;
    result[p] = DI_ZHI_CANG_GAN[zhi].map(gan => ({
      gan,
      wuxing: TIAN_GAN_WU_XING[gan],
    }));
  });
  
  return result;
}

/**
 * 计算纳音
 */
function calculateNayin(bazi) {
  const pillars = ['yearPillar', 'monthPillar', 'dayPillar', 'hourPillar'];
  const result = {};
  
  pillars.forEach(p => {
    const pillar = bazi[p];
    const ganIndex = TIAN_GAN.indexOf(pillar.gan);
    const zhiIndex = DI_ZHI.indexOf(pillar.zhi);
    const nayinIndex = ganIndex % 5 * 12 + Math.floor(zhiIndex / 2) * 2;
    result[p] = nayinIndex < NA_YIN.length ? NA_YIN[nayinIndex] : '';
  });
  
  return result;
}

/**
 * 计算空亡（旬空）
 */
function calculateKongwang(bazi) {
  const dayGanIndex = TIAN_GAN.indexOf(bazi.dayPillar.gan);
  const dayZhiIndex = DI_ZHI.indexOf(bazi.dayPillar.zhi);
  const xunIndex = (dayGanIndex - dayZhiIndex + 12) % 12;
  const kong1 = DI_ZHI[(xunIndex + 10) % 12];
  const kong2 = DI_ZHI[(xunIndex + 11) % 12];
  
  return { kong1, kong2 };
}

/**
 * 计算星运（十二长生）
 */
function getChangShengStatus(dayGan, zhi) {
  const changShengZhi = TIAN_GAN_CHANG_SHENG[dayGan];
  const changShengIndex = DI_ZHI_ORDER[changShengZhi];
  const currentZhiIndex = DI_ZHI_ORDER[zhi];
  
  // 阳干顺行，阴干逆行
  const isYang = TIAN_GAN.indexOf(dayGan) % 2 === 0;
  let offset;
  
  if (isYang) {
    offset = (currentZhiIndex - changShengIndex + 12) % 12;
  } else {
    offset = (changShengIndex - currentZhiIndex + 12) % 12;
  }
  
  return SHI_ER_CHANG_SHENG[offset];
}

/**
 * 计算星运（完整对象）
 */
function calculateXingyun(bazi) {
  const dayGan = bazi.dayMaster;
  const pillars = ['yearPillar', 'monthPillar', 'dayPillar', 'hourPillar'];
  
  const result = {};
  pillars.forEach(p => {
    const zhi = bazi[p].zhi;
    result[p] = getChangShengStatus(dayGan, zhi);
  });
  
  return result;
}

/**
 * 计算自坐
 */
function calculateZizuo(bazi) {
  const pillars = ['yearPillar', 'monthPillar', 'dayPillar', 'hourPillar'];
  
  const result = {};
  pillars.forEach(p => {
    const gan = bazi[p].gan;
    const zhi = bazi[p].zhi;
    
    // 判断天干是否在地支的藏干中
    const cangGan = DI_ZHI_CANG_GAN[zhi];
    if (cangGan[0] === gan) {
      result[p] = '得禄';
    } else if (cangGan.includes(gan)) {
      result[p] = '余气';
    } else {
      // 计算天干与地支五行的生克关系
      const ganWuxing = TIAN_GAN_WU_XING[gan];
      const zhiWuxing = DI_ZHI_WU_XING[zhi];
      result[p] = ganWuxing + '坐' + zhiWuxing;
    }
  });
  
  return result;
}

/**
 * 计算天乙贵人
 */
function getTianYiGuiRen(dayGan) {
  const guiRen = {
    '甲': ['未', '丑'],
    '戊': ['未', '丑'],
    '庚': ['未', '丑'],
    '乙': ['子', '申'],
    '己': ['子', '申'],
    '丙': ['亥', '酉'],
    '丁': ['亥', '酉'],
    '壬': ['卯', '巳'],
    '癸': ['卯', '巳'],
    '辛': ['寅', '午'],
  };
  return guiRen[dayGan] || [];
}

/**
 * 计算文昌贵人
 */
function getWenChangGuiRen(dayGan) {
  const wenChang = {
    '甲': '巳', '乙': '午', '丙': '申', '丁': '酉', '戊': '申',
    '己': '酉', '庚': '亥', '辛': '子', '壬': '寅', '癸': '卯',
  };
  return wenChang[dayGan] || '';
}

/**
 * 计算桃花
 */
function getTaoHua(dayZhi) {
  const taoHua = {
    '亥': '子', '卯': '子', '未': '子',
    '巳': '午', '酉': '午', '丑': '午',
    '寅': '卯', '午': '卯', '戌': '卯',
    '申': '酉', '子': '酉', '辰': '酉',
  };
  return taoHua[dayZhi] || '';
}

/**
 * 计算驿马
 */
function getYiMa(dayZhi) {
  const yiMa = {
    '申': '寅', '子': '寅', '辰': '寅',
    '亥': '巳', '卯': '巳', '未': '巳',
    '寅': '申', '午': '申', '戌': '申',
    '巳': '亥', '酉': '亥', '丑': '亥',
  };
  return yiMa[dayZhi] || '';
}

/**
 * 计算华盖
 */
function getHuaGai(dayZhi) {
  const huaGai = {
    '寅': '戌', '午': '戌', '戌': '戌',
    '亥': '未', '卯': '未', '未': '未',
    '申': '辰', '子': '辰', '辰': '辰',
    '巳': '丑', '酉': '丑', '丑': '丑',
  };
  return huaGai[dayZhi] || '';
}

/**
 * 计算神煞
 */
function calculateShensha(bazi) {
  const dayGan = bazi.dayMaster;
  const dayZhi = bazi.dayPillar.zhi;
  const pillars = ['yearPillar', 'monthPillar', 'dayPillar', 'hourPillar'];
  
  // 计算各种神煞
  const tianYi = getTianYiGuiRen(dayGan);
  const wenChang = getWenChangGuiRen(dayGan);
  const taoHua = getTaoHua(dayZhi);
  const yiMa = getYiMa(dayZhi);
  const huaGai = getHuaGai(dayZhi);
  
  const result = {};
  pillars.forEach(p => {
    const zhi = bazi[p].zhi;
    const shenshaList = [];
    
    // 天乙贵人
    if (tianYi.includes(zhi)) {
      shenshaList.push('天乙贵人');
    }
    
    // 文昌贵人（只看日柱）
    if (p === 'dayPillar' && zhi === wenChang) {
      shenshaList.push('文昌贵人');
    }
    
    // 桃花
    if (zhi === taoHua) {
      shenshaList.push('桃花');
    }
    
    // 驿马
    if (zhi === yiMa) {
      shenshaList.push('驿马');
    }
    
    // 华盖
    if (zhi === huaGai) {
      shenshaList.push('华盖');
    }
    
    result[p] = shenshaList;
  });
  
  return result;
}

/**
 * 计算大运干支
 */
function getDayunPillar(monthGan, monthZhi, offset) {
  const monthGanIndex = TIAN_GAN.indexOf(monthGan);
  const monthZhiIndex = DI_ZHI.indexOf(monthZhi);
  
  const ganIndex = ((monthGanIndex + offset) % 10 + 10) % 10;
  const zhiIndex = ((monthZhiIndex + offset) % 12 + 12) % 12;
  
  return {
    gan: TIAN_GAN[ganIndex],
    zhi: DI_ZHI[zhiIndex],
  };
}

/**
 * 计算五行统计
 */
function calculateWuxingCount(bazi, canggan) {
  const count = {
    '木': 0,
    '火': 0,
    '土': 0,
    '金': 0,
    '水': 0,
  };
  
  // 统计天干五行
  const pillars = ['yearPillar', 'monthPillar', 'dayPillar', 'hourPillar'];
  pillars.forEach(p => {
    const gan = bazi[p].gan;
    const ganWuxing = TIAN_GAN_WU_XING[gan];
    count[ganWuxing]++;
  });
  
  // 统计地支五行
  pillars.forEach(p => {
    const zhi = bazi[p].zhi;
    const zhiWuxing = DI_ZHI_WU_XING[zhi];
    count[zhiWuxing]++;
  });
  
  return count;
}

// ==================== 导出 ====================

module.exports = {
  TIAN_GAN,
  DI_ZHI,
  TIAN_GAN_WU_XING,
  DI_ZHI_WU_XING,
  WU_XING_CLASS,
  DI_ZHI_CANG_GAN,
  NA_YIN,
  SHI_SHEN_MAP,
  SHI_ER_CHANG_SHENG,
  DI_ZHI_ORDER,
  TIAN_GAN_CHANG_SHENG,
  getShishen,
  calculateShishen,
  calculateCanggan,
  calculateNayin,
  calculateKongwang,
  getChangShengStatus,
  calculateXingyun,
  calculateZizuo,
  calculateShensha,
  getDayunPillar,
  calculateWuxingCount,
};
