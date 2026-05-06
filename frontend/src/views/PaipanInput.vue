<template>
  <div class="paipan-input-page">
    <div class="header">
      <h1 class="main-color">八字排盘</h1>
      <p class="subtitle">输入出生信息，精准排盘</p>
    </div>

    <div class="form-container">
      <el-form :model="form" label-width="80px" label-position="right" size="large">
        <el-form-item label="姓名">
          <el-input v-model="form.name" placeholder="请输入姓名" />
        </el-form-item>

        <el-form-item label="性别">
          <el-radio-group v-model="form.gender">
            <el-radio :value="1">男</el-radio>
            <el-radio :value="2">女</el-radio>
          </el-radio-group>
        </el-form-item>

        <el-form-item label="出生时间">
          <el-input
            v-model="birthDateTimeText"
            readonly
            placeholder="请选择出生年月日时分"
            class="birth-date-input"
            @click="openBirthDialog"
          >
            <template #suffix>
              <el-icon><Calendar /></el-icon>
            </template>
          </el-input>
        </el-form-item>

        <el-form-item label="出生地">
          <el-input
            v-model="form.birthPlace"
            readonly
            placeholder="请选择出生地（可选）"
            class="birth-date-input"
            @click="openRegionDialog"
          />
        </el-form-item>

        <div v-if="selectedRegion.name" class="region-meta">
          <span>经纬度：{{ selectedRegion.longitude ?? '--' }} / {{ selectedRegion.latitude ?? '--' }}</span>
          <span>{{ selectedRegion.timezoneName || '北京时间' }} GTMT：{{ selectedRegion.gmtOffsetLabel || 'GMT+08:00' }}</span>
          <span>地方平太阳时：{{ selectedRegion.localMeanTime || '--' }}</span>
        </div>

        <!-- 农历信息展示区 -->
        <div v-if="lunarInfo" class="lunar-info">
          <el-divider>农历信息</el-divider>
          <div class="lunar-detail">
            <span>农历：{{ lunarInfo.lunarMonthCn }}{{ lunarInfo.lunarDayCn }}</span>
            <span>干支：{{ lunarInfo.yearGanZhi }}年 {{ lunarInfo.monthGanZhi }}月 {{ lunarInfo.dayGanZhi }}日</span>
          </div>
        </div>

        <el-form-item>
          <el-button type="primary" class="submit-btn main-bg" @click="handleSubmit" :loading="loading">
            开始排盘
          </el-button>
        </el-form-item>

        <!-- 保存按钮（登录后显示） -->
        <el-form-item v-if="paipanStore.result && userStore.isLoggedIn">
          <el-button 
            type="success" 
            class="submit-btn" 
            @click="handleSave"
            :loading="saving"
            plain
          >
            保存到我的排盘
          </el-button>
        </el-form-item>

        <!-- 未登录提示 -->
        <div v-if="paipanStore.result && !userStore.isLoggedIn" class="login-tip">
          <span>登录后可保存排盘结果</span>
          <router-link to="/login" class="link">去登录</router-link>
        </div>
      </el-form>
    </div>

    <Teleport to="body">
      <div v-if="dateDialogVisible" class="birth-dialog-mask" @click.self="closeBirthDialog">
        <div class="birth-dialog">
          <div class="birth-dialog-header">
            <button class="today-btn" type="button" @click="selectToday">今</button>
            <div class="calendar-tabs">
              <button
                v-for="tab in calendarTabs"
                :key="tab.value"
                type="button"
                :class="{ active: calendarType === tab.value }"
                @click="calendarType = tab.value"
              >
                {{ tab.label }}
              </button>
            </div>
            <button class="close-btn" type="button" @click="closeBirthDialog">
              <el-icon><Close /></el-icon>
            </button>
          </div>

          <div class="dialog-input-row">
            <input
              v-model="manualDateTimeText"
              inputmode="numeric"
              maxlength="12"
              placeholder="输入出生年月日时分(格式199303270255)"
              @input="handleManualInput"
              @keyup.enter="applyManualInput"
            />
            <button type="button" @click="applyManualInput">确定</button>
          </div>

          <div class="wheel-labels">
            <span v-for="column in pickerColumns" :key="column.key">{{ column.label }}</span>
          </div>

          <div class="wheel-wrap">
            <div class="wheel-highlight"></div>
            <div
              v-for="column in pickerColumns"
              :key="column.key"
              :ref="el => setWheelRef(column.key, el)"
              class="wheel-column"
            >
              <button
                v-for="option in column.options"
                :key="`${column.key}-${option.value}`"
                type="button"
                :class="{ active: selectedDateTime[column.key] === option.value }"
                @click="selectDatePart(column.key, option.value)"
              >
                {{ option.label }}
              </button>
            </div>
          </div>

          <button class="dialog-confirm-btn" type="button" @click="confirmBirthDateTime">
            确定
          </button>
        </div>
      </div>
    </Teleport>

    <Teleport to="body">
      <div v-if="regionDialogVisible" class="birth-dialog-mask" @click.self="closeRegionDialog">
        <div class="birth-dialog region-dialog">
          <div class="birth-dialog-header region-dialog-header">
            <span></span>
            <button class="close-btn" type="button" @click="closeRegionDialog">
              <el-icon><Close /></el-icon>
            </button>
          </div>

          <div class="region-search-row">
            <el-icon><Search /></el-icon>
            <input
              v-model="regionSearchText"
              placeholder="搜索全国城市及地区"
              @input="handleRegionSearch"
            />
          </div>

          <div class="region-labels">
            <span>省份</span>
            <span>城市</span>
            <span>区县</span>
          </div>

          <div v-if="regionSearchText.trim()" class="region-search-results">
            <button
              v-for="item in regionSearchResults"
              :key="item.code"
              type="button"
              @click="selectSearchRegion(item)"
            >
              <span class="search-result-path">{{ item.displayPath || item.fullName || item.name }}</span>
            </button>
            <div v-if="!regionSearchResults.length" class="region-empty">暂无匹配地区</div>
          </div>

          <div v-else class="region-picker">
            <div class="region-column">
              <button
                type="button"
                :class="{ active: !draftRegion.province }"
                @click="selectUnknownRegion"
              >
                未知地
              </button>
              <button
                v-for="item in provinceList"
                :key="item.code"
                type="button"
                :class="{ active: draftRegion.province?.code === item.code }"
                @click="selectProvince(item)"
              >
                {{ item.name }}
              </button>
            </div>
            <div class="region-column">
              <button
                v-for="item in cityList"
                :key="item.code"
                type="button"
                :class="{ active: draftRegion.city?.code === item.code }"
                @click="selectCity(item)"
              >
                {{ item.name }}
              </button>
            </div>
            <div class="region-column">
              <button
                v-for="item in districtList"
                :key="item.code"
                type="button"
                :class="{ active: draftRegion.district?.code === item.code }"
                @click="selectDistrict(item)"
              >
                {{ item.name }}
              </button>
            </div>
          </div>

