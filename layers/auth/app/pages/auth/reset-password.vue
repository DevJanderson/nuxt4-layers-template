<script setup lang="ts">
definePageMeta({
  layout: false
})

useSeoPage({
  title: 'Recuperar Senha'
})
</script>

<template>
  <main class="flex min-h-screen items-center justify-center bg-base-50 px-4 py-6 sm:py-12">
    <div class="w-full max-w-md">
      <div class="mb-6 sm:mb-8">
        <AuthBrand />
      </div>

      <Card>
        <CardHeader class="space-y-1 text-center">
          <CardTitle class="text-xl">Recuperar senha</CardTitle>
          <CardDescription> Enviaremos instruções para seu email </CardDescription>
        </CardHeader>

        <CardContent>
          <AuthResetPasswordForm />
        </CardContent>
      </Card>

      <div class="mt-6">
        <AuthFooter />
      </div>
    </div>
  </main>
</template>
