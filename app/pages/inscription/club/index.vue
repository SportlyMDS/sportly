<script setup lang="ts">
import type { InscriptionClubData } from '~/composables/useInscriptionClub'

definePageMeta({
  layout: false,
  middleware: 'guest'
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
const { fetchSession } = useAuth()

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

// Step 4 → 5: Send OTP then move to OTP step
async function handleSubmit() {
  state.value.isLoading = true
  state.value.error = null

  try {
    const response = await $fetch('/api/auth/send-otp', {
      method: 'POST',
      body: {
        email: state.value.data.email,
        firstName: state.value.data.firstName
      }
    })

    if (response.success) {
      nextStep()
      toast.add({
        title: 'Code envoyé',
        description: 'Un code de vérification a été envoyé à votre adresse email',
        color: 'success'
      })
    }
  } catch (error: unknown) {
    console.error('Send OTP error:', error)
    const errorMessage = error && typeof error === 'object' && 'data' in error
      ? (error.data as { message?: string })?.message || 'Une erreur est survenue'
      : 'Une erreur est survenue'
    toast.add({
      title: 'Erreur',
      description: errorMessage,
      color: 'error'
    })
  } finally {
    state.value.isLoading = false
  }
}

// Step 5: Verify OTP then create club
async function handleVerifyAndCreate(code: string) {
  state.value.isLoading = true
  state.value.error = null

  try {
    const verifyResponse = await $fetch('/api/auth/verify-otp', {
      method: 'POST',
      body: {
        email: state.value.data.email,
        code
      }
    })

    if (verifyResponse.success) {
      state.value.verificationId = verifyResponse.verificationId
      state.value.emailVerified = true
      await handleCreateClub()
    }
  } catch (error: unknown) {
    console.error('Verify OTP error:', error)
    const errorMessage = error && typeof error === 'object' && 'data' in error
      ? (error.data as { message?: string })?.message || 'Code invalide'
      : 'Code invalide'
    toast.add({
      title: 'Erreur',
      description: errorMessage,
      color: 'error'
    })
  } finally {
    state.value.isLoading = false
  }
}

// Create club account
async function handleCreateClub() {
  try {
    const response = await $fetch<{ success: boolean, clubId: string }>('/api/clubs', {
      method: 'POST',
      body: {
        verificationId: state.value.verificationId,
        sports: state.value.data.sports,
        clubName: state.value.data.clubName,
        website: state.value.data.website,
        description: state.value.data.description,
        postalCode: state.value.data.postalCode,
        city: state.value.data.city,
        address: state.value.data.address,
        firstName: state.value.data.firstName,
        lastName: state.value.data.lastName,
        phone: state.value.data.phone,
        password: state.value.data.password
      }
    })

    if (response.success) {
      state.value.clubId = response.clubId
      await fetchSession()
      toast.add({
        title: 'Club créé !',
        description: 'Votre club a été créé avec succès',
        color: 'success'
      })

      await navigateTo('/inscription/club/offre')
    }
  } catch (error: unknown) {
    console.error('Create club error:', error)
    const errorMessage = error && typeof error === 'object' && 'data' in error
      ? (error.data as { message?: string })?.message || 'Une erreur est survenue'
      : 'Une erreur est survenue'
    toast.add({
      title: 'Erreur',
      description: errorMessage,
      color: 'error'
    })
  }
}

// Resend OTP
async function handleResendOtp() {
  try {
    await $fetch('/api/auth/send-otp', {
      method: 'POST',
      body: {
        email: state.value.data.email,
        firstName: state.value.data.firstName
      }
    })

    toast.add({
      title: 'Code renvoyé',
      description: 'Un nouveau code a été envoyé à votre adresse email',
      color: 'success'
    })
  } catch (error: unknown) {
    console.error('Resend OTP error:', error)
    const errorMessage = error && typeof error === 'object' && 'data' in error
      ? (error.data as { message?: string })?.message || 'Une erreur est survenue'
      : 'Une erreur est survenue'
    toast.add({
      title: 'Erreur',
      description: errorMessage,
      color: 'error'
    })
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
        <InscriptionClubStep4OTP
          v-else-if="currentStep === 5"
          :data="state.data"
          :is-loading="state.isLoading"
          @next="handleVerifyAndCreate"
          @resend="handleResendOtp"
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