<!--          <div class="region-selected-card">
            <strong>{{ draftRegionDisplay.name }}</strong>
            <span>{{ draftRegionDisplay.timezoneName }}</span>
            <span>{{ draftRegionDisplay.gmtOffsetLabel }}</span>
          </div>-->

          <button class="dialog-confirm-btn" type="button" @click="confirmRegion">
            确定
          </button>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed, nextTick, watch } from 'vue'
import { useRouter } from 'vue-router'
import { usePaipanStore } from '@/store/paipan'
import { useUserStore } from '@/store/user'
import { calculatePaipan, savePaipan } from '@/api/paipan'
import { getRegionChildren, searchRegions } from '@/api/region'
import { ElMessage } from 'element-plus'
import { Calendar, Close, Search } from '@element-plus/icons-vue'
import { DI_ZHI } from './baziData'

const router = useRouter()
const paipanStore = usePaipanStore()
const userStore = useUserStore()
const loading = ref(false)
const saving = ref(false)
const lunarInfo = ref(null)
const dateDialogVisible = ref(false)
const regionDialogVisible = ref(false)
const calendarType = ref('solar')
const birthDateTimeText = ref('')
const manualDateTimeText = ref('')
const wheelRefs = ref({})
const regionSearchText = ref('')
const regionSearchResults = ref([])
const provinceList = ref([])
const cityList = ref([])
const districtList = ref([])
let regionSearchTimer = null

