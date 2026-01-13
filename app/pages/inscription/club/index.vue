<script setup lang="ts">
import type { InscriptionClubData } from '~/composables/useInscriptionClub'

definePageMeta({
  layout: false
})

const {
  state,
  currentStep,
  progress,
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
  <div class="w-[393px] min-h-screen bg-white max-w-full overflow-hidden flex flex-col items-center mx-auto">
    <!-- Header avec logo -->
    <div class="w-full bg-white flex items-center justify-center p-4 relative">
      <img
        class="w-[120px] h-auto object-cover"
        loading="lazy"
        alt="Logo Sportly"
        src="/Nouveau-logo-sportly-1Logo-1@2x.png"
      >
      <!-- Barre de progression dynamique -->
      <div class="absolute bottom-0 left-0 w-full h-[2px] bg-gray-200">
        <div class="h-full bg-[#ef781e] transition-all duration-300" :style="{ width: `${progress}%` }" />
      </div>
    </div>

    <!-- Contenu principal -->
    <div class="w-full flex-1 flex flex-col gap-8 px-4 pb-8 pt-4">
      <!-- Bouton Retour -->
      <div class="flex items-center gap-2 cursor-pointer" @click="prevStep">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M15 18L9 12L15 6" stroke="black" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
        </svg>
        <span class="text-base text-black font-roboto">Retour</span>
      </div>

      <!-- Contenu dynamique selon l'étape -->
      <Transition name="slide" mode="out-in">
        <InscriptionClubStep1Sports
          v-if="currentStep === 1"
          :selected-sports="state.data.sports"
          @update:selected-sports="handleSportsUpdate"
          @next="nextStep"
        />
        <InscriptionClubStep2ClubInfo
          v-else-if="currentStep === 2"
          :data="state.data"
          @update="handleUpdate"
          @next="nextStep"
        />
        <InscriptionClubStep3PersonalInfo
          v-else-if="currentStep === 3"
          :data="state.data"
          :is-loading="state.isLoading"
          @update="handleUpdate"
          @submit="handleSubmit"
        />
      </Transition>
    </div>
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
