<template>
  <div class="paipan-detail-page">
    <!-- 顶部导航 -->
    <div class="nav-bar">
      <el-button text @click="$router.push('/result')">
        <el-icon><ArrowLeft /></el-icon> 返回
      </el-button>
      <span class="nav-title main-color">专业细盘</span>
      <span style="width:60px"></span>
    </div>

    <div class="detail-container" v-if="result">
      <!-- 左侧：专业排盘表格（含大运流年列） -->
      <div class="detail-left">
        <div class="pro-pan-content-table">
          <!-- 日期行 -->
          <div class="pro-pan-row">
            <div class="paipan-title-color col-title">日期</div>
            <div class="paipan-title-color col-extra">流年</div>
            <div class="paipan-title-color col-extra">大运</div>
            <div class="pro-pan-row-item">年柱</div>
            <div class="pro-pan-row-item">月柱</div>
            <div class="pro-pan-row-item">日柱</div>
            <div class="pro-pan-row-item">时柱</div>
          </div>

          <!-- 主星行 -->
          <div class="pro-pan-row">
            <div class="paipan-title-color col-title">主星</div>
            <div class="col-extra">{{ currentLiunian?.shishen || '' }}</div>
            <div class="col-extra">{{ currentDayun?.shishen?.gan || '' }}</div>
            <div class="pro-pan-row-item">{{ result.shishen.yearPillar.ganShishen }}</div>
            <div class="pro-pan-row-item">{{ result.shishen.monthPillar.ganShishen }}</div>
            <div class="pro-pan-row-item base-pan-row">{{ result.bazi.gender === '男' ? '元男' : '元女' }}</div>
            <div class="pro-pan-row-item">{{ result.shishen.hourPillar.ganShishen }}</div>
          </div>

          <!-- 天干行 -->
          <div class="pro-pan-row">
            <div class="paipan-title-color col-title">天干</div>
            <div class="col-extra" :class="getWuxingColorClass(currentLiunian?.wuxing?.gan)">{{ currentLiunian?.gan || '' }}</div>
            <div class="col-extra" :class="getWuxingColorClass(currentDayun?.wuxing?.gan)">{{ currentDayun?.gan || '' }}</div>
            <div class="pro-pan-row-item" v-for="pillar in pillars" :key="pillar.key">
              <span :class="getWuxingColorClass(pillar.data.wuxing.gan)">{{ pillar.data.gan }}</span>
              <img :src="getWuxingIcon(pillar.data.wuxing.gan)" class="wuxing-icon" />
            </div>
          </div>

          <!-- 地支行 -->
          <div class="pro-pan-row">
            <div class="paipan-title-color col-title">地支</div>
            <div class="col-extra" :class="getWuxingColorClass(currentLiunian?.wuxing?.zhi)">{{ currentLiunian?.zhi || '' }}</div>
            <div class="col-extra" :class="getWuxingColorClass(currentDayun?.wuxing?.zhi)">{{ currentDayun?.zhi || '' }}</div>
            <div class="pro-pan-row-item" v-for="pillar in pillars" :key="pillar.key">
              <span :class="getWuxingColorClass(pillar.data.wuxing.zhi)">{{ pillar.data.zhi }}</span>
              <img :src="getWuxingIcon(pillar.data.wuxing.zhi)" class="wuxing-icon" />
            </div>
          </div>

          <!-- 藏干行 -->
          <div class="pro-pan-row">
            <div class="paipan-title-color col-title">藏干</div>
            <div class="col-extra">
              <div class="canggan-list">
                <span v-for="cg in currentLiunianCanggan" :key="cg.gan" :class="getWuxingColorClass(cg.wuxing)">{{ cg.gan }}({{ cg.shishen }})</span>
              </div>
            </div>
            <div class="col-extra">
              <div class="canggan-list">
                <span v-for="cg in currentDayunCanggan" :key="cg.gan" :class="getWuxingColorClass(cg.wuxing)">{{ cg.gan }}({{ cg.shishen }})</span>
              </div>
            </div>
            <div class="pro-pan-row-item" v-for="pillar in pillars" :key="pillar.key">
              <div class="canggan-list">
                <span
                  v-for="cg in result.canggan[pillar.key]"
                  :key="cg.gan"
                  :class="getWuxingColorClass(cg.wuxing)"
                >{{ cg.gan }}</span>
              </div>
            </div>
          </div>

          <!-- 副星行 -->
          <div class="pro-pan-row">
            <div class="paipan-title-color col-title">副星</div>
            <div class="col-extra"></div>
            <div class="col-extra">{{ currentDayun?.shishen?.gan || '' }}</div>
            <div class="pro-pan-row-item" v-for="pillar in pillars" :key="pillar.key">
              <div class="canggan-list">
                <span v-for="cg in result.shishen[pillar.key].zhiShishen" :key="cg.gan" class="shishen-text">{{ cg.shishen }}</span>
              </div>
            </div>
          </div>

          <!-- 星运/自坐/空亡/纳音/神煞 行 -->
          <div class="pro-pan-row" v-for="row in extraRows" :key="row.key">
            <div class="paipan-title-color col-title">{{ row.label }}</div>
            <div class="col-extra"></div>
            <div class="col-extra"></div>
            <div class="pro-pan-row-item" v-for="pillar in pillars" :key="pillar.key">
              {{ row.key === 'kongwang' ? (pillar.key === 'yearPillar' ? result.kongwang.kong1 + ' ' + result.kongwang.kong2 : '') : result[row.key]?.[pillar.key] || '' }}
            </div>
          </div>
        </div>
      </div>

      <!-- 右侧：排盘明细 -->
      <div class="detail-right">
        <!-- 起运/交运/空亡简介 -->
        <div class="info-card">
          <h4 class="card-title main-color">基本信息</h4>
          <div class="info-row">
            <span class="info-label">起运：</span>
            <span>{{ result.dayun[0]?.startAge || '-' }}岁起运</span>
          </div>
          <div class="info-row">
            <span class="info-label">交运日期：</span>
            <span>{{ result.dayun[0]?.qiYunDate || '-' }}</span>
          </div>
          <div class="info-row">
            <span class="info-label">空亡：</span>
            <span>{{ result.kongwang.kong1 }}、{{ result.kongwang.kong2 }}</span>
          </div>
          <div class="info-row" v-if="result.xingyun">
            <span class="info-label">日主星运：</span>
            <span>{{ result.xingyun.dayPillar }}</span>
          </div>
        </div>

        <!-- 大运选择 -->
        <div class="info-card">
          <h4 class="card-title main-color">大运</h4>
          <div class="select-list">
            <div
              v-for="(dy, idx) in result.dayun"
              :key="idx"
              class="select-item"
              :class="{ active: paipanStore.currentDayunIndex === idx }"
              @click="selectDayun(idx)"
            >
              <span :class="getWuxingColorClass(dy.wuxing.gan)">{{ dy.gan }}</span>
              <span :class="getWuxingColorClass(dy.wuxing.zhi)">{{ dy.zhi }}</span>
              <span class="age-text">{{ dy.startAge }}-{{ dy.endAge }}岁</span>
            </div>
          </div>
        </div>

        <!-- 流年选择 -->
        <div class="info-card">
          <h4 class="card-title main-color">流年（小运）</h4>
          <div class="select-list small">
            <div
              v-for="(ln, idx) in liunianList"
              :key="idx"
              class="select-item small"
              :class="{ active: paipanStore.currentLiunianIndex === idx }"
              @click="selectLiunian(idx)"
            >
              {{ ln.gan }}{{ ln.zhi }}
            </div>
          </div>
        </div>

        <!-- 流月选择 -->
        <div class="info-card">
          <h4 class="card-title main-color">流月</h4>
          <div class="select-list small">
            <div
              v-for="(lm, idx) in liuyueList"
              :key="idx"
              class="select-item small"
              :class="{ active: paipanStore.currentLiuyueIndex === idx }"
              @click="selectLiuyue(idx)"
            >
              {{ lm.gan }}{{ lm.zhi }}
            </div>
          </div>
        </div>

        <!-- 流日选择 -->
        <div class="info-card">
          <h4 class="card-title main-color">流日</h4>
          <div class="select-list small">
            <div
              v-for="(lr, idx) in liuriList"
              :key="idx"
              class="select-item small"
              :class="{ active: paipanStore.currentLiuriIndex === idx }"
              @click="selectLiuri(idx)"
              :title="lr.date"
            >
              {{ lr.dayGanZhi || lr.day }}
            </div>
          </div>
        </div>

        <!-- 流时选择 -->
        <div class="info-card">
          <h4 class="card-title main-color">流时</h4>
          <div class="select-list small">
            <div
              v-for="(ls, idx) in liushiList"
              :key="idx"
              class="select-item small"
              :class="{ active: paipanStore.currentLiushiIndex === idx }"
              @click="selectLiushi(idx)"
            >
              {{ ls.gan }}{{ ls.zhi }}
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, ref, watch } from 'vue'
import { usePaipanStore } from '@/store/paipan'
import { getWuxingIcon, getWuxingColorClass } from '@/utils/wuxing'
import { ArrowLeft } from '@element-plus/icons-vue'
import { TIAN_GAN, DI_ZHI, TIAN_GAN_WU_XING, DI_ZHI_WU_XING, DI_ZHI_CANG_GAN, SHI_SHEN_MAP } from './baziData'