const calendarTabs = [
  { label: '公历', value: 'solar' },
  { label: '农历', value: 'lunar' },
]

const LUNAR_DAY_TEXT = [
  '',
  '初一',
  '初二',
  '初三',
  '初四',
  '初五',
  '初六',
  '初七',
  '初八',
  '初九',
  '初十',
  '十一',
  '十二',
  '十三',
  '十四',
  '十五',
  '十六',
  '十七',
  '十八',
  '十九',
  '二十',
  '廿一',
  '廿二',
  '廿三',
  '廿四',
  '廿五',
  '廿六',
  '廿七',
  '廿八',
  '廿九',
  '三十',
]

const lunarFormatter = new Intl.DateTimeFormat('zh-CN-u-ca-chinese', {
  year: 'numeric',
  month: 'long',
  day: 'numeric',
})

const form = reactive({
  name: '',
  gender: 1,
  birthDate: '',
  birthTime: '',
  birthPlace: '',
  regionCode: '',
  longitude: null,
  latitude: null,
  timezoneName: '北京时间',
  gmtOffsetMinutes: 480,
})

const selectedRegion = reactive({
  code: '',
  name: '',
  longitude: null,
  latitude: null,
  timezoneName: '北京时间',
  gmtOffsetMinutes: 480,
  gmtOffsetLabel: 'GMT+08:00',
  localMeanTime: '',
})

const draftRegion = reactive({
  province: null,
  city: null,
  district: null,
})

const selectedDateTime = reactive({
  year: 1990,
  month: 1,
  day: 1,
  hour: 0,
  minute: 0,
})

const years = computed(() => {
  const list = []
  for (let year = 1900; year <= 2100; year++) {
    list.push({ label: formatYearOption(year), value: year })
  }
  return list
})

const months = computed(() => createNumberOptions(1, 12, value => formatMonthOption(value)))
const days = computed(() => createNumberOptions(1, getDaysInMonth(selectedDateTime.year, selectedDateTime.month), value => formatDayOption(value)))
const hours = computed(() => createNumberOptions(0, 23, value => formatHourOption(value)))
const minutes = computed(() => createNumberOptions(0, 59))

const pickerColumns = computed(() => [
  { key: 'year', label: '年', options: years.value },
  { key: 'month', label: '月', options: months.value },
  { key: 'day', label: '日', options: days.value },
  { key: 'hour', label: '时', options: hours.value },
  { key: 'minute', label: '分', options: minutes.value },
])

function pad2(value) {
  return String(value).padStart(2, '0')
}

function createNumberOptions(start, end, labelFormatter = pad2) {
  const list = []
  for (let value = start; value <= end; value++) {
    list.push({ label: labelFormatter(value), value })
  }
  return list
}

function getDaysInMonth(year, month) {
  return new Date(year, month, 0).getDate()
}

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max)
}

function getSafeDate(year, month, day) {
  return new Date(year, month - 1, clamp(day, 1, getDaysInMonth(year, month)))
}

function getLunarParts(date) {
  const parts = lunarFormatter.formatToParts(date)
  return parts.reduce((result, part) => {
    result[part.type] = part.value
    return result
  }, {})
}

function formatYearOption(year) {
  if (calendarType.value === 'lunar') {
    const parts = getLunarParts(getSafeDate(year, selectedDateTime.month, selectedDateTime.day))
    return `${parts.yearName || year}年`
  }

  return String(year)
}

function formatMonthOption(month) {
  if (calendarType.value === 'lunar') {
    const parts = getLunarParts(getSafeDate(selectedDateTime.year, month, selectedDateTime.day))
    return parts.month || pad2(month)
  }

  return pad2(month)
}

