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

// OTP verification state
const showOtpModal = ref(false)
const otpCode = ref('')
const otpLoading = ref(false)
const otpError = ref<string | null>(null)

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

// Step 1: Send OTP when form is submitted
async function handleSubmit() {
  state.value.isLoading = true
  state.value.error = null

  try {
    // Send OTP to verify email
    const response = await $fetch('/api/auth/send-otp', {
      method: 'POST',
      body: {
        email: state.value.data.email,
        firstName: state.value.data.firstName
      }
    })

    if (response.success) {
      showOtpModal.value = true
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

// Step 2: Verify OTP
async function handleVerifyOtp() {
  if (otpCode.value.length !== 6) {
    otpError.value = 'Le code doit contenir 6 chiffres'
    return
  }

  otpLoading.value = true
  otpError.value = null

  try {
    const response = await $fetch('/api/auth/verify-otp', {
      method: 'POST',
      body: {
        email: state.value.data.email,
        code: otpCode.value
      }
    })

    if (response.success) {
      state.value.verificationId = response.verificationId
      state.value.emailVerified = true
      showOtpModal.value = false

      // Proceed to create club
      await handleCreateClub()
    }
  } catch (error: unknown) {
    console.error('Verify OTP error:', error)
    otpError.value = error && typeof error === 'object' && 'data' in error
      ? (error.data as { message?: string })?.message || 'Code invalide'
      : 'Code invalide'
  } finally {
    otpLoading.value = false
  }
}

// Step 3: Create club account
async function handleCreateClub() {
  state.value.isLoading = true

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
      toast.add({
        title: 'Club créé !',
        description: 'Votre club a été créé avec succès',
        color: 'success'
      })

      // Navigate to offer selection
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
  } finally {
    state.value.isLoading = false
  }
}

// Resend OTP
async function handleResendOtp() {
  otpLoading.value = true
  otpError.value = null

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
    otpCode.value = ''
  } catch (error: unknown) {
    console.error('Resend OTP error:', error)
    otpError.value = error && typeof error === 'object' && 'data' in error
      ? (error.data as { message?: string })?.message || 'Une erreur est survenue'
      : 'Une erreur est survenue'
  } finally {
    otpLoading.value = false
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

    <!-- OTP Verification Modal -->
    <UModal v-model:open="showOtpModal">
      <template #content>
        <div class="p-6">
          <div class="flex flex-col items-center gap-6">
            <div class="text-5xl">
              📧
            </div>

            <div class="text-center">
              <h2 class="text-xl font-semibold text-gray-900 mb-2">
                Vérifiez votre email
              </h2>
              <p class="text-gray-600">
                Un code de vérification a été envoyé à
                <span class="font-medium">{{ state.data.email }}</span>
              </p>
            </div>

            <div class="w-full max-w-xs">
              <UFormField label="Code de vérification" :error="otpError || undefined">
                <UInput
                  v-model="otpCode"
                  placeholder="000000"
                  class="w-full text-center text-2xl tracking-widest"
                  size="xl"
                  maxlength="6"
                  inputmode="numeric"
                  pattern="[0-9]*"
                />
              </UFormField>
            </div>

            <div class="flex flex-col gap-3 w-full max-w-xs">
              <UButton
                block
                :loading="otpLoading"
                :disabled="otpCode.length !== 6"
                class="bg-tango-500! hover:bg-tango-600! text-white! font-semibold! rounded-[50px]! py-3!"
                @click="handleVerifyOtp"
              >
                Vérifier
              </UButton>

              <button
                type="button"
                class="text-sm text-gray-500 hover:text-gray-700 underline"
                :disabled="otpLoading"
                @click="handleResendOtp"
              >
                Renvoyer le code
              </button>
            </div>
          </div>
        </div>
      </template>
    </UModal>
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
