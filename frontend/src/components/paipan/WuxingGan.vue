<template>
  <div class="wuxing-gan" :class="colorClass">
    <span class="gan-text">{{ gan }}</span>
    <img v-if="showIcon" :src="wuxingIcon" class="wuxing-icon" />
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { getWuxingIcon, getWuxingColorClass, getGanWuxing } from '@/utils/wuxing'

const props = defineProps({
  gan: { type: String, default: '' },
  showIcon: { type: Boolean, default: true },
})

const wuxing = computed(() => getGanWuxing(props.gan))
const colorClass = computed(() => getWuxingColorClass(wuxing.value))
const wuxingIcon = computed(() => getWuxingIcon(wuxing.value))
</script>

<style lang="scss" scoped>
.wuxing-gan {
  display: inline-flex;
  align-items: center;
  gap: 4px;

  .gan-text {
    font-size: 16px;
    font-weight: bold;
  }

  .wuxing-icon {
    width: 14px;
    height: 14px;
  }
}
</style>
