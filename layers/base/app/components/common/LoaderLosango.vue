<script setup lang="ts">
const { size = 'md' } = defineProps<{
  size?: 'sm' | 'md' | 'lg'
}>()

const sizes = {
  sm: {
    container: 'size-[84px]',
    outer: 'size-[60px] rounded-[10px]',
    middle: 'size-[24px] rounded-[6px]',
    inner: 'size-[4px] rounded-[2px]'
  },
  md: {
    container: 'size-[168px]',
    outer: 'size-[119px] rounded-[20px]',
    middle: 'size-[48px] rounded-[12px]',
    inner: 'size-[8px] rounded-[4px]'
  },
  lg: {
    container: 'size-[252px]',
    outer: 'size-[178px] rounded-[30px]',
    middle: 'size-[72px] rounded-[18px]',
    inner: 'size-[12px] rounded-[6px]'
  }
}
</script>

<template>
  <div :class="['relative', sizes[size].container]">
    <!-- Losango externo (rosa claro) -->
    <div class="absolute inset-0 flex items-center justify-center">
      <div class="-rotate-45">
        <div :class="['bg-primary-100 loader-breathe', sizes[size].outer]" />
      </div>
    </div>

    <!-- Losango médio (coral) -->
    <div class="absolute inset-0 flex items-center justify-center">
      <div class="-rotate-45">
        <div :class="['bg-primary-900 loader-pulse', sizes[size].middle]" />
      </div>
    </div>

    <!-- Losango central (coral, pequeno) -->
    <div class="absolute inset-0 flex items-center justify-center">
      <div class="-rotate-45">
        <div :class="['bg-primary-900 loader-pulse-delay', sizes[size].inner]" />
      </div>
    </div>
  </div>
</template>

<style scoped>
.loader-breathe {
  animation: breathe 2.5s ease-in-out infinite;
}

.loader-pulse {
  animation: pulse-scale 2.5s ease-in-out infinite;
}

.loader-pulse-delay {
  animation: pulse-scale 2.5s ease-in-out infinite 0.3s;
}

@keyframes breathe {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}

@keyframes pulse-scale {
  0%,
  100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.15);
  }
}
</style>
