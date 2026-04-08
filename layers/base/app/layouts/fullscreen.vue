<template>
  <div class="bg-background">
    <a
      href="#main-content"
      class="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-9999 focus:rounded-md focus:bg-background focus:px-4 focus:py-2 focus:text-sm focus:font-medium focus:shadow-lg focus:ring-2 focus:ring-primary-800"
    >
      Pular para o conteúdo principal
    </a>
    <CommonAppHeader />
    <main id="main-content" class="flex h-[calc(100dvh-64px)] flex-col">
      <slot />
    </main>
    <CommonAppFooter />
  </div>
</template>
