<template>
  <div class="min-h-screen flex flex-col bg-white">
    <!-- Header with logo -->
    <header class="sticky top-0 bg-white z-10">
      <div class="flex items-center justify-between p-4">
        <NuxtLink to="/">
          <img src="/long-logo.png" alt="Sportly" class="h-7 w-auto">
        </NuxtLink>
      </div>
      <!-- Progress bar -->
      <div class="h-[2px] bg-transparent">
        <div class="h-full w-1/4 bg-tango-500" />
      </div>
    </header>

    <!-- Main content -->
    <main class="flex-1 flex flex-col px-4 pb-8 pt-4">
      <!-- Back button -->
      <button
        type="button"
        class="flex items-center gap-2 text-gray-900 mb-8"
        @click="$router.back()"
      >
        <UIcon name="i-heroicons-chevron-left" class="size-6" />
        <span class="text-base">Retour</span>
      </button>

      <!-- Title section -->
      <div class="text-center mb-8">
        <h1 class="text-3xl font-semibold text-gray-900 font-['Asap']">
          Qui êtes-vous ?
        </h1>
        <p class="mt-2 text-base text-gray-500">
          Choisissez le type de profil qui vous correspond
        </p>
      </div>

      <!-- Profile type selection -->
      <div class="flex flex-col gap-4 mb-8">
        <CardCheckbox
          v-model="isParticulier"
          title="Particulier"
          description="Je recherche des activités sportives près de chez moi"
          icon="i-heroicons-user"
          @update:model-value="handleParticulierSelect"
        />

        <CardCheckbox
          v-model="isClub"
          title="Club / Salle"
          description="Je propose des activités et gère mes réservations"
          icon="i-heroicons-building-office-2"
          @update:model-value="handleClubSelect"
        />
      </div>

      <!-- Spacer -->
      <div class="flex-1" />

      <!-- Continue button -->
      <UButton
        block
        size="lg"
        :disabled="!selectedType"
        class="rounded-full"
        @click="continueToNextStep"
      >
        Continuer
      </UButton>
    </main>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  middleware: 'guest',
  layout: false
})

useSeoMeta({
  title: 'Inscription - Sportly',
  description: 'Créez votre compte Sportly et rejoignez la communauté sportive.'
})

const isParticulier = ref(false)
const isClub = ref(false)

const selectedType = computed(() => {
  if (isParticulier.value) return 'particulier'
  if (isClub.value) return 'club'
  return null
})

const handleParticulierSelect = (value: boolean | 'indeterminate') => {
  if (value === true) {
    isClub.value = false
  }
}

const handleClubSelect = (value: boolean | 'indeterminate') => {
  if (value === true) {
    isParticulier.value = false
  }
}

const continueToNextStep = () => {
  if (selectedType.value) {
    navigateTo({
      path: `/inscription/${selectedType.value}`,
      query: { step: '1' }
    })
  }
}
</script>
