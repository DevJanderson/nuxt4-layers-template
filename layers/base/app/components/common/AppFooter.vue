<script setup lang="ts">
const appConfig = useAppConfig()
const currentYear = new Date().getFullYear()
const copyright = computed(() => appConfig.footer.copyright.replace('{year}', String(currentYear)))
</script>

<template>
  <footer class="bg-secondary-950 px-6 py-12 text-base-200">
    <div class="mx-auto max-w-7xl">
      <!-- Logo -->
      <NuxtImg
        v-if="appConfig.brand.logo.light"
        :src="appConfig.brand.logo.light"
        alt="Logo"
        class="mb-8 h-8"
      />

      <!-- Links -->
      <div v-if="appConfig.footer.links.length" class="mb-8 flex flex-wrap gap-6">
        <NuxtLink
          v-for="link in appConfig.footer.links"
          :key="link.to"
          :to="link.to"
          class="text-sm text-base-400 transition hover:text-base-200"
        >
          {{ link.label }}
        </NuxtLink>
      </div>

      <!-- Social -->
      <div v-if="appConfig.footer.social.length" class="mb-8 flex gap-4">
        <a
          v-for="social in appConfig.footer.social"
          :key="social.href"
          :href="social.href"
          target="_blank"
          rel="noopener noreferrer"
          :aria-label="social.label"
          class="text-base-400 transition hover:text-base-200"
        >
          <Icon :name="social.icon" class="size-5" />
        </a>
      </div>

      <!-- Bottom bar -->
      <div class="border-t border-base-800 pt-6">
        <p class="text-xs text-base-500">{{ copyright }}</p>
        <p v-if="appConfig.footer.address" class="mt-1 text-xs text-base-600">
          {{ appConfig.footer.address }}
        </p>
      </div>
    </div>
  </footer>
</template>