const paipanStore = usePaipanStore()
const result = computed(() => paipanStore.result)

const pillars = computed(() => {
  if (!result.value?.bazi) return []
  return [
    { key: 'yearPillar', data: result.value.bazi.yearPillar },
    { key: 'monthPillar', data: result.value.bazi.monthPillar },
    { key: 'dayPillar', data: result.value.bazi.dayPillar },
    { key: 'hourPillar', data: result.value.bazi.hourPillar },
  ]
})

const extraRows = [
  { key: 'xingyun', label: '星运' },
  { key: 'zizuo', label: '自坐' },
  { key: 'kongwang', label: '空亡' },
  { key: 'nayin', label: '纳音' },
  { key: 'shensha', label: '神煞' },
]

// 当前大运
const currentDayun = computed(() => {
  if (!result.value?.dayun) return null
  return result.value.dayun[paipanStore.currentDayunIndex] || null
})

// 当前大运藏干
const currentDayunCanggan = computed(() => {
  if (!currentDayun.value) return []
  const zhi = currentDayun.value.zhi
  const dayMaster = result.value.bazi.dayMaster
  return (DI_ZHI_CANG_GAN[zhi] || []).map(gan => ({
    gan,
    wuxing: TIAN_GAN_WU_XING[gan],
    shishen: SHI_SHEN_MAP[dayMaster]?.[gan] || '',
  }))
})

