<script setup lang="ts">
interface Props {
  size?: 'sm' | 'default' | 'lg'
}

const props = withDefaults(defineProps<Props>(), {
  size: 'default'
})

const sizeClasses = {
  sm: 'py-4',
  default: 'py-12',
  lg: 'py-20'
}

const iconClasses = {
  sm: 'size-4',
  default: 'size-6',
  lg: 'size-8'
}
</script>

<template>
  <div :class="['flex items-center justify-center', sizeClasses[props.size]]">
    <Icon
      name="lucide:loader-2"
      :class="['animate-spin text-muted-foreground', iconClasses[props.size]]"
    />
  </div>
</template>
