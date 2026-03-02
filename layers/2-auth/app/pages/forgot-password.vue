<script setup lang="ts">
definePageMeta({ middleware: 'guest' })

const email = ref('')
const sent = ref(false)
const isLoading = ref(false)

async function handleSubmit() {
  isLoading.value = true

  try {
    // TODO: implementar endpoint /api/auth/forgot-password
    await new Promise(resolve => setTimeout(resolve, 1000))
    sent.value = true
  } finally {
    isLoading.value = false
  }
}
</script>

<template>
  <div class="flex min-h-screen items-center justify-center">
    <div class="w-full max-w-sm space-y-6">
      <div class="text-center">
        <h1 class="text-2xl font-bold">Recuperar senha</h1>
        <p class="text-muted-foreground">Insira seu email para receber o link de recuperação</p>
      </div>

      <div v-if="sent" class="rounded-md bg-primary/10 p-4 text-center text-sm">
        Se o email estiver cadastrado, você receberá um link de recuperação.
      </div>

      <form v-else class="space-y-4" @submit.prevent="handleSubmit">
        <div class="space-y-2">
          <label for="email" class="text-sm font-medium">Email</label>
          <input
            id="email"
            v-model="email"
            type="email"
            required
            autocomplete="email"
            class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            placeholder="seu@email.com"
          />
        </div>

        <button
          type="submit"
          :disabled="isLoading"
          class="inline-flex h-10 w-full items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground ring-offset-background transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50"
        >
          {{ isLoading ? 'Enviando...' : 'Enviar link' }}
        </button>
      </form>

      <div class="text-center">
        <NuxtLink to="/login" class="text-sm text-muted-foreground hover:underline">
          Voltar para login
        </NuxtLink>
      </div>
    </div>
  </div>
</template>
