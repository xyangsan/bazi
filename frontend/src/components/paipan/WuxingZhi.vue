<template>
  <div class="pillar-cell" :class="colorClass">
    <span class="zhi-text">{{ zhi }}</span>
    <img v-if="showIcon" :src="wuxingIcon" class="wuxing-icon" />
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { getWuxingIcon, getWuxingColorClass, getZhiWuxing } from '@/utils/wuxing'

const props = defineProps({
  zhi: { type: String, default: '' },
  showIcon: { type: Boolean, default: true },
})

const wuxing = computed(() => getZhiWuxing(props.zhi))
const colorClass = computed(() => getWuxingColorClass(wuxing.value))
const wuxingIcon = computed(() => getWuxingIcon(wuxing.value))
</script>

<style lang="scss" scoped>
.pillar-cell {
  display: inline-flex;
  align-items: center;
  gap: 4px;

  .zhi-text {
    font-size: 16px;
    font-weight: bold;
  }

  .wuxing-icon {
    width: 14px;
    height: 14px;
  }
}
</style>
