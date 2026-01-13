<script setup lang="ts">
import type { InscriptionClubData } from '~/composables/useInscriptionClub'

const props = defineProps<{
  data: InscriptionClubData
}>()

const emit = defineEmits<{
  update: [key: keyof InscriptionClubData, value: string]
  next: []
}>()

const isFormValid = computed(() => {
  return props.data.clubName.trim() !== ''
    && props.data.description.trim() !== ''
    && props.data.postalCode.trim() !== ''
    && props.data.city.trim() !== ''
    && props.data.address.trim() !== ''
})

function handleNext() {
  if (isFormValid.value) {
    emit('next')
  }
}
</script>

<template>
  <div class="flex flex-col gap-8">
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
      <div class="flex flex-col gap-2">
        <label class="text-base text-[#1c1c1c] leading-6 font-roboto">Nom du club *</label>
        <input
          :value="data.clubName"
          type="text"
          placeholder="Nom du club"
          class="w-full bg-[#f7f7f7] border-2 border-[#e5e7eb] rounded-lg h-12 px-3 text-sm text-[#1c1c1c] placeholder-[#545454] font-roboto focus:outline-none focus:border-[#ef781e]"
          @input="emit('update', 'clubName', ($event.target as HTMLInputElement).value)"
        >
      </div>

      <!-- Site web -->
      <div class="flex flex-col gap-2">
        <label class="text-base text-[#1c1c1c] leading-6 font-roboto">Site web</label>
        <input
          :value="data.website"
          type="url"
          placeholder="Site web"
          class="w-full bg-[#f7f7f7] border-2 border-[#e5e7eb] rounded-lg h-12 px-3 text-sm text-[#1c1c1c] placeholder-[#545454] font-roboto focus:outline-none focus:border-[#ef781e]"
          @input="emit('update', 'website', ($event.target as HTMLInputElement).value)"
        >
      </div>

      <!-- Description du club -->
      <div class="flex flex-col gap-2">
        <label class="text-base text-[#1c1c1c] leading-6 font-roboto">Description du club *</label>
        <textarea
          :value="data.description"
          placeholder="(Historique, valeurs, sports proposés)"
          rows="4"
          class="w-full bg-[#f7f7f7] border-2 border-[#e5e7eb] rounded-lg px-3 py-2 text-sm text-[#1c1c1c] placeholder-[#545454] font-roboto focus:outline-none focus:border-[#ef781e] resize-none"
          @input="emit('update', 'description', ($event.target as HTMLTextAreaElement).value)"
        />
      </div>

      <!-- Section Adresse -->
      <div class="flex flex-col gap-4">
        <h2 class="text-base font-bold text-[#1c1c1c] leading-6 font-roboto">
          Votre adresse
        </h2>

        <!-- Code postal et Ville -->
        <div class="grid grid-cols-2 gap-3">
          <div class="flex flex-col gap-2">
            <label class="text-base text-[#1c1c1c] leading-6 font-roboto">Code postal *</label>
            <input
              :value="data.postalCode"
              type="text"
              placeholder="59000"
              class="w-full bg-[#f7f7f7] border-2 border-[#e5e7eb] rounded-lg h-12 px-3 text-sm text-[#1c1c1c] placeholder-[#545454] font-roboto focus:outline-none focus:border-[#ef781e]"
              @input="emit('update', 'postalCode', ($event.target as HTMLInputElement).value)"
            >
          </div>
          <div class="flex flex-col gap-2">
            <label class="text-base text-[#1c1c1c] leading-6 font-roboto">Ville *</label>
            <input
              :value="data.city"
              type="text"
              placeholder="Lille"
              class="w-full bg-[#f7f7f7] border-2 border-[#e5e7eb] rounded-lg h-12 px-3 text-sm text-[#1c1c1c] placeholder-[#545454] font-roboto focus:outline-none focus:border-[#ef781e]"
              @input="emit('update', 'city', ($event.target as HTMLInputElement).value)"
            >
          </div>
        </div>

        <!-- Adresse -->
        <div class="flex flex-col gap-2">
          <label class="text-base text-[#1c1c1c] leading-6 font-roboto">Adresse *</label>
          <input
            :value="data.address"
            type="text"
            placeholder="37 Rue Pierre Mauroy"
            class="w-full bg-[#f7f7f7] border-2 border-[#e5e7eb] rounded-lg h-12 px-3 text-sm text-[#1c1c1c] placeholder-[#545454] font-roboto focus:outline-none focus:border-[#ef781e]"
            @input="emit('update', 'address', ($event.target as HTMLInputElement).value)"
          >
        </div>
      </div>
    </div>

    <!-- Bouton Continuer -->
    <UButton
      block
      :disabled="!isFormValid"
      class="!bg-[#ef781e] hover:!bg-[#e05f16] !text-white !font-semibold !font-montserrat !text-base !rounded-[50px] !py-3 disabled:!opacity-50 disabled:!cursor-not-allowed"
      @click="handleNext"
    >
      Continuer
    </UButton>
  </div>
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
