<script setup lang="ts">
useSeoMeta({
  title: 'Sportly',
  description: 'Sportly - Votre plateforme de gestion de club'
})
</script>

<template>
  <UApp :toaster="{ expand: false }">
    <NuxtLoadingIndicator />
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
  </UApp>
</template>
