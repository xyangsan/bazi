import { defineStore } from 'pinia'
import { ref } from 'vue'

export const usePaipanStore = defineStore('paipan', () => {
  // 排盘输入信息
  const inputInfo = ref({
    name: '',
    gender: 1,
    birthDate: '',
    birthTime: '',
    birthPlace: '',
  })

  // 排盘结果
  const result = ref(null)

  // 当前选中的大运索引
  const currentDayunIndex = ref(0)

  // 当前选中的流年索引
  const currentLiunianIndex = ref(0)

  // 当前选中的流月索引
  const currentLiuyueIndex = ref(0)

  // 当前选中的流日索引
  const currentLiuriIndex = ref(0)

  // 当前选中的流时索引
  const currentLiushiIndex = ref(0)

  // 设置输入信息
  function setInputInfo(info) {
    inputInfo.value = { ...info }
  }

  // 设置排盘结果
  function setResult(data) {
    result.value = data
  }

  // 重置
  function reset() {
    inputInfo.value = { name: '', gender: 1, birthDate: '', birthTime: '', birthPlace: '' }
    result.value = null
    currentDayunIndex.value = 0
    currentLiunianIndex.value = 0
    currentLiuyueIndex.value = 0
    currentLiuriIndex.value = 0
    currentLiushiIndex.value = 0
  }

  return {
    inputInfo,
    result,
    currentDayunIndex,
    currentLiunianIndex,
    currentLiuyueIndex,
    currentLiuriIndex,
    currentLiushiIndex,
    setInputInfo,
    setResult,
    reset,
  }
})
