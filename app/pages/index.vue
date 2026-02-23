<script setup lang="ts">
import { useAuth } from '~/composables/useAuth'

definePageMeta({
  middleware: ['guest'],
  layout: 'auth'
})

const { signIn } = useAuth()
const isLoggingIn = ref(false)

const handleQuickLogin = async () => {
  isLoggingIn.value = true
  try {
    const { fetchSession } = useAuth()
    const { error } = await signIn.email({
      email: 'louis.floquet+3@proton.me',
      password: '', // à mettre le mot de passe /!\
      fetchOptions: {
        onSuccess: async () => {
          await fetchSession()
        }
      }
    })

    if (error) throw error

    await navigateTo('/dashboard/user')
  } catch (error) {
    console.error('Quick login failed:', error)
  } finally {
    isLoggingIn.value = false
  }
}

const heroImage = '/sportif.png'
const decorativeShape = '/decorativeShape.png'
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
          class="absolute top-0 left-0 w-full h-full object-contain object-top opacity-40"
        >
        <!-- Soccer player image -->
        <img
          :src="heroImage"
          alt="Sportif en action"
          class="absolute -top-[52px] -left-[163px] w-[478px] h-[449px] object-cover"
        >
      </div>

      <!-- Text Content -->
      <div class="relative z-10 w-full mt-[380px]">
        <h1 class="font-bold italic text-4xl leading-[44px] tracking-[-0.72px] text-[#212121]" style="font-family: 'Asap', sans-serif;">
          BOUGEZ PLUS, CHERCHEZ MOINS
        </h1>
        <p class="text-base leading-6 text-[#212121]">
          Découvrez votre prochain sport, grâce à Sportly
        </p>
      </div>

      <!-- Buttons -->
      <div class="relative z-10 w-full flex flex-col gap-2">
        <DevOnly>
          <UButton
            color="primary"
            variant="solid"
            block
            size="lg"
            class="rounded-full h-10 mb-2"
            :loading="isLoggingIn"
            @click="handleQuickLogin"
          >
            Quick Login (Dev)
          </UButton>
        </DevOnly>
        <UButton
          to="/auth/login"
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
