<script setup lang="ts">
/**
 * Página de logout
 * Realiza logout e redireciona para login
 */

definePageMeta({
  layout: false
})

useSeoPage({
  title: 'Saindo...'
})

const authStore = useAuthStore()
const router = useRouter()

// Timeout de 10 segundos para logout
const LOGOUT_TIMEOUT = 10000
let timeoutId: ReturnType<typeof setTimeout> | null = null

onMounted(async () => {
  try {
    const timeoutPromise = new Promise<never>((_, reject) => {
      timeoutId = setTimeout(() => reject(new Error('Timeout')), LOGOUT_TIMEOUT)
    })

    await Promise.race([authStore.logout(), timeoutPromise])
  } catch {
    // Timeout ou erro - redireciona mesmo assim
  } finally {
    if (timeoutId) clearTimeout(timeoutId)
    router.replace(AUTH_ROUTES.LOGIN)
  }
})

onUnmounted(() => {
  if (timeoutId) clearTimeout(timeoutId)
})
</script>

<template>
  <main class="flex min-h-screen items-center justify-center bg-base-50">
    <div class="text-center">
      <div
        class="mb-4 h-8 w-8 animate-spin rounded-full border-4 border-primary-200 border-t-primary-900 mx-auto"
      />
      <p class="text-muted-foreground">Saindo...</p>
    </div>
  </main>
</template>