function formatDayOption(day) {
  if (calendarType.value === 'lunar') {
    const parts = getLunarParts(getSafeDate(selectedDateTime.year, selectedDateTime.month, day))
    return LUNAR_DAY_TEXT[Number(parts.day)] || parts.day || pad2(day)
  }

  return pad2(day)
}

function formatHourOption(hour) {
  if (calendarType.value === 'lunar') {
    return `${DI_ZHI[Math.floor((hour + 1) / 2) % 12]}时`
  }

  return pad2(hour)
}

function normalizeSelectedDateTime() {
  selectedDateTime.month = clamp(selectedDateTime.month, 1, 12)
  selectedDateTime.day = clamp(selectedDateTime.day, 1, getDaysInMonth(selectedDateTime.year, selectedDateTime.month))
  selectedDateTime.hour = clamp(selectedDateTime.hour, 0, 23)
  selectedDateTime.minute = clamp(selectedDateTime.minute, 0, 59)
}

function getCompactDateTime() {
  return [
    selectedDateTime.year,
    pad2(selectedDateTime.month),
    pad2(selectedDateTime.day),
    pad2(selectedDateTime.hour),
    pad2(selectedDateTime.minute),
  ].join('')
}

function updateBirthFields() {
  normalizeSelectedDateTime()
  const date = `${selectedDateTime.year}-${pad2(selectedDateTime.month)}-${pad2(selectedDateTime.day)}`
  const time = `${pad2(selectedDateTime.hour)}:${pad2(selectedDateTime.minute)}`
  form.birthDate = date
  form.birthTime = time
  birthDateTimeText.value = `${date} ${time}`
  manualDateTimeText.value = getCompactDateTime()
  updateLunarInfo()
}

function openBirthDialog() {
  manualDateTimeText.value = form.birthDate && form.birthTime ? getCompactDateTime() : ''
  dateDialogVisible.value = true
  nextTick(scrollAllWheelsToActive)
}

function closeBirthDialog() {
  dateDialogVisible.value = false
}

function selectToday() {
  const now = new Date()
  selectedDateTime.year = now.getFullYear()
  selectedDateTime.month = now.getMonth() + 1
  selectedDateTime.day = now.getDate()
  selectedDateTime.hour = now.getHours()
  selectedDateTime.minute = now.getMinutes()
  manualDateTimeText.value = getCompactDateTime()
  nextTick(scrollAllWheelsToActive)
}

function handleManualInput() {
  manualDateTimeText.value = manualDateTimeText.value.replace(/\D/g, '').slice(0, 12)
}

function applyManualInput() {
  const value = manualDateTimeText.value.replace(/\D/g, '').slice(0, 12)
  manualDateTimeText.value = value

  if (value.length >= 4) {
    selectedDateTime.year = clamp(Number(value.slice(0, 4)), 1900, 2100)
  }
  if (value.length >= 6) {
    selectedDateTime.month = clamp(Number(value.slice(4, 6)), 1, 12)
  } else if (value.length >= 4) {
    selectedDateTime.month = 1
  }
  if (value.length >= 8) {
    selectedDateTime.day = clamp(Number(value.slice(6, 8)), 1, getDaysInMonth(selectedDateTime.year, selectedDateTime.month))
  } else if (value.length >= 4) {
    selectedDateTime.day = 1
  }
  if (value.length >= 10) {
    selectedDateTime.hour = clamp(Number(value.slice(8, 10)), 0, 23)
  } else if (value.length >= 4) {
    selectedDateTime.hour = 0
  }
  if (value.length >= 12) {
    selectedDateTime.minute = clamp(Number(value.slice(10, 12)), 0, 59)
  } else if (value.length >= 4) {
    selectedDateTime.minute = 0
  }
  normalizeSelectedDateTime()
  manualDateTimeText.value = value.length === 12 ? getCompactDateTime() : value
  nextTick(scrollAllWheelsToActive)
}

function selectDatePart(key, value) {
  selectedDateTime[key] = value
  normalizeSelectedDateTime()
  manualDateTimeText.value = getCompactDateTime()
  nextTick(scrollAllWheelsToActive)
}

function confirmBirthDateTime() {
  updateBirthFields()
  closeBirthDialog()
}

