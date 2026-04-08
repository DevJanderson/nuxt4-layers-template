<script setup lang="ts">
defineProps<{
  title: string
  description: string
  errorCode: string
  showHomeLink?: boolean
  buttonLabel?: string
}>()

const emit = defineEmits<{
  action: []
}>()
</script>

<template>
  <div class="flex flex-col items-center gap-12">
    <!-- Info -->
    <div class="flex max-w-md flex-col items-center gap-4 text-center">
      <h1 class="text-3xl font-semibold text-primary-950">
        {{ title }}
      </h1>

      <p class="text-base leading-relaxed text-secondary-900">
        {{ description }}
        <template v-if="showHomeLink">
          <a href="/" class="text-primary-950 underline" @click.prevent="emit('action')"
            >vá para a home</a
          >.
        </template>
      </p>

      <p class="text-xs text-secondary-900">
        {{ errorCode }}
      </p>
    </div>

    <!-- Ilustração: robô + losango -->
    <div class="relative flex h-92 w-full max-w-124 items-center justify-center">
      <div class="size-60 -rotate-45 rounded-pill bg-primary-900" />
      <NuxtImg
        src="/illustrations/error-robot.webp"
        alt="Robô de erro"
        class="absolute bottom-0 h-79.5 w-auto drop-shadow-[0_4px_0_rgba(0,0,0,0.1)]"
      />
    </div>

    <!-- Botão CTA -->
    <Button variant="outline" size="lg" @click="emit('action')">
      {{ buttonLabel || 'ir para início' }}
      <Icon name="lucide:arrow-right" class="size-6" />
    </Button>
  </div>
</template>
