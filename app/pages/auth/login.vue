<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
    <div class="max-w-md w-full space-y-8">
      <!-- Header -->
      <div class="text-center">
        <h1 class="text-3xl font-bold text-gray-900 dark:text-white">
          Sportly
        </h1>
        <p class="mt-2 text-sm text-gray-600 dark:text-gray-400">
          Connectez-vous à votre compte
        </p>
      </div>

      <!-- Sélection du type de compte -->
      <div class="flex justify-center">
        <UButtonGroup size="sm" orientation="horizontal">
          <UButton
            :variant="accountType === 'USER' ? 'solid' : 'outline'"
            icon="i-heroicons-user"
            @click="accountType = 'USER'"
          >
            Utilisateur
          </UButton>
          <UButton
            :variant="accountType === 'CLUB' ? 'solid' : 'outline'"
            icon="i-heroicons-building-office"
            @click="accountType = 'CLUB'"
          >
            Club
          </UButton>
        </UButtonGroup>
      </div>

      <!-- Formulaire de connexion -->
      <UCard class="p-6">
        <UForm :schema="loginSchema" :state="loginForm" class="space-y-4" @submit="handleLogin">
          <UFormGroup label="Email" name="email" required>
            <UInput
              v-model="loginForm.email"
              type="email"
              placeholder="votre@email.com"
              icon="i-heroicons-envelope"
              :disabled="isLoading"
            />
          </UFormGroup>

          <UFormGroup label="Mot de passe" name="password" required>
            <UInput
              v-model="loginForm.password"
              :type="showPassword ? 'text' : 'password'"
              placeholder="Votre mot de passe"
              icon="i-heroicons-lock-closed"
              :disabled="isLoading"
            >
              <template #trailing>
                <UButton
                  variant="ghost"
                  size="xs"
                  :icon="showPassword ? 'i-heroicons-eye-slash' : 'i-heroicons-eye'"
                  @click="showPassword = !showPassword"
                />
              </template>
            </UInput>
          </UFormGroup>

          <div class="flex items-center justify-between">
            <UCheckbox v-model="loginForm.remember" label="Se souvenir de moi" />
            <UButton variant="link" size="xs" to="/auth/forgot-password">
              Mot de passe oublié ?
            </UButton>
          </div>

          <UButton type="submit" block size="lg" :loading="isLoading" :disabled="isLoading">
            Se connecter
          </UButton>
        </UForm>

        <!-- Séparateur -->
        <div class="relative my-6">
          <div class="absolute inset-0 flex items-center">
            <div class="w-full border-t border-gray-300 dark:border-gray-700" />
          </div>
          <div class="relative flex justify-center text-sm">
            <span class="px-2 bg-white dark:bg-gray-800 text-gray-500">ou</span>
          </div>
        </div>

        <!-- Lien vers l'inscription -->
        <div class="text-center">
          <p class="text-sm text-gray-600 dark:text-gray-400">
            Pas encore de compte ?
            <UButton variant="link" size="sm" to="/inscription">
              S'inscrire
            </UButton>
          </p>
        </div>
      </UCard>

      <!-- Modal d'inscription -->
      <UModal v-model="showSignup">
        <UCard>
          <template #header>
            <div class="flex items-center justify-between">
              <h3 class="text-lg font-semibold">
                Créer un compte {{ accountType === 'USER' ? 'utilisateur' : 'club' }}
              </h3>
              <UButton variant="ghost" icon="i-heroicons-x-mark" @click="showSignup = false" />
            </div>
          </template>

          <UForm :schema="signupSchema" :state="signupForm" class="space-y-4" @submit="handleSignup">
            <UFormGroup :label="accountType === 'USER' ? 'Nom complet' : 'Nom du club'" name="name" required>
              <UInput
                v-model="signupForm.name"
                :placeholder="accountType === 'USER' ? 'Jean Dupont' : 'Mon Club de Sport'"
                icon="i-heroicons-user"
                :disabled="isLoading"
              />
            </UFormGroup>

            <UFormGroup label="Email" name="email" required>
              <UInput
                v-model="signupForm.email"
                type="email"
                placeholder="votre@email.com"
                icon="i-heroicons-envelope"
                :disabled="isLoading"
              />
            </UFormGroup>

            <UFormGroup label="Mot de passe" name="password" required>
              <UInput
                v-model="signupForm.password"
                :type="showSignupPassword ? 'text' : 'password'"
                placeholder="Minimum 8 caractères"
                icon="i-heroicons-lock-closed"
                :disabled="isLoading"
              >
                <template #trailing>
                  <UButton
                    variant="ghost"
                    size="xs"
                    :icon="showSignupPassword ? 'i-heroicons-eye-slash' : 'i-heroicons-eye'"
                    @click="showSignupPassword = !showSignupPassword"
                  />
                </template>
              </UInput>
            </UFormGroup>

            <UFormGroup label="Confirmer le mot de passe" name="confirmPassword" required>
              <UInput
                v-model="signupForm.confirmPassword"
                :type="showSignupPassword ? 'text' : 'password'"
                placeholder="Confirmez votre mot de passe"
                icon="i-heroicons-lock-closed"
                :disabled="isLoading"
              />
            </UFormGroup>

            <UCheckbox v-model="signupForm.acceptTerms" required>
              <template #label>
                J'accepte les
                <UButton variant="link" size="xs">
                  conditions d'utilisation
                </UButton>
                et la
                <UButton variant="link" size="xs">
                  politique de confidentialité
                </UButton>
              </template>
            </UCheckbox>

            <UButton type="submit" block size="lg" :loading="isLoading" :disabled="isLoading">
              Créer mon compte
            </UButton>
          </UForm>
        </UCard>
      </UModal>
    </div>
  </div>