function setWheelRef(key, el) {
  if (el) {
    wheelRefs.value[key] = el
  }
}

function scrollWheelToActive(key) {
  const column = wheelRefs.value[key]
  if (!column) return

  const active = column.querySelector('.active')
  const highlight = column.parentElement?.querySelector('.wheel-highlight')
  if (active) {
    const highlightCenter = highlight
      ? highlight.offsetTop + highlight.offsetHeight / 2
      : column.clientHeight / 2
    column.scrollTop = active.offsetTop + active.offsetHeight / 2 - highlightCenter
  }
}

function scrollAllWheelsToActive() {
  pickerColumns.value.forEach(column => scrollWheelToActive(column.key))
}

const draftRegionDisplay = computed(() => {
  const region = draftRegion.district || draftRegion.city || draftRegion.province
  if (!region) {
    return {
      name: '未知地',
      timezoneName: '北京时间',
      gmtOffsetLabel: 'GMT+08:00',
    }
  }

  return {
    name: region.fullName || region.name,
    timezoneName: region.timezoneName || '北京时间',
    gmtOffsetLabel: getGmtOffsetLabel(region.gmtOffsetMinutes),
  }
})

function getGmtOffsetLabel(minutes = 480) {
  const value = Number(minutes) || 480
  const sign = value >= 0 ? '+' : '-'
  const abs = Math.abs(value)
  return `GMT${sign}${pad2(Math.floor(abs / 60))}:${pad2(abs % 60)}`
}

function computeLocalMeanTime(longitude) {
  if (longitude === null || longitude === undefined || longitude === '' || !form.birthDate || !form.birthTime) {
    return ''
  }

  const [year, month, day] = form.birthDate.split('-').map(Number)
  const [hour, minute = 0] = form.birthTime.split(':').map(Number)
  const correction = Math.round((Number(longitude) - 120) * 4)
  const date = new Date(year, month - 1, day, hour, minute + correction)
  return `${date.getFullYear()}-${pad2(date.getMonth() + 1)}-${pad2(date.getDate())} ${pad2(date.getHours())}:${pad2(date.getMinutes())}`
}

function applyRegion(region) {
  selectedRegion.code = region?.code || ''
  selectedRegion.name = region?.fullName || region?.name || ''
  selectedRegion.longitude = region?.longitude ?? null
  selectedRegion.latitude = region?.latitude ?? null
  selectedRegion.timezoneName = region?.timezoneName || '北京时间'
  selectedRegion.gmtOffsetMinutes = region?.gmtOffsetMinutes ?? 480
  selectedRegion.gmtOffsetLabel = getGmtOffsetLabel(selectedRegion.gmtOffsetMinutes)
  selectedRegion.localMeanTime = computeLocalMeanTime(selectedRegion.longitude)

  form.birthPlace = selectedRegion.name
  form.regionCode = selectedRegion.code
  form.longitude = selectedRegion.longitude
  form.latitude = selectedRegion.latitude
  form.timezoneName = selectedRegion.timezoneName
  form.gmtOffsetMinutes = selectedRegion.gmtOffsetMinutes
}

async function loadRegionChildren(parentCode, targetRef) {
  try {
    const res = await getRegionChildren(parentCode)
    targetRef.value = res.data || []
  } catch (err) {
    targetRef.value = []
  }
}

async function openRegionDialog() {
  regionSearchText.value = ''
  regionSearchResults.value = []
  regionDialogVisible.value = true
  if (!provinceList.value.length) {
    await loadRegionChildren('', provinceList)
  }
}

function closeRegionDialog() {
  regionDialogVisible.value = false
}

function selectUnknownRegion() {
  draftRegion.province = null
  draftRegion.city = null
  draftRegion.district = null
  cityList.value = []
  districtList.value = []
}

async function selectProvince(region) {
  draftRegion.province = region
  draftRegion.city = null
  draftRegion.district = null
  districtList.value = []
  await loadRegionChildren(region.code, cityList)
}

async function selectCity(region) {
  draftRegion.city = region
  draftRegion.district = null
  await loadRegionChildren(region.code, districtList)
}

