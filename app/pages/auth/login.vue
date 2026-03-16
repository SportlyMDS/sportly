<template>
  <div class="min-h-screen flex flex-col bg-white px-4 pb-8">
    <!-- Logo -->
    <div class="flex items-center justify-center py-4">
      <img src="/long-logo.png" alt="Sportly" class="h-7 w-auto">
    </div>

    <!-- Content -->
    <div class="flex-1 flex flex-col items-center justify-center">
      <div class="w-full max-w-[360px] flex flex-col gap-6">
        <!-- Header -->
        <div class="text-center space-y-2">
          <h1 class="text-[30px] font-semibold text-black leading-[45px]" style="font-family: 'Asap', sans-serif;">
            Bienvenue sur Sportly
          </h1>
          <p class="text-base text-[#4a5565]">
            Connectez-vous ou créez un compte
          </p>
        </div>

        <!-- Social Buttons -->
        <div class="flex flex-col gap-3">
          <UButton
            block
            size="xl"
            color="neutral"
            variant="outline"
            class="rounded-full h-12"
            :ui="{
              base: 'justify-center border-2 border-[#e5e7eb]'
            }"
            @click="handleGoogleLogin"
          >
            <template #leading>
              <img src="https://www.google.com/favicon.ico" alt="Google" class="size-4">
            </template>
            Continuer avec Google
          </UButton>

          <UButton
            block
            size="xl"
            color="neutral"
            variant="outline"
            class="rounded-full h-12"
            :ui="{
              base: 'justify-center border-2 border-[#e5e7eb]'
            }"
            @click="handleFacebookLogin"
          >
            <template #leading>
              <UIcon name="i-simple-icons-facebook" class="size-4 text-[#1877F2]" />
            </template>
            Continuer avec Facebook
          </UButton>
        </div>

        <!-- Separator -->
        <div class="flex items-center gap-4">
          <div class="flex-1 h-px bg-[#d6d6d6]" />
          <span class="text-sm text-[#99a1af]">ou</span>
          <div class="flex-1 h-px bg-[#d6d6d6]" />
        </div>

        <!-- Form -->
        <UForm :schema="loginSchema" :state="loginForm" class="flex flex-col gap-4" @submit="handleLogin">
          <UInput
            v-model="loginForm.email"
            type="email"
            placeholder="Adresse e-mail"
            icon="i-lucide-mail"
            size="xl"
            variant="soft"
            :disabled="isLoading"
            :ui="{
              base: 'rounded-full h-12 bg-[#f7f7f7] border-2 border-[#e5e7eb] pl-12',
              leading: 'pl-4'
            }"
          />

          <UInput
            v-model="loginForm.password"
            :type="showPassword ? 'text' : 'password'"
            placeholder="Mot de passe"
            icon="i-lucide-lock"
            size="xl"
            variant="soft"
            :disabled="isLoading"
            :ui="{
              base: 'rounded-full h-12 bg-[#f7f7f7] border-2 border-[#e5e7eb] pl-12',
              leading: 'pl-4',
              trailing: 'pr-2'
            }"
          >
            <template #trailing>
              <UButton
                color="neutral"
                variant="ghost"
                size="sm"
                :icon="showPassword ? 'i-lucide-eye-off' : 'i-lucide-eye'"
                class="rounded-full"
                @click="showPassword = !showPassword"
              />
            </template>
          </UInput>

          <UButton
            type="submit"
            block
            size="lg"
            class="rounded-full h-10"
            :loading="isLoading"
            :disabled="isLoading"
          >
            Connexion
          </UButton>
        </UForm>

        <!-- Sign up link -->
        <div class="flex items-center justify-center gap-1">
          <span class="text-sm text-[#6a7282]">Pas de compte ?</span>
          <UButton
            variant="link"
            class="text-primary underline font-medium p-0"
            to="/inscription"
          >
            Créer un compte
          </UButton>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { z } from 'zod'
import { useAuth } from '~/composables/useAuth'

definePageMeta({
  middleware: 'guest',
  layout: false
})

useSeoMeta({
  title: 'Connexion - Sportly',
  description: 'Connectez-vous à votre compte Sportly pour accéder à vos événements sportifs.'
})

const { signIn } = useAuth()
const toast = useToast()

const showPassword = ref(false)
const isLoading = ref(false)

const loginForm = reactive({
  email: '',
  password: ''
})

const loginSchema = z.object({
  email: z.string().email('Email invalide'),
  password: z.string().min(1, 'Mot de passe requis')
})

const handleLogin = async (_data: any) => {
  isLoading.value = true

  try {
    const { fetchSession } = useAuth()
    const result = await signIn.email({
      email: loginForm.email,
      password: loginForm.password,
      fetchOptions: {
        onSuccess: async () => {
          await fetchSession()
        }
      }
    })

    if (result.error) throw result.error

    toast.add({
      title: 'Connexion réussie',
      description: 'Vous êtes maintenant connecté.',
      color: 'success'
    })

    await fetchSession()
    window.location.href = '/'
  } catch {
    toast.add({
      title: 'Erreur de connexion',
      description: 'Email ou mot de passe incorrect',
      color: 'error'
    })
  } finally {
    isLoading.value = false
  }
}

const handleGoogleLogin = () => {
  signIn.social({ provider: 'google', callbackURL: '/dashboard/user' })
}

const handleFacebookLogin = () => {
  signIn.social({ provider: 'facebook', callbackURL: '/dashboard/user' })
}
</script>
