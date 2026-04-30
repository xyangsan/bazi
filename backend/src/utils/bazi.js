/**
 * 八字排盘核心算法模块（后端）
 * 从 shared 模块导入共享逻辑，补充后端特有的功能（如农历转换）
 */

const path = require('path');
const Lunar = require('lunar-javascript').Lunar;

// 从 shared 模块导入（使用绝对路径，需要从 backend/src/utils 返回到项目根目录）
const SHARED_MODULE_PATH = path.resolve(__dirname, '../../../shared/baziCore');
const baziCore = require(SHARED_MODULE_PATH);

const TIAN_GAN = baziCore.TIAN_GAN;
const DI_ZHI = baziCore.DI_ZHI;
const TIAN_GAN_WU_XING = baziCore.TIAN_GAN_WU_XING;
const DI_ZHI_WU_XING = baziCore.DI_ZHI_WU_XING;
const DI_ZHI_CANG_GAN = baziCore.DI_ZHI_CANG_GAN;
const SHI_SHEN_MAP = baziCore.SHI_SHEN_MAP;
const NA_YIN = baziCore.NA_YIN;
const SHI_ER_CHANG_SHENG = baziCore.SHI_ER_CHANG_SHENG;
const DI_ZHI_ORDER = baziCore.DI_ZHI_ORDER;
const TIAN_GAN_CHANG_SHENG = baziCore.TIAN_GAN_CHANG_SHENG;

// 从 shared 模块导入计算函数
const {
  calculateShishen,
  calculateCanggan,
  calculateNayin,
  calculateKongwang,
  calculateXingyun,
  calculateZizuo,
  calculateShensha,
  getDayunPillar,
  calculateWuxingCount,
} = baziCore;

// ==================== 公历转农历（后端特有，使用lunar-javascript库）====================

/**
 * 公历转农历
 * @param {string} solarDate - 公历日期 YYYY-MM-DD
 * @param {number} hour - 小时（0-23）
 */
exports.solarToLunar = function(solarDate, hour = 12) {
  const [year, month, day] = solarDate.split('-').map(Number);
  const lunar = Lunar.fromYmd(year, month, day);
  const lunarMonth = lunar.getMonth();
  const lunarDay = lunar.getDay();
  
  // 获取年月日的干支
  const yearGanZhi = lunar.getYearInGanZhi();
  const monthGanZhi = lunar.getMonthInGanZhi();
  const dayGanZhi = lunar.getDayInGanZhi();
  
  // 时辰干支
  const timeZhi = DI_ZHI[Math.floor((hour + 1) / 2) % 12];
  const dayGan = dayGanZhi.substring(0, 1);
  const dayGanIndex = TIAN_GAN.indexOf(dayGan);
  const timeGanIndex = (dayGanIndex % 5 * 2 + Math.floor((hour + 1) / 2)) % 10;
  const timeGan = TIAN_GAN[timeGanIndex];
  const timeGanZhi = timeGan + timeZhi;
  
  return {
    year: lunar.getYear(),
    month: Math.abs(lunarMonth),
    day: lunarDay,
    lunarYear: lunar.getYearInChinese(),
    lunarMonth: lunar.getMonthInChinese(),
    lunarDay: lunar.getDayInChinese(),
    lunarMonthCn: lunar.getMonthInChinese() + '月',
    lunarDayCn: lunar.getDayInChinese(),
    isLeap: lunarMonth < 0,
    yearGanZhi,
    monthGanZhi,
    dayGanZhi,
    timeGanZhi,
    lunarObj: lunar, // 保留lunar对象供后续使用
  };
};

// ==================== 八字计算 ====================

/**
 * 计算年柱（以立春为界）
 */
function getYearPillar(solarDate, hour) {
  const [year, month, day] = solarDate.split('-').map(Number);
  const lunar = Lunar.fromYmd(year, month, day);
  
  let ganZhiYear;
  if (month > 2 || (month === 2 && day >= 4)) {
    ganZhiYear = lunar.getYearInGanZhi();
  } else {
    const prevLunar = Lunar.fromYmd(year - 1, 6, 15);
    ganZhiYear = prevLunar.getYearInGanZhi();
  }
  
  return {
    gan: ganZhiYear.substring(0, 1),
    zhi: ganZhiYear.substring(1, 2),
  };
}

/**
 * 计算月柱（以节气为界）
 */
function getMonthPillar(solarDate, hour) {
  const [year, month, day] = solarDate.split('-').map(Number);
  const lunar = Lunar.fromYmd(year, month, day);
  const monthGanZhi = lunar.getMonthInGanZhi();
  
  return {
    gan: monthGanZhi.substring(0, 1),
    zhi: monthGanZhi.substring(1, 2),
  };
}

