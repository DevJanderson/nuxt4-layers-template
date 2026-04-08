<script setup lang="ts">
const authStore = useAuthStore()

// Form state
const email = ref('')
const isSubmitted = ref(false)
const successMessage = ref('')

// Validação reativa via Value Object
const { isValid: isValidEmail, error: emailError } = useVoField(email, tryCreateEmail)

// Computed
const canSubmit = computed(() => email.value.trim() && !authStore.isLoading)

// Methods
async function handleSubmit() {
  if (!canSubmit.value || !isValidEmail.value) return

  const result = await authStore.resetPassword({
    email: email.value.trim()
  })

  if (result.success) {
    isSubmitted.value = true
    successMessage.value = result.message
  }
}

function resetForm() {
  email.value = ''
  isSubmitted.value = false
  successMessage.value = ''
  authStore.clearError()
}
</script>

<template>
  <div>
    <!-- Estado de sucesso -->
    <div v-if="isSubmitted" class="space-y-4 text-center">
      <div class="flex justify-center">
        <div class="rounded-full bg-success-100 p-3">
          <Icon name="lucide:check-circle" class="size-8 text-success-600" />
        </div>
      </div>

      <div class="space-y-2">
        <h3 class="text-lg font-semibold">Email enviado!</h3>
        <p class="text-sm text-muted-foreground">
          {{ successMessage }}
        </p>
      </div>

      <div class="space-y-2">
        <NuxtLink to="/auth/login">
          <Button variant="outline" class="w-full">
            <Icon name="lucide:arrow-left" class="mr-2 size-4" />
            Voltar para o login
          </Button>
        </NuxtLink>

        <Button variant="ghost" class="w-full" @click="resetForm"> Enviar para outro email </Button>
      </div>
    </div>

    <!-- Formulário -->
    <form v-else class="space-y-4" @submit.prevent="handleSubmit">
      <!-- Erro -->
      <Alert v-if="authStore.error" variant="destructive">
        <AlertDescription>{{ authStore.error }}</AlertDescription>
      </Alert>

      <p class="text-sm text-muted-foreground">
        Digite seu email cadastrado. Enviaremos um link para redefinir sua senha.
      </p>

      <!-- Email -->
      <div class="space-y-2">
        <Label for="email">Email</Label>
        <Input
          id="email"
          v-model="email"
          type="email"
          placeholder="seu@email.com"
          autocomplete="email"
          :disabled="authStore.isLoading"
          :aria-invalid="email && !isValidEmail ? true : undefined"
          :aria-describedby="email && !isValidEmail ? 'email-error' : undefined"
        />
        <p
          v-if="email && !isValidEmail"
          id="email-error"
          role="alert"
          class="text-sm text-danger-600"
        >
          {{ emailError }}
        </p>
      </div>

      <!-- Botão submit -->
      <Button type="submit" class="w-full" :disabled="!canSubmit || !isValidEmail">
        <Icon v-if="authStore.isLoading" name="lucide:loader-2" class="mr-2 size-4 animate-spin" />
        <Icon v-else name="lucide:mail" class="mr-2 size-4" />
        Enviar link de recuperação
      </Button>

      <!-- Link voltar -->
      <div class="text-center">
        <NuxtLink to="/auth/login" class="text-sm text-secondary-800 hover:underline">
          Voltar para o login
        </NuxtLink>
      </div>
    </form>
  </div>
</template>
