<script setup lang="ts">
import type { FormSubmitEvent } from '@nuxt/ui'
import { z } from 'zod'
import type { InscriptionParticulierData } from '~/composables/useInscriptionParticulier'

const props = defineProps<{
  data: InscriptionParticulierData
  isLoading: boolean
}>()

const emit = defineEmits<{
  update: [key: keyof InscriptionParticulierData, value: any]
  next: []
}>()

const showPassword = ref(false)

const form = useTemplateRef('form')

const schema = z.object({
  firstName: z.string().min(2, 'Le prénom doit contenir au moins 2 caractères'),
  lastName: z.string().min(2, 'Le nom doit contenir au moins 2 caractères'),
  email: z.string().email('Adresse email invalide'),
  password: z
    .string()
    .min(8, 'Le mot de passe doit contenir au moins 8 caractères')
    .regex(/[A-Z]/, 'Le mot de passe doit contenir au moins une majuscule')
    .regex(/\d/, 'Le mot de passe doit contenir au moins un chiffre')
})

const formState = reactive({
  firstName: props.data.firstName,
  lastName: props.data.lastName,
  email: props.data.email,
  password: props.data.password
})

watch(formState, (newVal) => {
  emit('update', 'firstName', newVal.firstName)
  emit('update', 'lastName', newVal.lastName)
  emit('update', 'email', newVal.email)
  emit('update', 'password', newVal.password)
}, { deep: true })

type Schema = z.output<typeof schema>

const onSubmit = (_event: FormSubmitEvent<Schema>) => {
  emit('next')
}

const submitFormExternalButton = () => {
  form.value?.submit()
}
</script>

<template>
  <div class="flex flex-col flex-1 min-h-0">
    <!-- Contenu principal -->
    <div class="flex flex-col gap-6">
      <!-- Badge Compte Particulier -->
      <div class="flex items-center gap-2">
        <UBadge
          variant="soft"
          size="lg"
          icon="i-heroicons-user"
          label="Compte Particulier"
          aria-label="Compte Particulier"
          :ui="{
            base: 'bg-tango-50 px-4 py-2 rounded-full',
            label: 'text-tango-700 font-medium',
            leadingIcon: 'text-tango-500'
          }"
        />
      </div>

      <!-- Titre et sous-titre -->
      <div>
        <h2 class="text-xl font-semibold text-gray-900">
          Créez votre compte
        </h2>
        <p class="mt-1 text-sm text-gray-500">
          Quelques informations pour personnaliser votre expérience
        </p>
      </div>

      <!-- Formulaire -->
      <UForm ref="form" :schema="schema" :state="formState" class="space-y-5" @submit="onSubmit">
        <!-- Prénom et Nom -->
        <div class="grid grid-cols-2 gap-4">
          <UFormField label="Prénom" name="firstName">
            <UInput
              v-model="formState.firstName"
              placeholder="Alex"
              :disabled="isLoading"
            />
          </UFormField>

          <UFormField label="Nom" name="lastName">
            <UInput
              v-model="formState.lastName"
              placeholder="Martin"
              :disabled="isLoading"
            />
          </UFormField>
        </div>

        <!-- Email -->
        <UFormField label="Adresse e-mail" name="email">
          <UInput
            v-model="formState.email"
            type="email"
            placeholder="alex.martin@exemple.fr"
            icon="i-heroicons-envelope"
            :disabled="isLoading"
            class="w-full"
          />
        </UFormField>

        <!-- Mot de passe -->
        <UFormField
          label="Mot de passe"
          name="password"
          help="Au moins 8 caractères avec majuscule et chiffre"
        >
          <UInput
            v-model="formState.password"
            :type="showPassword ? 'text' : 'password'"
            placeholder="••••••••"
            icon="i-heroicons-lock-closed"
            :disabled="isLoading"
            class="w-full"
          >
            <template #trailing>
              <UButton
                variant="ghost"
                size="xs"
                color="neutral"
                :icon="showPassword ? 'i-heroicons-eye-slash' : 'i-heroicons-eye'"
                @click="showPassword = !showPassword"
              />
            </template>
          </UInput>
        </UFormField>
      </UForm>
    </div>

    <!-- Spacer flexible -->
    <div class="flex-1" />

    <!-- Section basse avec conditions et bouton -->
    <div class="flex flex-col gap-4">
      <!-- Conditions d'utilisation -->
      <p class="text-center text-xs text-gray-500">
        En continuant, vous acceptez nos
        <NuxtLink to="#" class="text-tango-500 underline">
          conditions d'utilisation
        </NuxtLink>
        et notre
        <NuxtLink to="#" class="text-tango-500 underline">
          politique de confidentialité
        </NuxtLink>
      </p>

      <!-- Bouton Continuer -->
      <UButton
        type="submit"
        block
        size="lg"
        :loading="isLoading"
        :disabled="isLoading"
        class="bg-tango-500 hover:bg-tango-600 rounded-full"
        @click="submitFormExternalButton"
      >
        Continuer
      </UButton>
    </div>
  </div>
</template>