// 生成流年列表（10年一大运）
const liunianList = computed(() => {
  if (!currentDayun.value) return []
  const list = []
  const startYear = currentDayun.value.startYear
  for (let i = 0; i < 10; i++) {
    const year = startYear + i
    const ganIndex = (year - 4) % 10
    const zhiIndex = (year - 4) % 12
    const gan = TIAN_GAN[ganIndex]
    const zhi = DI_ZHI[zhiIndex]
    list.push({
      year,
      gan,
      zhi,
      wuxing: { gan: TIAN_GAN_WU_XING[gan], zhi: DI_ZHI_WU_XING[zhi] },
      shishen: result.value?.bazi ? SHI_SHEN_MAP[result.value.bazi.dayMaster]?.[gan] || '' : '',
    })
  }
  return list
})

// 当前流年
const currentLiunian = computed(() => {
  return liunianList.value[paipanStore.currentLiunianIndex] || null
})

// 当前流年藏干
const currentLiunianCanggan = computed(() => {
  if (!currentLiunian.value) return []
  const zhi = currentLiunian.value.zhi
  const dayMaster = result.value?.bazi?.dayMaster
  return (DI_ZHI_CANG_GAN[zhi] || []).map(gan => ({
    gan,
    wuxing: TIAN_GAN_WU_XING[gan],
    shishen: dayMaster ? SHI_SHEN_MAP[dayMaster]?.[gan] || '' : '',
  }))
})

// 流月列表
const liuyueList = computed(() => {
  if (!currentLiunian.value) return []
  const list = []
  const yearGanIndex = TIAN_GAN.indexOf(currentLiunian.value.gan)
  for (let m = 0; m < 12; m++) {
    const monthGanIndex = (yearGanIndex % 5 * 2 + m) % 10
    const gan = TIAN_GAN[monthGanIndex]
    const zhi = DI_ZHI[(m + 2) % 12]
    list.push({
      month: m + 1,
      gan,
      zhi,
      wuxing: { gan: TIAN_GAN_WU_XING[gan], zhi: DI_ZHI_WU_XING[zhi] },
    })
  }
  return list
})