function selectDistrict(region) {
  draftRegion.district = region
}

async function handleRegionSearch() {
  clearTimeout(regionSearchTimer)
  const keyword = regionSearchText.value.trim()
  if (!keyword) {
    regionSearchResults.value = []
    return
  }

  regionSearchTimer = setTimeout(async () => {
    try {
      const res = await searchRegions(keyword)
      regionSearchResults.value = res.data || []
    } catch (err) {
      regionSearchResults.value = []
    }
  }, 200)
}

function selectSearchRegion(region) {
  draftRegion.province = region.provinceCode ? { code: region.provinceCode, name: region.provinceName } : null
  draftRegion.city = region.cityCode ? { code: region.cityCode, name: region.cityName } : null
  draftRegion.district = region
}

function confirmRegion() {
  const region = draftRegion.district || draftRegion.city || draftRegion.province
  applyRegion(region)
  closeRegionDialog()
}

watch(
  () => [selectedDateTime.year, selectedDateTime.month],
  () => {
    normalizeSelectedDateTime()
    nextTick(() => scrollWheelToActive('day'))
  }
)

watch(calendarType, () => {
  nextTick(scrollAllWheelsToActive)
})

watch(
  () => [form.birthDate, form.birthTime, selectedRegion.longitude],
  () => {
    selectedRegion.localMeanTime = computeLocalMeanTime(selectedRegion.longitude)
  }
)

// 获取农历信息
function updateLunarInfo() {
  if (!form.birthDate) {
    lunarInfo.value = null
    return
  }
  
  // 简单显示农历信息（实际应由后端计算）
  // 这里只是临时显示，实际农历信息在排盘结果中
  lunarInfo.value = {
    lunarMonthCn: '',
    lunarDayCn: '',
    yearGanZhi: '',
    monthGanZhi: '',
    dayGanZhi: ''
  }
}

async function handleSubmit() {
  if (!form.birthDate || !form.birthTime) {
    ElMessage.warning('请选择出生时间')
    return
  }

  loading.value = true
  try {
    const res = await calculatePaipan({
      ...form,
      regionName: selectedRegion.name,
      longitude: selectedRegion.longitude,
      latitude: selectedRegion.latitude,
      timezoneName: selectedRegion.timezoneName,
      gmtOffsetMinutes: selectedRegion.gmtOffsetMinutes,
    })
    if (res.code === 0) {
      paipanStore.setInputInfo({ ...form })
      paipanStore.setResult(res.data)
      // 更新农历信息
      if (res.data.lunar) {
        lunarInfo.value = {
          lunarMonthCn: `${res.data.lunar.lunarMonthCn}月`,
          lunarDayCn: res.data.lunar.lunarDayCn,
          yearGanZhi: res.data.lunar.yearGanZhi,
          monthGanZhi: res.data.lunar.monthGanZhi,
          dayGanZhi: res.data.lunar.dayGanZhi
        }
      }
      router.push('/result')
    }
  } catch (err) {
    console.error('排盘失败:', err)
    ElMessage.error('排盘失败，请重试')
  } finally {
    loading.value = false
  }
}

async function handleSave() {
  if (!userStore.isLoggedIn) {
    ElMessage.warning('请先登录')
    router.push('/login')
    return
  }

  if (!paipanStore.result) {
    ElMessage.warning('请先排盘')
    return
  }

  saving.value = true
  try {
    const res = await savePaipan({
      name: form.name,
      gender: form.gender,
      birthDate: form.birthDate,
      birthTime: form.birthTime,
      birthPlace: form.birthPlace,
      regionCode: selectedRegion.code,
      regionName: selectedRegion.name,
      longitude: selectedRegion.longitude,
      latitude: selectedRegion.latitude,
      timezoneName: selectedRegion.timezoneName,
      gmtOffsetMinutes: selectedRegion.gmtOffsetMinutes,
    })
    
    if (res.code === 0) {
      ElMessage.success('保存成功')
    } else {
      ElMessage.error(res.message || '保存失败')
    }
  } catch (err) {
    console.error('保存失败:', err)
    ElMessage.error('保存失败，请重试')
  } finally {
    saving.value = false
  }
}

