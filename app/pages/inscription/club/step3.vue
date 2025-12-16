<script setup lang="ts">
definePageMeta({
  layout: false
})

// État du formulaire
const form = reactive({
  clubName: '',
  website: '',
  description: '',
  postalCode: '',
  city: '',
  address: ''
})

// Validation
const isFormValid = computed(() => {
  return form.clubName.trim() !== '' &&
    form.description.trim() !== '' &&
    form.postalCode.trim() !== '' &&
    form.city.trim() !== '' &&
    form.address.trim() !== ''
})

// Navigation
function goBack() {
  navigateTo('/inscription/club')
}

function goNext() {
  if (!isFormValid.value) return
  console.log('Club info:', form)
  navigateTo('/inscription/club/step4')
}
</script>

<template>
  <div class="w-[393px] min-h-screen bg-white max-w-full overflow-hidden flex flex-col items-center mx-auto">
    <!-- Header avec logo -->
    <div class="w-full bg-white flex items-center justify-center p-4 relative">
      <img
        class="w-[120px] h-auto object-cover"
        loading="lazy"
        alt="Logo Sportly"
        src="/Nouveau-logo-sportly-1Logo-1@2x.png"
      >
      <!-- Barre de progression (étape 3/4 = 75%) -->
      <div class="absolute bottom-0 left-0 w-full h-[2px] bg-gray-200">
        <div class="h-full bg-[#ef781e] w-[75%]" />
      </div>
    </div>

    <!-- Contenu principal -->
    <div class="w-full flex-1 flex flex-col gap-8 px-4 pb-8 pt-4">
      <!-- Bouton Retour -->
      <div class="flex items-center gap-2 cursor-pointer" @click="goBack">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M15 18L9 12L15 6" stroke="black" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
        </svg>
        <span class="text-base text-black font-roboto">Retour</span>
      </div>

      <!-- Contenu -->
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
              v-model="form.clubName"
              type="text"
              placeholder="Nom du club"
              class="w-full bg-[#f7f7f7] border-2 border-[#e5e7eb] rounded-lg h-12 px-3 text-sm text-[#1c1c1c] placeholder-[#545454] font-roboto focus:outline-none focus:border-[#ef781e]"
            >
          </div>

          <!-- Site web -->
          <div class="flex flex-col gap-2">
            <label class="text-base text-[#1c1c1c] leading-6 font-roboto">Site web</label>
            <input
              v-model="form.website"
              type="url"
              placeholder="Site web"
              class="w-full bg-[#f7f7f7] border-2 border-[#e5e7eb] rounded-lg h-12 px-3 text-sm text-[#1c1c1c] placeholder-[#545454] font-roboto focus:outline-none focus:border-[#ef781e]"
            >
          </div>

          <!-- Description du club -->
          <div class="flex flex-col gap-2">
            <label class="text-base text-[#1c1c1c] leading-6 font-roboto">Description du club *</label>
            <textarea
              v-model="form.description"
              placeholder="(Historique, valeurs, sports proposés)"
              rows="4"
              class="w-full bg-[#f7f7f7] border-2 border-[#e5e7eb] rounded-lg px-3 py-2 text-sm text-[#1c1c1c] placeholder-[#545454] font-roboto focus:outline-none focus:border-[#ef781e] resize-none"
            />
          </div>

          <!-- Section Adresse -->
          <div class="flex flex-col gap-4">
            <h2 class="text-base font-bold text-[#1c1c1c] leading-6 font-roboto">Votre adresse</h2>

            <!-- Code postal et Ville -->
            <div class="grid grid-cols-2 gap-3">
              <div class="flex flex-col gap-2">
                <label class="text-base text-[#1c1c1c] leading-6 font-roboto">Code postal *</label>
                <input
                  v-model="form.postalCode"
                  type="text"
                  placeholder="59000"
                  class="w-full bg-[#f7f7f7] border-2 border-[#e5e7eb] rounded-lg h-12 px-3 text-sm text-[#1c1c1c] placeholder-[#545454] font-roboto focus:outline-none focus:border-[#ef781e]"
                >
              </div>
              <div class="flex flex-col gap-2">
                <label class="text-base text-[#1c1c1c] leading-6 font-roboto">Ville *</label>
                <input
                  v-model="form.city"
                  type="text"
                  placeholder="Lille"
                  class="w-full bg-[#f7f7f7] border-2 border-[#e5e7eb] rounded-lg h-12 px-3 text-sm text-[#1c1c1c] placeholder-[#545454] font-roboto focus:outline-none focus:border-[#ef781e]"
                >
              </div>
            </div>

            <!-- Adresse -->
            <div class="flex flex-col gap-2">
              <label class="text-base text-[#1c1c1c] leading-6 font-roboto">Adresse *</label>
              <input
                v-model="form.address"
                type="text"
                placeholder="37 Rue Pierre Mauroy"
                class="w-full bg-[#f7f7f7] border-2 border-[#e5e7eb] rounded-lg h-12 px-3 text-sm text-[#1c1c1c] placeholder-[#545454] font-roboto focus:outline-none focus:border-[#ef781e]"
              >
            </div>
          </div>
        </div>

        <!-- Bouton Continuer -->
        <UButton
          block
          :disabled="!isFormValid"
          class="!bg-[#ef781e] hover:!bg-[#e05f16] !text-white !font-semibold !font-montserrat !text-base !rounded-[50px] !py-3 disabled:!opacity-50 disabled:!cursor-not-allowed"
          @click="goNext"
        >
          Continuer
        </UButton>
      </div>
    </div>
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
