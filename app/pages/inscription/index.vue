<script setup lang="ts">
definePageMeta({
  layout: false
})

// État du formulaire
const selectedProfileType = ref<'particulier' | 'club' | null>(null)

// Navigation
function goBack() {
  navigateTo('/')
}

function goNext() {
  if (!selectedProfileType.value) return

  // Rediriger vers la page d'inscription correspondante
  if (selectedProfileType.value === 'particulier') {
    navigateTo('/inscription/particulier')
  } else {
    navigateTo('/inscription/club')
  }
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
      <!-- Barre de progression (étape 1/4) -->
      <div class="absolute bottom-0 left-0 w-full h-[2px] bg-gray-200">
        <div class="h-full bg-[#ef781e] w-[25%]" />
      </div>
    </div>

    <!-- Contenu principal -->
    <div class="w-full flex-1 flex flex-col gap-8 px-4 pb-8 pt-4">
      <!-- Bouton Retour -->
      <div class="flex items-center gap-2 cursor-pointer mt-2" @click="goBack">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M15 18L9 12L15 6" stroke="black" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
        </svg>
        <span class="text-base text-black font-roboto">Retour</span>
      </div>

      <!-- Qui êtes-vous ? -->
      <div class="flex flex-col gap-8">
        <!-- Titre et sous-titre -->
        <div class="flex flex-col gap-2 text-center">
          <h1 class="text-[30px] font-semibold text-black leading-[45px] font-asap">
            Qui êtes-vous ?
          </h1>
          <p class="text-base text-[#4a5565] leading-6 font-roboto">
            Choisissez le type de profil qui vous correspond
          </p>
        </div>

        <!-- Options de profil -->
        <div class="flex flex-col gap-4">
          <ProfileTypeCard
            :model-value="selectedProfileType === 'particulier'"
            icon="i-sportly-user-profile"
            title="Particulier"
            description="Je recherche des activités sportives près de chez moi"
            @update:model-value="selectedProfileType = 'particulier'"
          />

          <ProfileTypeCard
            :model-value="selectedProfileType === 'club'"
            icon="i-sportly-building"
            title="Club / Salle"
            description="Je propose des activités et gère mes réservations"
            @update:model-value="selectedProfileType = 'club'"
          />
        </div>

        <!-- Bouton Continuer -->
        <UButton
          v-if="selectedProfileType"
          block
          class="!bg-[#ef781e] hover:!bg-[#e05f16] !text-white !font-semibold !font-montserrat !text-base !rounded-[50px] !py-3 !mt-4"
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