onMounted(() => {
  // 如果已登录，获取用户信息
  if (userStore.token && !userStore.userInfo) {
    userStore.fetchUserInfo()
  }
})
</script>

<style lang="scss" scoped>
.paipan-input-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #fdf6e3 0%, #f5f0e8 100%);
  padding: 40px 20px;
}

.header {
  text-align: center;
  margin-bottom: 30px;

  h1 {
    font-size: 28px;
    margin: 0 0 8px;
  }

  .subtitle {
    color: #999;
    font-size: 14px;
    margin: 0;
  }
}

.form-container {
  max-width: 500px;
  margin: 0 auto;
  background: #fff;
  border-radius: 12px;
  padding: 30px 24px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
}

.birth-date-input {
  width: 100%;

  :deep(.el-input__wrapper) {
    cursor: pointer;
  }

  :deep(.el-input__inner) {
    cursor: pointer;
  }
}

.region-meta {
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 0 10px 12px 80px;
  color: #777;
  font-size: 13px;
}

.lunar-info {
  padding: 0 10px;
  margin-bottom: 10px;

  .lunar-detail {
    display: flex;
    flex-direction: column;
    gap: 6px;
    color: #666;
    font-size: 14px;
  }
}

.login-tip {
  text-align: center;
  color: #999;
  font-size: 14px;
  padding: 10px 0;

  .link {
    color: #b2955d;
    text-decoration: none;
    margin-left: 5px;

    &:hover {
      text-decoration: underline;
    }
  }
}

.submit-btn {
  width: 100%;
  height: 44px;
  font-size: 16px;
}

.main-bg {
  background-color: #b2955d;
  border-color: #b2955d;

  &:hover {
    background-color: #a0844d;
    border-color: #a0844d;
  }
}
</style>

<style lang="scss">
.birth-dialog-mask {
  position: fixed;
  inset: 0;
  z-index: 3000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 16px;
  background: rgba(0, 0, 0, 0.62);
}

.birth-dialog {
  width: min(390px, calc(100vw - 28px));
  padding: 12px 18px 18px;
  border-radius: 20px;
  background: #fff;
  box-shadow: 0 18px 60px rgba(0, 0, 0, 0.25);
}

.birth-dialog-header {
  display: grid;
  grid-template-columns: 42px 1fr 32px;
  align-items: center;
  gap: 10px;
  margin-bottom: 10px;
}

.today-btn,
.close-btn,
.calendar-tabs button,
.dialog-input-row button,
.dialog-confirm-btn,
.wheel-column button {
  border: 0;
  font: inherit;
  cursor: pointer;
}

.today-btn {
  width: 34px;
  height: 34px;
  border-radius: 50%;
  color: #fff;
  background: #b8b8b8;
  font-weight: 700;
}

.calendar-tabs {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  height: 34px;
  overflow: hidden;
  border: 1px solid #e0ddd8;
  border-radius: 18px;
  background: #fff;

  button {
    position: relative;
    color: #2d2d2d;
    background: transparent;
    font-size: 14px;
    font-weight: 600;

    & + button::before {
      position: absolute;
      top: 9px;
      left: 0;
      width: 1px;
      height: 16px;
      background: #e3dfd8;
      content: "";
    }

    &.active {
      margin: 1px;
      border-radius: 17px;
      color: #fff;
      background: #b89758;
    }

    &.active::before,
    &.active + button::before {
      display: none;
    }
  }
}

.region-dialog-header {
  grid-template-columns: 1fr 32px;
}

.region-tabs {
  width: 176px;
  justify-self: center;
  grid-template-columns: 1fr;
}

.region-search-row {
  display: flex;
  align-items: center;
  height: 36px;
  margin-bottom: 18px;
  padding: 0 12px;
  border-radius: 18px;
  color: #8eb99b;
  background: #d2ebd4;

  input {
    min-width: 0;
    flex: 1;
    height: 100%;
    border: 0;
    outline: none;
    color: #48564d;
    background: transparent;
    font-size: 13px;

    &::placeholder {
      color: #6f9f7d;
    }
  }
}