// 流日列表（计算当月每一天的干支）
const liuriList = computed(() => {
  if (!currentLiuyue.value) return []
  
  const year = currentLiunian.value?.year || new Date().getFullYear()
  const month = currentLiuyue.value.month
  const dayGan = result.value?.bazi?.dayPillar?.gan || '甲'
  
  // 获取当月的天数
  const daysInMonth = new Date(year, month, 0).getDate()
  const list = []
  
  for (let d = 1; d <= daysInMonth; d++) {
    // 计算日柱干支
    const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(d).padStart(2, '0')}`
    const [y, m, day] = dateStr.split('-').map(Number)
    
    // 使用lunar-javascript计算日柱
    try {
      // 前端简化计算：基于1900-01-01甲子日
      const baseDate = new Date(1900, 0, 1)
      const currentDate = new Date(y, m - 1, day)
      const diff = Math.floor((currentDate - baseDate) / 86400000)
      const dayGanIndex = ((diff % 10) + 10) % 10
      const dayZhiIndex = ((diff % 12) + 12) % 12
      
      const gan = TIAN_GAN[dayGanIndex]
      const zhi = DI_ZHI[dayZhiIndex]
      
      list.push({
        day: d,
        date: dateStr,
        gan,
        zhi,
        dayGanZhi: gan + zhi,
        wuxing: {
          gan: TIAN_GAN_WU_XING[gan],
          zhi: DI_ZHI_WU_XING[zhi],
        },
      })
    } catch (err) {
      list.push({
        day: d,
        dayGanZhi: '',
      })
    }
  }
  
  return list
})

// 流时列表
const liushiList = computed(() => {
  if (!result.value?.bazi) return []
  const list = []
  const dayGan = result.value.bazi.dayPillar.gan
  const dayGanIndex = TIAN_GAN.indexOf(dayGan)
  for (let h = 0; h < 12; h++) {
    const hourGanIndex = (dayGanIndex % 5 * 2 + h) % 10
    const gan = TIAN_GAN[hourGanIndex]
    const zhi = DI_ZHI[h]
    list.push({
      gan,
      zhi,
      wuxing: { gan: TIAN_GAN_WU_XING[gan], zhi: DI_ZHI_WU_XING[zhi] },
    })
  }
  return list
})

function selectDayun(idx) {
  paipanStore.currentDayunIndex = idx
  paipanStore.currentLiunianIndex = 0
  paipanStore.currentLiuyueIndex = 0
  paipanStore.currentLiuriIndex = 0
  paipanStore.currentLiushiIndex = 0
}

function selectLiunian(idx) {
  paipanStore.currentLiunianIndex = idx
  paipanStore.currentLiuyueIndex = 0
  paipanStore.currentLiuriIndex = 0
  paipanStore.currentLiushiIndex = 0
}

function selectLiuyue(idx) {
  paipanStore.currentLiuyueIndex = idx
  paipanStore.currentLiuriIndex = 0
  paipanStore.currentLiushiIndex = 0
}

function selectLiuri(idx) {
  paipanStore.currentLiuriIndex = idx
  paipanStore.currentLiushiIndex = 0
}

function selectLiushi(idx) {
  paipanStore.currentLiushiIndex = idx
}
</script>

<style lang="scss" scoped>
.paipan-detail-page {
  min-height: 100vh;
  background: #f5f5f5;
}

.nav-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  background: #fff;
  border-bottom: 1px solid #eee;
  position: sticky;
  top: 0;
  z-index: 100;

  .nav-title {
    font-size: 18px;
    font-weight: bold;
  }
}

.detail-container {
  display: flex;
  gap: 16px;
  padding: 16px;
  align-items: flex-start;
}

.detail-left {
  flex: 1;
  min-width: 0;
}

.detail-right {
  width: 300px;
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.pro-pan-content-table {
  background: #fff;
  border-radius: 8px;
  padding: 12px;

  .pro-pan-row {
    display: flex;
    align-items: center;
    width: 100%;
    padding: 5px 0;
    font-size: 15px;
    border-bottom: 1px solid #f5f5f5;

    .paipan-title-color {
      color: #9e9e9e;
    }

    .pro-pan-row-item {
      flex: 1;
      white-space: nowrap;
      display: flex;
      flex-direction: column;
      align-self: flex-start;
      align-items: center;
      gap: 4px;
    }

    .col-title {
      width: 50px;
      flex-shrink: 0;
    }

    .col-extra {
      width: 50px;
      flex-shrink: 0;
      text-align: center;
      font-size: 14px;
      display: flex;
      flex-direction: column;
      align-items: center;
    }

    .base-pan-row {
      display: flex;
      align-items: center;
      padding: 8px 0;
      font-size: 15px;
      color: #000;
    }
  }
}

.wuxing-icon {
  width: 14px;
  height: 14px;
}

.canggan-list {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
  font-size: 12px;
}

.shishen-text {
  color: #9e9e9e;
  font-size: 11px;
}

.info-card {
  background: #fff;
  border-radius: 8px;
  padding: 14px;

  .card-title {
    font-size: 14px;
    margin: 0 0 10px;
    padding-bottom: 8px;
    border-bottom: 1px solid #f0f0f0;
  }

  .info-row {
    display: flex;
    align-items: center;
    padding: 4px 0;
    font-size: 13px;

    .info-label {
      color: #999;
      width: 60px;
    }
  }
}

.select-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;

  &.small {
    .select-item {
      padding: 6px 10px;
      font-size: 13px;
    }
  }

  .select-item {
    padding: 8px 12px;
    border-radius: 6px;
    border: 1px solid #eee;
    cursor: pointer;
    transition: all 0.2s;
    font-size: 14px;
    display: flex;
    align-items: center;
    gap: 4px;

    &.active {
      border-color: #b2955d;
      background: #fdf6e3;
    }

    &:hover {
      border-color: #b2955d;
    }

    .age-text {
      font-size: 11px;
      color: #999;
    }
  }
}

@media (max-width: 768px) {
  .detail-container {
    flex-direction: column;
  }

  .detail-right {
    width: 100%;
  }
}
</style>
