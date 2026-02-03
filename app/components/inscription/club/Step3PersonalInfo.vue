<script setup lang="ts">
import { z } from 'zod'
import type { FormSubmitEvent } from '@nuxt/ui'
import type { InscriptionClubData } from '~/composables/useInscriptionClub'

const props = defineProps<{
  data: InscriptionClubData
  isLoading: boolean
}>()

const emit = defineEmits<{
  update: [key: keyof InscriptionClubData, value: string]
  submit: []
}>()

const schema = z.object({
  firstName: z.string().min(2, 'Le prénom doit contenir au moins 2 caractères'),
  lastName: z.string().min(2, 'Le nom doit contenir au moins 2 caractères'),
  email: z.string().email('Adresse email invalide'),
  phone: z.string().min(10, 'Numéro de téléphone invalide'),
  password: z.string().min(8, 'Le mot de passe doit contenir au moins 8 caractères'),
  confirmPassword: z.string().min(8, 'La confirmation est requise')
}).refine(data => data.password === data.confirmPassword, {
  message: 'Les mots de passe ne correspondent pas',
  path: ['confirmPassword']
})

type Schema = z.output<typeof schema>

const state = reactive<Schema>({
  firstName: props.data.firstName,
  lastName: props.data.lastName,
  email: props.data.email,
  phone: props.data.phone,
  password: props.data.password,
  confirmPassword: props.data.confirmPassword
})

watch(() => props.data, (newData) => {
  state.firstName = newData.firstName
  state.lastName = newData.lastName
  state.email = newData.email
  state.phone = newData.phone
  state.password = newData.password
  state.confirmPassword = newData.confirmPassword
}, { deep: true })

watch(state, (newState) => {
  emit('update', 'firstName', newState.firstName)
  emit('update', 'lastName', newState.lastName)
  emit('update', 'email', newState.email)
  emit('update', 'phone', newState.phone)
  emit('update', 'password', newState.password)
  emit('update', 'confirmPassword', newState.confirmPassword)
}, { deep: true })

function onSubmit(_event: FormSubmitEvent<Schema>) {
  emit('submit')
}
</script>

<template>
  <UForm :schema="schema" :state="state" class="flex flex-col gap-8" @submit="onSubmit">
    <!-- Titre et sous-titre -->
    <div class="flex flex-col gap-2">
      <h1 class="text-[30px] font-semibold text-[#1c1c1c] leading-[45px] tracking-tight font-asap">
        Informations personnelles
      </h1>
      <p class="text-base text-[#545454] leading-6 font-roboto">
        Créez votre compte pour gérer votre club
      </p>
    </div>

    <!-- Formulaire -->
    <div class="flex flex-col gap-6">
      <!-- Prénom et Nom -->
      <div class="grid grid-cols-2 gap-4">
        <UFormField label="Prénom" name="firstName" required>
          <UInput
            v-model="state.firstName"
            placeholder="Prénom"
            class="w-full"
            size="lg"
          />
        </UFormField>

        <UFormField label="Nom" name="lastName" required>
          <UInput
            v-model="state.lastName"
            placeholder="Nom"
            class="w-full"
            size="lg"
          />
        </UFormField>
      </div>

      <!-- Adresse e-mail -->
      <UFormField label="Adresse e-mail" name="email" required>
        <UInput
          v-model="state.email"
          type="email"
          placeholder="Adresse e-mail"
          class="w-full"
          size="lg"
          icon="i-heroicons-envelope"
        />
      </UFormField>

      <!-- Numéro de téléphone -->
      <UFormField label="Numéro de téléphone" name="phone" required>
        <UInput
          v-model="state.phone"
          type="tel"
          placeholder="Numéro de téléphone"
          class="w-full"
          size="lg"
          icon="i-heroicons-phone"
        />
      </UFormField>

      <!-- Mot de passe -->
      <UFormField label="Mot de passe" name="password" required>
        <UInput
          v-model="state.password"
          type="password"
          placeholder="Mot de passe"
          class="w-full"
          size="lg"
          icon="i-heroicons-lock-closed"
        />
      </UFormField>

      <!-- Confirmation du mot de passe -->
      <UFormField
        label="Confirmation du mot de passe"
        name="confirmPassword"
        required
        help="Cela doit être une combinaison d'au moins 8 lettres, chiffres et symboles."
      >
        <UInput
          v-model="state.confirmPassword"
          type="password"
          placeholder="Confirmation du mot de passe"
          class="w-full"
          size="lg"
          icon="i-heroicons-lock-closed"
        />
      </UFormField>
    </div>

    <!-- Bouton Continuer -->
    <UButton
      type="submit"
      block
      :loading="isLoading"
      class="bg-tango-500! hover:bg-tango-600! text-white! font-semibold! font-montserrat! text-base! rounded-[50px]! py-3!"
    >
      Continuer
    </UButton>
  </UForm>
</template>

<style scoped>
.font-asap {
  font-family: 'Asap', sans-serif;
}

.font-roboto {
  font-family: 'Roboto', sans-serif;
}

.font-montserrat {
  font-family: 'Montserrat', sans-serif;
}
</style>
