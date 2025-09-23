<script setup lang="ts">
import * as z from 'zod'
import type { FormSubmitEvent, TabsItem } from '@nuxt/ui'

definePageMeta({
  middleware: ['guest'],
  layout: 'auth'
})

const auth = useAuth()
const toast = useToast()
const loading = ref(false)

const items = ref<TabsItem[]>([
  {
    label: 'Se connecter',
    slot: 'signin'
  },
  {
    label: 'S\'inscrire',
    slot: 'signup'
  }
])

const signInFields = [
  {
    name: 'email',
    type: 'text' as const,
    label: 'Email',
    placeholder: 'Entrez votre email',
    required: true
  }, {
    name: 'password',
    label: 'Mot de passe',
    type: 'password' as const,
    placeholder: 'Entrez votre mot de passe',
    required: true
  }
]

const signUpFields = [
  ...signInFields,
  {
    name: 'name',
    label: 'Nom',
    placeholder: 'Entrez votre nom',
    required: true
  }
]

const providers = [
  {
    label: 'GitHub',
    icon: 'i-simple-icons-github',
    onClick: () => {
      auth.signIn.social({ provider: 'github', callbackURL: '/app/user' })
    }
  }
]

const signInSchema = z.object({
  email: z.string().email('Email invalide'),
  password: z.string().min(8, 'Doit contenir au moins 8 caractères')
})

const signUpSchema = z.object({
  ...signInSchema.shape,
  name: z.string().min(1, 'Le nom est requis')
})

type SignInSchema = z.output<typeof signInSchema>
type SignUpSchema = z.output<typeof signUpSchema>

async function onSignIn(payload: FormSubmitEvent<SignInSchema>) {
  try {
    loading.value = true
    const { data, error } = await auth.signIn.email({
      email: payload.data.email,
      password: payload.data.password
    })
    if (data) {
      toast.add({
        title: 'Connexion réussie',
        color: 'success'
      })
      await navigateTo('/app/user')
    } else {
      toast.add({
        title: error.message,
        color: 'error'
      })
    }
  } catch (error: any) {
    toast.add({
      title: error.message,
      color: 'error'
    })
  } finally {
    loading.value = false
  }
}

async function onSignUp(payload: FormSubmitEvent<SignUpSchema>) {
  try {
    loading.value = true
    const { data, error } = await auth.signUp.email({
      email: payload.data.email,
      password: payload.data.password,
      name: payload.data.name
    })
    if (data) {
      toast.add({
        title: 'Inscription réussie',
        color: 'success'
      })
      await navigateTo('/app/user')
    } else {
      toast.add({
        title: error.message,
        color: 'error'
      })
    }
  } catch (error: any) {
    toast.add({
      title: error.message,
      color: 'error'
    })
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="flex-1 flex flex-col items-center justify-center gap-4 p-4">
    <UPageCard class="relative w-full max-w-md bg-muted/20">
      <span class="cross absolute -bottom-px -left-px size-px" />
      <span class="cross absolute -bottom-px -right-px size-px" />
      <span class="cross absolute -left-px -top-px size-px" />
      <span class="cross absolute -right-px -top-px size-px" />
      <UTabs :items variant="link" :ui="{ list: 'mb-4' }">
        <template #signin>
          <UAuthForm
            :schema="signInSchema"
            title="Connexion"
            description="Entrez vos identifiants pour accéder à votre compte."
            :fields="signInFields"
            :providers
            :loading
            :ui="{
              title: 'text-left',
              description: 'text-left'
            }"
            @submit="onSignIn"
          />
        </template>
        <template #signup>
          <UAuthForm
            :schema="signUpSchema"
            title="Inscription"
            description="Créez un compte pour accéder à votre espace."
            :fields="signUpFields"
            :providers
            :ui="{
              title: 'text-left',
              description: 'text-left'
            }"
            @submit="onSignUp"
          />
        </template>
      </UTabs>
    </UPageCard>
  </div>
</template>
