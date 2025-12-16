<script setup lang="ts">
definePageMeta({
  layout: false
})

// Liste des sports disponibles
const sports = [
  { id: 'musculation', emoji: '💪', label: 'Musculation' },
  { id: 'equitation', emoji: '🐎', label: 'Équitation' },
  { id: 'football', emoji: '⚽', label: 'Football' },
  { id: 'handball', emoji: '🤾‍♀️', label: 'Handball' },
  { id: 'course', emoji: '🏃‍♂️', label: 'Course à pied' },
  { id: 'danse', emoji: '💃', label: 'Danse' },
  { id: 'basketball', emoji: '🏀', label: 'Basketball' },
  { id: 'natation', emoji: '🏊', label: 'Natation' }
]

// État
const selectedSports = ref<string[]>([])
const searchQuery = ref('')

// Sports filtrés par recherche
const filteredSports = computed(() => {
  if (!searchQuery.value.trim()) return sports
  const query = searchQuery.value.toLowerCase()
  return sports.filter(sport =>
    sport.label.toLowerCase().includes(query)
  )
})

// Toggle sport selection
function toggleSport(sportId: string) {
  const index = selectedSports.value.indexOf(sportId)
  if (index === -1) {
    selectedSports.value.push(sportId)
  } else {
    selectedSports.value.splice(index, 1)
  }
}

// Navigation
function goBack() {
  navigateTo('/inscription')
}

function goNext() {
  if (selectedSports.value.length === 0) return
  console.log('Sports sélectionnés:', selectedSports.value)
  navigateTo('/inscription/club/step3')
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
      <!-- Barre de progression (étape 2/4) -->
      <div class="absolute bottom-0 left-0 w-full h-[2px] bg-gray-200">
        <div class="h-full bg-[#ef781e] w-[50%]" />
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

      <!-- Contenu -->
      <div class="flex flex-col gap-8">
        <!-- Titre et sous-titre -->
        <div class="flex flex-col gap-2">
          <h1 class="text-[30px] font-semibold text-[#1c1c1c] leading-[45px] tracking-tight font-asap">
            Quels sports proposez-vous ?
          </h1>
          <p class="text-base text-[#545454] leading-6 font-roboto">
            Sélectionnez les activités disponibles dans votre club
          </p>
        </div>

        <!-- Barre de recherche -->
        <div class="relative">
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Recherche du sport"
            class="w-full bg-[#f7f7f7] border-2 border-[#f7f7f7] rounded-lg h-12 pl-12 pr-3 text-sm text-[#545454] placeholder-[#545454] font-roboto focus:outline-none focus:border-[#ef781e]"
          >
          <svg
            class="absolute left-4 top-1/2 -translate-y-1/2 text-[#545454]"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path d="M21 21L16.65 16.65M19 11C19 15.4183 15.4183 19 11 19C6.58172 19 3 15.4183 3 11C3 6.58172 6.58172 3 11 3C15.4183 3 19 6.58172 19 11Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
          </svg>
        </div>

        <!-- Grille de sports -->
        <div class="grid grid-cols-2 gap-3">
          <InscriptionSportCard
            v-for="sport in filteredSports"
            :key="sport.id"
            :emoji="sport.emoji"
            :label="sport.label"
            :selected="selectedSports.includes(sport.id)"
            @toggle="toggleSport(sport.id)"
          />
        </div>

        <!-- Bouton Continuer -->
        <UButton
          block
          :disabled="selectedSports.length === 0"
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
