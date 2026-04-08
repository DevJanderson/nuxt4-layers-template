<script setup lang="ts">
const authStore = useAuthStore()
</script>

<template>
  <template v-if="authStore.isInitialized">
    <AuthUserMenu v-if="authStore.isAuthenticated" />
    <NuxtLink v-else :to="AUTH_ROUTES.LOGIN">
      <Button variant="brand-outline" size="brand-md">
        <Icon name="lucide:user" class="size-4" />
        <span class="hidden sm:inline">Login</span>
      </Button>
    </NuxtLink>
  </template>
</template>
