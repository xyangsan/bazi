<template>
  <div class="paipan-result-page">
    <!-- 顶部导航 -->
    <div class="nav-bar">
      <el-button text @click="$router.push('/')">
        <el-icon><ArrowLeft /></el-icon> 返回
      </el-button>
      <span class="nav-title main-color">排盘结果</span>
      <el-button text @click="$router.push('/detail')">专业细盘</el-button>
    </div>

    <!-- 基本信息栏 -->
    <div class="info-bar" v-if="result">
      <div class="info-item">
        <span class="label">姓名：</span>
        <span>{{ paipanStore.inputInfo.name || '未填写' }}</span>
      </div>
      <div class="info-item">
        <span class="label">性别：</span>
        <span>{{ result.bazi.gender }}</span>
      </div>
      <div class="info-item">
        <span class="label">出生日期：</span>
        <span>{{ paipanStore.inputInfo.birthDate }}</span>
      </div>
      <div class="info-item">
        <span class="label">农历：</span>
        <span>{{ result.lunar.lunarMonthCn }}{{ result.lunar.lunarDayCn }}</span>
      </div>
    </div>

    <!-- 基本排盘表格 -->
    <div class="pro-pan-content-table" v-if="result">
      <!-- 日期行 -->
      <div class="pro-pan-row">
        <div class="paipan-title-color" style="width:60px">日期</div>
        <div class="pro-pan-row-item">年柱</div>
        <div class="pro-pan-row-item">月柱</div>
        <div class="pro-pan-row-item">日柱</div>
        <div class="pro-pan-row-item">时柱</div>
      </div>

      <!-- 主星行 -->
      <div class="pro-pan-row">
        <div class="paipan-title-color" style="width:60px">主星</div>
        <div class="pro-pan-row-item">{{ result.shishen.yearPillar.ganShishen }}</div>
        <div class="pro-pan-row-item">{{ result.shishen.monthPillar.ganShishen }}</div>
        <div class="pro-pan-row-item base-pan-row">{{ result.bazi.gender === '男' ? '元男' : '元女' }}</div>
        <div class="pro-pan-row-item">{{ result.shishen.hourPillar.ganShishen }}</div>
      </div>

      <!-- 天干行 -->
      <div class="pro-pan-row">
        <div class="paipan-title-color" style="width:60px">天干</div>
        <div class="pro-pan-row-item" v-for="pillar in pillars" :key="pillar.key">
          <span :class="getWuxingColorClass(pillar.data.wuxing.gan)">{{ pillar.data.gan }}</span>
          <img :src="getWuxingIcon(pillar.data.wuxing.gan)" class="wuxing-icon" />
        </div>
      </div>

      <!-- 地支行 -->
      <div class="pro-pan-row">
        <div class="paipan-title-color" style="width:60px">地支</div>
        <div class="pro-pan-row-item" v-for="pillar in pillars" :key="pillar.key">
          <span :class="getWuxingColorClass(pillar.data.wuxing.zhi)">{{ pillar.data.zhi }}</span>
          <img :src="getWuxingIcon(pillar.data.wuxing.zhi)" class="wuxing-icon" />
        </div>
      </div>

      <!-- 藏干行 -->
      <div class="pro-pan-row">
        <div class="paipan-title-color" style="width:60px">藏干</div>
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
        <div class="paipan-title-color" style="width:60px">副星</div>
        <div class="pro-pan-row-item" v-for="pillar in pillars" :key="pillar.key">
          <div class="canggan-list">
            <span
              v-for="cg in result.shishen[pillar.key].zhiShishen"
              :key="cg.gan"
              class="shishen-text"
            >{{ cg.shishen }}</span>
          </div>
        </div>
      </div>

      <!-- 星运行 -->
      <div class="pro-pan-row">
        <div class="paipan-title-color" style="width:60px">星运</div>
        <div class="pro-pan-row-item" v-for="pillar in pillars" :key="pillar.key">
          {{ result.xingyun[pillar.key] }}
        </div>
      </div>

      <!-- 自坐行 -->
      <div class="pro-pan-row">
        <div class="paipan-title-color" style="width:60px">自坐</div>
        <div class="pro-pan-row-item" v-for="pillar in pillars" :key="pillar.key">
          {{ result.zizuo[pillar.key] }}
        </div>
      </div>

      <!-- 空亡行 -->
      <div class="pro-pan-row">
        <div class="paipan-title-color" style="width:60px">空亡</div>
        <div class="pro-pan-row-item" style="flex:4">
          {{ result.kongwang.kong1 }} {{ result.kongwang.kong2 }}
        </div>
      </div>

      <!-- 纳音行 -->
      <div class="pro-pan-row">
        <div class="paipan-title-color" style="width:60px">纳音</div>
        <div class="pro-pan-row-item" v-for="pillar in pillars" :key="pillar.key">
          {{ result.nayin[pillar.key] }}
        </div>
      </div>

      <!-- 神煞行 -->
      <div class="pro-pan-row">
        <div class="paipan-title-color" style="width:60px">神煞</div>
        <div class="pro-pan-row-item" v-for="pillar in pillars" :key="pillar.key">
          <div class="shensha-list">
            <span v-for="ss in result.shensha[pillar.key]" :key="ss">{{ ss }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 大运列表 -->
    <div class="dayun-section" v-if="result && result.dayun.length">
      <h3 class="section-title main-color">大运</h3>
      <div class="dayun-list">
        <div
          v-for="(dy, index) in result.dayun"
          :key="index"
          class="dayun-item"
          :class="{ active: paipanStore.currentDayunIndex === index }"
          @click="selectDayun(index)"
        >
          <div class="dayun-gan" :class="getWuxingColorClass(dy.wuxing.gan)">{{ dy.gan }}</div>
          <div class="dayun-zhi" :class="getWuxingColorClass(dy.wuxing.zhi)">{{ dy.zhi }}</div>
          <div class="dayun-age">{{ dy.startAge }}-{{ dy.endAge }}岁</div>
          <div class="dayun-shishen">{{ dy.shishen.gan }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { usePaipanStore } from '@/store/paipan'
import { getWuxingIcon, getWuxingColorClass } from '@/utils/wuxing'
import { ArrowLeft } from '@element-plus/icons-vue'

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

function selectDayun(index) {
  paipanStore.currentDayunIndex = index
}
</script>

<style lang="scss" scoped>
.paipan-result-page {
  min-height: 100vh;
  background: #f5f5f5;
  padding-bottom: 20px;
}

.nav-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  background: #fff;
  border-bottom: 1px solid #eee;

  .nav-title {
    font-size: 18px;
    font-weight: bold;
  }
}

.info-bar {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  padding: 16px;
  background: #fff;
  margin-bottom: 12px;

  .info-item {
    font-size: 14px;
    .label {
      color: #999;
    }
  }
}

.pro-pan-content-table {
  background: #fff;
  margin: 0 12px;
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

    .base-pan-row {
      display: flex;
      align-items: center;
      width: 100%;
      padding: 8px 0;
      font-size: 15px;
      color: #000;
    }
  }
}

.wuxing-icon {
  width: 16px;
  height: 16px;
}

.canggan-list, .shensha-list {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
  font-size: 13px;
}

.shishen-text {
  color: #9e9e9e;
  font-size: 12px;
}

.dayun-section {
  margin: 16px 12px;
  background: #fff;
  border-radius: 8px;
  padding: 16px;

  .section-title {
    font-size: 16px;
    margin: 0 0 12px;
  }
}

.dayun-list {
  display: flex;
  overflow-x: auto;
  gap: 10px;
  padding-bottom: 8px;
}

.dayun-item {
  flex-shrink: 0;
  width: 64px;
  text-align: center;
  padding: 10px 4px;
  border-radius: 8px;
  border: 1px solid #eee;
  cursor: pointer;
  transition: all 0.2s;

  &.active {
    border-color: #b2955d;
    background: #fdf6e3;
  }

  &:hover {
    border-color: #b2955d;
  }

  .dayun-gan, .dayun-zhi {
    font-size: 18px;
    font-weight: bold;
  }

  .dayun-age {
    font-size: 11px;
    color: #999;
    margin-top: 4px;
  }

  .dayun-shishen {
    font-size: 11px;
    color: #9e9e9e;
    margin-top: 2px;
  }
}
</style>
