<script setup lang="ts">
import { z } from 'zod'
import type { FormSubmitEvent } from '@nuxt/ui'
import type { InscriptionClubData } from '~/composables/useInscriptionClub'

const props = defineProps<{
  data: InscriptionClubData
}>()

const emit = defineEmits<{
  update: [key: keyof InscriptionClubData, value: string]
  next: []
}>()

const schema = z.object({
  clubName: z.string().min(2, 'Le nom du club doit contenir au moins 2 caractères'),
  website: z.string().url('URL invalide').optional().or(z.literal('')),
  description: z.string().min(10, 'La description doit contenir au moins 10 caractères'),
  postalCode: z.string().regex(/^\d{5}$/, 'Code postal invalide (5 chiffres)'),
  city: z.string().min(2, 'La ville doit contenir au moins 2 caractères'),
  address: z.string().min(5, 'L\'adresse doit contenir au moins 5 caractères')
})

type Schema = z.output<typeof schema>

const state = reactive<Schema>({
  clubName: props.data.clubName,
  website: props.data.website,
  description: props.data.description,
  postalCode: props.data.postalCode,
  city: props.data.city,
  address: props.data.address
})

watch(() => props.data, (newData) => {
  state.clubName = newData.clubName
  state.website = newData.website
  state.description = newData.description
  state.postalCode = newData.postalCode
  state.city = newData.city
  state.address = newData.address
}, { deep: true })

watch(state, (newState) => {
  emit('update', 'clubName', newState.clubName)
  emit('update', 'website', newState.website || '')
  emit('update', 'description', newState.description)
  emit('update', 'postalCode', newState.postalCode)
  emit('update', 'city', newState.city)
  emit('update', 'address', newState.address)
}, { deep: true })

function onSubmit(_event: FormSubmitEvent<Schema>) {
  emit('next')
}
</script>

<template>
  <UForm :schema="schema" :state="state" class="flex flex-col gap-8" @submit="onSubmit">
    <!-- Titre et sous-titre -->
    <div class="flex flex-col gap-2">
      <h1 class="text-[30px] font-semibold text-[#1c1c1c] leading-[45px] tracking-tight font-asap">
        Informations du club
      </h1>
      <p class="text-base text-[#545454] leading-6 font-roboto">
        Complétez les détails de votre établissement
      </p>
    </div>

    <!-- Formulaire -->
    <div class="flex flex-col gap-6">
      <!-- Nom du club -->
      <UFormField label="Nom du club" name="clubName" required>
        <UInput
          v-model="state.clubName"
          placeholder="Nom du club"
          class="w-full"
          size="lg"
        />
      </UFormField>

      <!-- Site web -->
      <UFormField label="Site web" name="website" hint="Optionnel">
        <UInput
          v-model="state.website"
          type="url"
          placeholder="https://monclub.fr"
          class="w-full"
          size="lg"
        />
      </UFormField>

      <!-- Description du club -->
      <UFormField label="Description du club" name="description" required>
        <UTextarea
          v-model="state.description"
          placeholder="(Historique, valeurs, sports proposés)"
          :rows="4"
          class="w-full"
          size="lg"
        />
      </UFormField>

      <!-- Section Adresse -->
      <div class="flex flex-col gap-4">
        <h2 class="text-base font-bold text-[#1c1c1c] leading-6 font-roboto">
          Votre adresse
        </h2>

        <!-- Code postal et Ville -->
        <div class="grid grid-cols-2 gap-3">
          <UFormField label="Code postal" name="postalCode" required>
            <UInput
              v-model="state.postalCode"
              placeholder="59000"
              class="w-full"
              size="lg"
            />
          </UFormField>

          <UFormField label="Ville" name="city" required>
            <UInput
              v-model="state.city"
              placeholder="Lille"
              class="w-full"
              size="lg"
            />
          </UFormField>
        </div>

        <!-- Adresse -->
        <UFormField label="Adresse" name="address" required>
          <UInput
            v-model="state.address"
            placeholder="37 Rue Pierre Mauroy"
            class="w-full"
            size="lg"
          />
        </UFormField>
      </div>
    </div>

    <!-- Bouton Continuer -->
    <UButton
      type="submit"
      block
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
