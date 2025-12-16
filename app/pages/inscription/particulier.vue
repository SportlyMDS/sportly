<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Header avec logo et progression -->
    <div class="bg-white">
      <!-- Logo centré -->
      <div class="max-w-2xl mx-auto px-4 py-4">
        <div class="flex justify-center">
          <img src="/long-logo.png" alt="Sportly" class="h-8">
        </div>
      </div>

      <!-- Progress bar pleine largeur, très fine -->
      <UProgress
        :model-value="currentStep"
        :max="3"
        size="2xs"
        :ui="{
          base: 'bg-white',
          indicator: 'bg-tango-500'
        }"
      />

      <!-- Navigation et étapes -->
      <div class="max-w-2xl mx-auto px-4 py-4">
        <UButton
          class="text-gray-500"
          variant="ghost"
          icon="i-heroicons-arrow-left"
          :to="currentStep === 1 ? '/inscription' : undefined"
          @click="currentStep > 1 && prevStep()"
        >
          Retour
        </UButton>
      </div>
    </div>

    <!-- Contenu de l'étape -->
    <div class="max-w-2xl mx-auto px-4 py-8 bg-white">
      <Transition name="slide" mode="out-in">
        <InscriptionStep1
          v-if="currentStep === 1"
          :data="state.data"
          :is-loading="state.isLoading"
          @update="handleUpdate"
          @next="handleStep1Submit"
        />
        <InscriptionStep2
          v-else-if="currentStep === 2"
          :data="state.data"
          :is-loading="state.isLoading"
          @update="handleUpdate"
          @next="handleStep2Submit"
          @resend="handleResendCode"
        />
        <InscriptionStep3
          v-else-if="currentStep === 3"
          :data="state.data"
          :is-loading="state.isLoading"
          @update="handleUpdate"
          @submit="handleFinalSubmit"
        />
      </Transition>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { InscriptionParticulierData } from '~/composables/useInscription'

definePageMeta({
  middleware: 'guest',
  layout: false
})

useSeoMeta({
  title: 'Inscription Particulier - Sportly',
  description: 'Créez votre compte particulier sur Sportly.'
})

const {
  state,
  currentStep,
  prevStep,
  nextStep,
  updateData
} = useInscription()

const toast = useToast()

// Gestion des mises à jour de données
const handleUpdate = <K extends keyof InscriptionParticulierData>(
  key: K,
  value: InscriptionParticulierData[K]
) => {
  updateData(key, value)
}

// Step 1: Création du compte
const handleStep1Submit = async () => {
  state.value.isLoading = true
  state.value.error = null

  try {
    // TODO: Appel API pour créer le compte
    // await $fetch('/api/auth/signup', {
    //   method: 'POST',
    //   body: {
    //     firstName: state.value.data.firstName,
    //     lastName: state.value.data.lastName,
    //     email: state.value.data.email,
    //     password: state.value.data.password
    //   }
    // })

    // Simuler l'envoi du code de vérification
    console.log('Compte créé, code envoyé à:', state.value.data.email)

    toast.add({
      title: 'Code envoyé',
      description: `Un code de vérification a été envoyé à ${state.value.data.email}`,
      color: 'success'
    })

    nextStep()
  } catch (error) {
    console.error('Erreur création compte:', error)
    toast.add({
      title: 'Erreur',
      description: 'Une erreur est survenue lors de la création du compte',
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
    // TODO: Appel API pour vérifier le code
    // await $fetch('/api/auth/verify-email', {
    //   method: 'POST',
    //   body: {
    //     email: state.value.data.email,
    //     code: state.value.data.verificationCode
    //   }
    // })

    // Simuler la vérification
    console.log('Code vérifié:', state.value.data.verificationCode)
    state.value.data.emailVerified = true

    toast.add({
      title: 'Email vérifié',
      description: 'Votre adresse email a été vérifiée avec succès',
      color: 'success'
    })

    nextStep()
  } catch (error) {
    console.error('Erreur vérification:', error)
    toast.add({
      title: 'Code invalide',
      description: 'Le code de vérification est incorrect',
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
    // TODO: Appel API pour renvoyer le code
    // await $fetch('/api/auth/resend-code', {
    //   method: 'POST',
    //   body: { email: state.value.data.email }
    // })

    console.log('Code renvoyé à:', state.value.data.email)

    toast.add({
      title: 'Code renvoyé',
      description: `Un nouveau code a été envoyé à ${state.value.data.email}`,
      color: 'success'
    })
  } catch (error) {
    console.error('Erreur renvoi code:', error)
    toast.add({
      title: 'Erreur',
      description: 'Impossible de renvoyer le code',
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
    // TODO: Appel API pour finaliser l'inscription
    // await $fetch('/api/auth/complete-registration', {
    //   method: 'POST',
    //   body: {
    //     email: state.value.data.email,
    //     address: state.value.data.address,
    //     latitude: state.value.data.latitude,
    //     longitude: state.value.data.longitude,
    //     searchRadius: state.value.data.searchRadius
    //   }
    // })

    console.log('Inscription finalisée:', state.value.data)

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
