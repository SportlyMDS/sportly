<template>
  <div class="flex flex-col h-dvh bg-white">
    <!-- Header avec logo et progression -->
    <header class="shrink-0">
      <!-- Logo centré -->
      <div class="flex justify-center px-4 py-4">
        <img src="/long-logo.png" alt="Sportly" class="h-7">
      </div>

      <!-- Progress bar pleine largeur, très fine -->
      <UProgress
        :model-value="currentStep"
        :max="4"
        size="2xs"
        :ui="{
          base: 'bg-white',
          indicator: 'bg-tango-500'
        }"
      />

      <!-- Navigation retour -->
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

    <!-- Contenu de l'étape - prend tout l'espace restant -->
    <main class="flex-1 flex flex-col min-h-0 px-4 pb-8">
      <Transition name="slide" mode="out-in">
        <InscriptionParticulierStep1
          v-if="currentStep === 2"
          :data="state.data"
          :is-loading="state.isLoading"
          @update="handleUpdate"
          @next="handleStep1Submit"
        />
        <InscriptionParticulierStep2
          v-else-if="currentStep === 3"
          :data="state.data"
          :is-loading="state.isLoading"
          @update="handleUpdate"
          @next="handleStep2Submit"
          @resend="handleResendCode"
        />
        <InscriptionParticulierStep3
          v-else-if="currentStep === 4"
          :data="state.data"
          :is-loading="state.isLoading"
          @update="handleUpdate"
          @submit="handleFinalSubmit"
        />
      </Transition>
    </main>
  </div>
</template>

<script setup lang="ts">
import type { InscriptionParticulierData } from '~/composables/useInscriptionParticulier'

definePageMeta({
  middleware: 'guest',
  layout: false
})

useSeoMeta({
  title: 'Inscription Particulier - Sportly',
  description: 'Créez votre compte particulier sur Sportly.'
})

const router = useRouter()

const {
  state,
  currentStep,
  prevStep,
  nextStep,
  updateData
} = useInscriptionParticulier()

const handleBack = () => {
  if (currentStep.value === 2) {
    router.push('/inscription')
  } else {
    prevStep()
  }
}

const toast = useToast()

// Gestion des mises à jour de données
const handleUpdate = <K extends keyof InscriptionParticulierData>(
  key: K,
  value: InscriptionParticulierData[K]
) => {
  updateData(key, value)
}

// Step 1: Envoi du code OTP
const handleStep1Submit = async () => {
  state.value.isLoading = true
  state.value.error = null

  try {
    await $fetch('/api/auth/send-otp', {
      method: 'POST',
      body: {
        email: state.value.data.email,
        firstName: state.value.data.firstName
      }
    })

    toast.add({
      title: 'Code envoyé',
      description: `Un code de vérification a été envoyé à ${state.value.data.email}`,
      color: 'success'
    })

    nextStep()
  } catch (error: any) {
    const message = error.data?.message || 'Une erreur est survenue lors de l\'envoi du code'
    toast.add({
      title: 'Erreur',
      description: message,
      color: 'error'
    })
  } finally {
    state.value.isLoading = false
  }
}

// Step 2: Vérification email
const handleStep2Submit = async () => {
  state.value.isLoading = true
  state.value.error = null

  try {
    const result = await $fetch<{ success: boolean, message: string, verificationId: string }>('/api/auth/verify-otp', {
      method: 'POST',
      body: {
        email: state.value.data.email,
        code: state.value.data.verificationCode
      }
    })

    state.value.data.emailVerified = true
    state.value.data.verificationId = result.verificationId

    toast.add({
      title: 'Email vérifié',
      description: 'Votre adresse email a été vérifiée avec succès',
      color: 'success'
    })

    nextStep()
  } catch (error: any) {
    console.error('Erreur vérification:', error)
    const message = error.data?.message || 'Le code de vérification est incorrect'
    toast.add({
      title: 'Code invalide',
      description: message,
      color: 'error'
    })
  } finally {
    state.value.isLoading = false
  }
}

// Renvoyer le code
const handleResendCode = async () => {
  state.value.isLoading = true

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
      description: `Un nouveau code a été envoyé à ${state.value.data.email}`,
      color: 'success'
    })
  } catch (error: any) {
    console.error('Erreur renvoi code:', error)
    const message = error.data?.message || 'Impossible de renvoyer le code'
    toast.add({
      title: 'Erreur',
      description: message,
      color: 'error'
    })
  } finally {
    state.value.isLoading = false
  }
}

// Step 3: Finalisation
const handleFinalSubmit = async () => {
  state.value.isLoading = true
  state.value.error = null

  try {
    await $fetch('/api/auth/complete-registration', {
      method: 'POST',
      body: {
        verificationId: state.value.data.verificationId,
        firstName: state.value.data.firstName,
        lastName: state.value.data.lastName,
        password: state.value.data.password,
        address: state.value.data.address,
        latitude: state.value.data.latitude,
        longitude: state.value.data.longitude,
        searchRadius: state.value.data.searchRadius
      }
    })

    toast.add({
      title: 'Inscription réussie !',
      description: 'Bienvenue sur Sportly !',
      color: 'success'
    })

    // Rediriger vers l'application
    await navigateTo('/app/user')
  } catch (error) {
    console.error('Erreur finalisation:', error)
    toast.add({
      title: 'Erreur',
      description: 'Une erreur est survenue lors de la finalisation',
      color: 'error'
    })
  } finally {
    state.value.isLoading = false
  }
}
</script>

<style scoped>
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
