<script setup lang="ts">
import type { InscriptionClubData } from '~/composables/useInscriptionClub'

definePageMeta({
  layout: false
})

const {
  state,
  currentStep,
  totalSteps,
  prevStep,
  nextStep,
  updateData
} = useInscriptionClub()

const toast = useToast()

// Update sports array
function handleSportsUpdate(sports: string[]) {
  updateData('sports', sports)
}

// Handle data updates from step components
function handleUpdate(key: keyof InscriptionClubData, value: string) {
  updateData(key, value as InscriptionClubData[typeof key])
}

function handleBack() {
  if (currentStep.value === 2) {
    navigateTo('/inscription')
  } else {
    prevStep()
  }
}

// Handle final submission
async function handleSubmit() {
  state.value.isLoading = true
  state.value.error = null

  try {
    // TODO: API call to register
    console.log('Registration data:', state.value.data)

    toast.add({
      title: 'Inscription réussie !',
      description: 'Bienvenue sur Sportly !',
      color: 'success'
    })

    await navigateTo('/app/club')
  } catch (error) {
    console.error('Registration error:', error)
    toast.add({
      title: 'Erreur',
      description: 'Une erreur est survenue lors de l\'inscription',
      color: 'error'
    })
  } finally {
    state.value.isLoading = false
  }
}
</script>

<template>
  <div class="flex flex-col h-dvh bg-white">
    <header class="shrink-0">
      <div class="flex justify-center px-4 py-4">
        <img src="/long-logo.png" alt="Sportly" class="h-7">
      </div>

      <UProgress
        :model-value="currentStep"
        :max="totalSteps"
        size="2xs"
        :ui="{
          base: 'bg-white',
          indicator: 'bg-tango-500'
        }"
      />

      <div class="px-4 py-4">
        <UButton
          class="text-gray-500"
          variant="ghost"
          icon="i-heroicons-arrow-left"
          @click="handleBack"
        >
          Retour
        </UButton>
      </div>
    </header>

    <main class="flex-1 flex flex-col min-h-0 px-4 pb-8">
      <!-- Contenu dynamique selon l'étape -->
      <Transition name="slide" mode="out-in">
        <InscriptionClubStep1Sports
          v-if="currentStep === 2"
          :selected-sports="state.data.sports"
          @update:selected-sports="handleSportsUpdate"
          @next="nextStep"
        />
        <InscriptionClubStep2ClubInfo
          v-else-if="currentStep === 3"
          :data="state.data"
          @update="handleUpdate"
          @next="nextStep"
        />
        <InscriptionClubStep3PersonalInfo
          v-else-if="currentStep === 4"
          :data="state.data"
          :is-loading="state.isLoading"
          @update="handleUpdate"
          @submit="handleSubmit"
        />
      </Transition>
    </main>
  </div>
</template>

<style scoped>
.font-roboto {
  font-family: 'Roboto', sans-serif;
}

.slide-enter-active,
.slide-leave-active {
  transition: all 0.3s ease;
}

.slide-enter-from {
  opacity: 0;
  transform: translateX(30px);
}

.slide-leave-to {
  opacity: 0;
  transform: translateX(-30px);
}
</style>