/**
 * 计算日柱
 */
function getDayPillar(solarDate) {
  const [year, month, day] = solarDate.split('-').map(Number);
  const lunar = Lunar.fromYmd(year, month, day);
  const dayGanZhi = lunar.getDayInGanZhi();
  
  return {
    gan: dayGanZhi.substring(0, 1),
    zhi: dayGanZhi.substring(1, 2),
  };
}

/**
 * 计算时柱
 */
function getHourPillar(dayGan, hour) {
  const dayGanIndex = TIAN_GAN.indexOf(dayGan);
  const shiChen = Math.floor((hour + 1) / 2) % 12;
  const hourZhi = DI_ZHI[shiChen];
  const hourGanIndex = (dayGanIndex % 5 * 2 + shiChen) % 10;
  const hourGan = TIAN_GAN[hourGanIndex];
  
  return {
    gan: hourGan,
    zhi: hourZhi,
  };
}

/**
 * 计算八字四柱
 */
exports.getBazi = function(birthDate, birthHour, gender) {
  const yearPillar = getYearPillar(birthDate, birthHour);
  const monthPillar = getMonthPillar(birthDate, birthHour);
  const dayPillar = getDayPillar(birthDate);
  const hourPillar = getHourPillar(dayPillar.gan, birthHour);

  return {
    yearPillar: { 
      gan: yearPillar.gan, 
      zhi: yearPillar.zhi, 
      wuxing: { 
        gan: TIAN_GAN_WU_XING[yearPillar.gan], 
        zhi: DI_ZHI_WU_XING[yearPillar.zhi] 
      } 
    },
    monthPillar: { 
      gan: monthPillar.gan, 
      zhi: monthPillar.zhi, 
      wuxing: { 
        gan: TIAN_GAN_WU_XING[monthPillar.gan], 
        zhi: DI_ZHI_WU_XING[monthPillar.zhi] 
      } 
    },
    dayPillar: { 
      gan: dayPillar.gan, 
      zhi: dayPillar.zhi, 
      wuxing: { 
        gan: TIAN_GAN_WU_XING[dayPillar.gan], 
        zhi: DI_ZHI_WU_XING[dayPillar.zhi] 
      } 
    },
    hourPillar: { 
      gan: hourPillar.gan, 
      zhi: hourPillar.zhi, 
      wuxing: { 
        gan: TIAN_GAN_WU_XING[hourPillar.gan], 
        zhi: DI_ZHI_WU_XING[hourPillar.zhi] 
      } 
    },
    dayMaster: dayPillar.gan,
    gender: gender === 1 ? '男' : '女',
  };
};

// ==================== 使用 shared 模块的函数 ====================

/**
 * 计算十神
 */
exports.getShishen = function(bazi) {
  return calculateShishen(bazi);
};

/**
 * 计算藏干
 */
exports.getCanggan = function(bazi) {
  return calculateCanggan(bazi);
};

/**
 * 计算纳音
 */
exports.getNayin = function(bazi) {
  return calculateNayin(bazi);
};

/**
 * 计算空亡
 */
exports.getKongwang = function(bazi) {
  return calculateKongwang(bazi);
};

/**
 * 计算星运
 */
exports.getXingyun = function(bazi) {
  return calculateXingyun(bazi);
};

/**
 * 计算自坐
 */
exports.getZizuo = function(bazi) {
  return calculateZizuo(bazi);
};

/**
 * 计算神煞
 */
exports.getShensha = function(bazi) {
  return calculateShensha(bazi);
};

// ==================== 大运计算 ====================

/**
 * 计算两个日期之间的天数
 */
function daysBetween(date1, date2) {
  const d1 = new Date(date1);
  const d2 = new Date(date2);
  return Math.floor((d2 - d1) / 86400000);
}

/**
 * 计算起运时间（天数）
 */
function calculateQiYunDays(birthDate, birthHour, forward) {
  const [year, month, day] = birthDate.split('-').map(Number);
  const lunar = Lunar.fromYmd(year, month, day);
  
  let targetJieQi;
  if (forward) {
    targetJieQi = lunar.getNextJie();
  } else {
    targetJieQi = lunar.getPrevJie();
  }
  
  if (!targetJieQi) {
    return 3 * 365;
  }
  
  const targetSolar = targetJieQi.getSolar();
  const jieQiDate = new Date(
    targetSolar.getYear(),
    targetSolar.getMonth() - 1,
    targetSolar.getDay(),
    targetSolar.getHour(),
    targetSolar.getMinute(),
    targetSolar.getSecond()
  );
  const birthDateTime = new Date(year, month - 1, day, birthHour);
  const days = Math.abs(daysBetween(birthDateTime, jieQiDate));
  
  return days;
}

