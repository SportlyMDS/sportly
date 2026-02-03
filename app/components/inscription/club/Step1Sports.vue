<script setup lang="ts">
const props = defineProps<{
  selectedSports: string[]
}>()

const emit = defineEmits<{
  'update:selectedSports': [string[]]
  'next': []
}>()

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

const searchQuery = ref('')

const filteredSports = computed(() => {
  if (!searchQuery.value.trim()) return sports
  const query = searchQuery.value.toLowerCase()
  return sports.filter(sport =>
    sport.label.toLowerCase().includes(query)
  )
})

function toggleSport(sportId: string) {
  const current = [...props.selectedSports]
  const index = current.indexOf(sportId)
  if (index === -1) {
    current.push(sportId)
  } else {
    current.splice(index, 1)
  }
  emit('update:selectedSports', current)
}

function handleNext() {
  if (props.selectedSports.length > 0) {
    emit('next')
  }
}
</script>

<template>
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