.region-labels {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  margin-bottom: 8px;
  color: #111;
  font-size: 15px;
  font-weight: 700;
  text-align: center;
}

.region-picker {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  height: 206px;
  overflow: hidden;
}

.region-column,
.region-search-results {
  height: 100%;
  overflow-y: auto;
  scrollbar-width: none;

  &::-webkit-scrollbar {
    display: none;
  }

  button {
    display: block;
    width: 100%;
    min-height: 42px;
    border: 0;
    color: #d0d0d0;
    background: transparent;
    font-size: 14px;
    font-weight: 500;
    text-align: center;
    cursor: pointer;
  }

  button.active {
    color: #2d2d2d;
    font-size: 18px;
    font-weight: 800;
  }
}

.region-search-results {
  height: 206px;

  button {
    color: #333;
    text-align: left;
    display: flex;
    flex-direction: column;
    justify-content: center;
    min-height: 52px;
    padding: 6px 12px;
    
    .search-result-path {
      word-break: break-all;
      line-height: 1.4;
      
      .highlight {
        color: #b89758;
        font-weight: 600;
      }
    }
  }
}

.region-empty {
  padding: 40px 0;
  color: #aaa;
  text-align: center;
}

.region-selected-card {
  display: grid;
  grid-template-columns: 1fr 1fr 70px;
  align-items: center;
  min-height: 46px;
  margin-top: 10px;
  padding: 0 12px;
  border-radius: 4px;
  background: #f4f4f4;
  color: #2b2b2b;
  font-size: 15px;

  strong {
    font-size: 18px;
  }

  span {
    text-align: center;
    font-weight: 700;
  }
}

.close-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 30px;
  height: 30px;
  color: #8a8a8a;
  background: transparent;
  font-size: 20px;
}

.dialog-input-row {
  display: grid;
  grid-template-columns: 1fr 64px;
  align-items: center;
  height: 36px;
  margin-bottom: 16px;
  overflow: hidden;
  border-radius: 18px;
  background: #d2ebd4;

  input {
    min-width: 0;
    height: 100%;
    padding: 0 12px;
    border: 0;
    outline: none;
    color: #48564d;
    background: transparent;
    font-size: 13px;

    &::placeholder {
      color: #8eb99b;
    }
  }

  button {
    height: 30px;
    margin-right: 3px;
    border-radius: 16px;
    color: #fff;
    background: #aeb4ba;
    font-weight: 700;
  }
}

.wheel-labels {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  margin-bottom: 6px;
  color: #111;
  font-size: 15px;
  font-weight: 700;
  text-align: center;
}

.wheel-wrap {
  position: relative;
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  height: 214px;
  overflow: hidden;
}

.wheel-highlight {
  position: absolute;
  top: 78px;
  right: 0;
  left: 0;
  height: 43px;
  border-radius: 3px;
  background: #f1f1f1;
  pointer-events: none;
}

.wheel-column {
  position: relative;
  z-index: 1;
  height: 100%;
  box-sizing: border-box;
  overflow-y: auto;
  padding: 79px 0 95px;
  scrollbar-width: none;

  &::-webkit-scrollbar {
    display: none;
  }

  button {
    display: block;
    width: 100%;
    height: 42px;
    padding: 0;
    color: #d3d3d3;
    background: transparent;
    font-size: 14px;
    font-weight: 500;
    text-align: center;
  }

  button.active {
    color: #2d2d2d;
    font-size: 19px;
    font-weight: 800;
  }
}

.dialog-confirm-btn {
  width: 100%;
  height: 52px;
  margin-top: 12px;
  border-radius: 26px;
  color: #efcf92;
  background: #0d0d0d;
  font-size: 17px;
  font-weight: 800;
}

@media (max-width: 420px) {
  .birth-dialog {
    padding-right: 14px;
    padding-left: 14px;
  }

  .wheel-column button {
    font-size: 13px;
  }

  .wheel-column button.active {
    font-size: 17px;
  }
}
</style>