/**
 * 计算大运
 */
exports.getDayun = function(bazi, gender, birthDate, birthHour) {
  const yearGanIndex = TIAN_GAN.indexOf(bazi.yearPillar.gan);
  const isYangYear = yearGanIndex % 2 === 0;
  const isMale = gender === 1;
  const forward = (isYangYear && isMale) || (!isYangYear && !isMale);

  const monthGanIndex = TIAN_GAN.indexOf(bazi.monthPillar.gan);
  const monthZhiIndex = DI_ZHI.indexOf(bazi.monthPillar.zhi);

  const qiYunDays = calculateQiYunDays(birthDate, birthHour, forward);
  const qiYunYears = Math.floor(qiYunDays / 3);
  const remainingDays = qiYunDays % 3;
  const qiYunMonths = Math.floor(remainingDays * 4);
  
  const birthYear = new Date(birthDate).getFullYear();
  const birthMonth = new Date(birthDate).getMonth() + 1;
  
  let qiYunDate = new Date(birthYear, birthMonth - 1, new Date(birthDate).getDate());
  qiYunDate.setFullYear(qiYunDate.getFullYear() + qiYunYears);
  qiYunDate.setMonth(qiYunDate.getMonth() + qiYunMonths);
  
  const dayunList = [];
  for (let i = 1; i <= 8; i++) {
    const offset = forward ? i : -i;
    const pillar = getDayunPillar(bazi.monthPillar.gan, bazi.monthPillar.zhi, offset);
    
    const startAge = qiYunYears + (i - 1) * 10;
    const endAge = startAge + 9;
    const startYear = birthYear + startAge;
    const endYear = startYear + 9;

    dayunList.push({
      index: i,
      gan: pillar.gan,
      zhi: pillar.zhi,
      wuxing: { 
        gan: TIAN_GAN_WU_XING[pillar.gan], 
        zhi: DI_ZHI_WU_XING[pillar.zhi] 
      },
      shishen: {
        gan: SHI_SHEN_MAP[bazi.dayMaster][pillar.gan],
      },
      startAge,
      endAge,
      startYear,
      endYear,
      qiYunDate: i === 1 ? qiYunDate.toISOString().split('T')[0] : null,
    });
  }
  return dayunList;
};

// ==================== 流日计算 ====================

/**
 * 计算指定日期的日柱
 */
exports.getDayPillarByDate = function(date) {
  const [year, month, day] = date.split('-').map(Number);
  const lunar = Lunar.fromYmd(year, month, day);
  const dayGanZhi = lunar.getDayInGanZhi();
  
  return {
    gan: dayGanZhi.substring(0, 1),
    zhi: dayGanZhi.substring(1, 2),
  };
};

/**
 * 计算流日列表
 */
exports.getLiuri = function(year, month, dayGan) {
  const daysInMonth = new Date(year, month, 0).getDate();
  const list = [];
  
  for (let d = 1; d <= daysInMonth; d++) {
    const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    const dayPillar = this.getDayPillarByDate(dateStr);
    
    list.push({
      day: d,
      date: dateStr,
      gan: dayPillar.gan,
      zhi: dayPillar.zhi,
      wuxing: {
        gan: TIAN_GAN_WU_XING[dayPillar.gan],
        zhi: DI_ZHI_WU_XING[dayPillar.zhi],
      },
    });
  }
  
  return list;
};

// ==================== 流时计算 ====================

/**
 * 计算流时列表
 */
exports.getLiushi = function(dayGan) {
  const list = [];
  const dayGanIndex = TIAN_GAN.indexOf(dayGan);
  
  for (let h = 0; h < 12; h++) {
    const hourGanIndex = (dayGanIndex % 5 * 2 + h) % 10;
    const gan = TIAN_GAN[hourGanIndex];
    const zhi = DI_ZHI[h];
    
    list.push({
      hour: h * 2,
      gan,
      zhi,
      wuxing: {
        gan: TIAN_GAN_WU_XING[gan],
        zhi: DI_ZHI_WU_XING[zhi],
      },
    });
  }
  
  return list;
};

// ==================== 导出常量供外部使用 ====================

exports.TIAN_GAN = TIAN_GAN;
exports.DI_ZHI = DI_ZHI;
exports.TIAN_GAN_WU_XING = TIAN_GAN_WU_XING;
exports.DI_ZHI_WU_XING = DI_ZHI_WU_XING;
exports.DI_ZHI_CANG_GAN = DI_ZHI_CANG_GAN;
exports.SHI_SHEN_MAP = SHI_SHEN_MAP;
exports.WU_XING_CLASS = baziCore.WU_XING_CLASS;