</template>

<script setup lang="ts">
import { z } from 'zod'
import { useAuth } from '~/composables/useAuth'

// Middleware pour les invités uniquement
definePageMeta({
  middleware: 'guest',
  layout: false
})

// SEO
useSeoMeta({
  title: 'Connexion - Sportly',
  description: 'Connectez-vous à votre compte Sportly pour accéder à vos événements sportifs.'
})

// Composables
const { signIn, signUp } = useAuth()
const toast = useToast()

// État réactif
const accountType = ref<'USER' | 'CLUB'>('USER')
const showPassword = ref(false)
const showSignupPassword = ref(false)
const showSignup = ref(false)
const isLoading = ref(false)

// Formulaires
const loginForm = reactive({
  email: '',
  password: '',
  remember: false
})

const signupForm = reactive({
  name: '',
  email: '',
  password: '',
  confirmPassword: '',
  acceptTerms: false
})

// Schémas de validation
const loginSchema = z.object({
  email: z.string().email('Email invalide'),
  password: z.string().min(1, 'Mot de passe requis'),
  remember: z.boolean().optional()
})

const signupSchema = z.object({
  name: z.string().min(2, 'Le nom doit contenir au moins 2 caractères'),
  email: z.string().email('Email invalide'),
  password: z.string().min(8, 'Le mot de passe doit contenir au moins 8 caractères'),
  confirmPassword: z.string(),
  acceptTerms: z.boolean().refine(val => val === true, 'Vous devez accepter les conditions')
}).refine(data => data.password === data.confirmPassword, {
  message: 'Les mots de passe ne correspondent pas',
  path: ['confirmPassword']
})

// Actions
const handleLogin = async (data: any) => {
  isLoading.value = true

  try {
    await signIn.email(data.email, data.password)

    // Si on arrive ici, la connexion a réussi
    toast.add({
      title: 'Connexion réussie',
      description: 'Vous êtes maintenant connecté.',
      color: 'success'
    })

    // La redirection est gérée par le middleware guest
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

const handleSignup = async (data: any) => {
  isLoading.value = true

  try {
    await signUp.email({
      email: data.email,
      password: data.password,
      name: data.name
    })

    // Si on arrive ici, l'inscription a réussi
    toast.add({
      title: 'Compte créé avec succès',
      description: 'Votre compte a été créé. Vous êtes maintenant connecté.',
      color: 'success'
    })

    showSignup.value = false
    // La redirection est gérée par le middleware guest
  } catch {
    toast.add({
      title: 'Erreur lors de la création du compte',
      description: 'Une erreur est survenue lors de la création du compte',
      color: 'error'
    })
  } finally {
    isLoading.value = false
  }
}

// Réinitialiser les formulaires quand on change de type de compte
watch(accountType, () => {
  Object.assign(loginForm, { email: '', password: '', remember: false })
  Object.assign(signupForm, { name: '', email: '', password: '', confirmPassword: '', acceptTerms: false })
  showSignupPassword.value = false
})
</script>
