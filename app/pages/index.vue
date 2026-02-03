<script setup lang="ts">
definePageMeta({
  middleware: ['guest'],
  layout: 'auth'
})

const heroImage = 'https://www.figma.com/api/mcp/asset/487fd4ec-a6bc-40c6-ba97-fd4da9f402ca'
const decorativeShape = 'https://www.figma.com/api/mcp/asset/c9abe182-a7aa-4c6d-a3d6-f70b5068ff20'
</script>

<template>
  <div class="flex-1 flex flex-col bg-white px-4 pb-8">
    <!-- Logo -->
    <div class="flex items-center justify-center py-4">
      <img src="/long-logo.png" alt="Sportly" class="h-7 w-auto">
    </div>

    <!-- Hero Section -->
    <div class="flex-1 flex flex-col justify-end gap-16 relative">
      <!-- Decorative Shape + Hero Image -->
      <div class="absolute top-0 left-[-16px] right-[-16px] h-[450px]">
        <!-- Orange decorative shape -->
        <img
          :src="decorativeShape"
          alt=""
          class="absolute top-0 left-0 w-full h-full object-contain object-top"
        >
        <!-- Soccer player image -->
        <img
          :src="heroImage"
          alt="Sportif en action"
          class="absolute -top-[30px] -left-[100px] w-[420px] h-auto object-contain"
        >
      </div>

      <!-- Text Content -->
      <div class="relative z-10 w-full mt-[380px]">
        <h1 class="font-bold text-4xl leading-[44px] tracking-[-0.72px] text-[#212121]" style="font-family: 'Asap', sans-serif;">
          BOUGEZ PLUS, CHERCHEZ MOINS
        </h1>
        <p class="text-base leading-6 text-[#212121]">
          Découvrez votre prochain sport, grâce à Sportly
        </p>
      </div>

      <!-- Buttons -->
      <div class="relative z-10 w-full flex flex-col gap-2">
        <UButton
          to="/login"
          block
          size="lg"
          class="rounded-full h-10"
        >
          Connexion
        </UButton>
        <UButton
          to="/inscription"
          block
          size="lg"
          variant="outline"
          class="rounded-full h-10"
        >
          S'inscrire
        </UButton>
      </div>
    </div>
  </div>
</template>
