<script setup lang="ts">
definePageMeta({
  layout: 'dashboard'
})

const searchQuery = ref('')
const showFavoritesOnly = ref(false)
const selectedDistance = ref('30km')
const showDistanceDropdown = ref(false)
const selectedCategory = ref('')
const showCategoryDropdown = ref(false)

const distances = ['5km', '10km', '20km', '30km', '50km']
const categories = ['Football', 'Rugby', 'Natation', 'Musculation', 'Basketball', 'Course', 'Cyclisme']

// Clubs data
const allClubs = reactive([
  {
    id: 1,
    name: 'Lille université club',
    emoji: '🏟️',
    image: 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=400&h=300&fit=crop',
    distance: '3,45km',
    isOpen: true,
    sports: [
      { emoji: '⚽', name: 'Football' },
      { emoji: '🏉', name: 'Rugby' },
      { emoji: '🏃', name: 'Course' }
    ],
    tags: [
      { emoji: '✅', name: 'Débutant' },
      { emoji: '✅', name: 'Handicapé' }
    ],
    isFavorite: false
  },
  {
    id: 2,
    name: 'Centre sportif de Lille',
    emoji: '🏟️',
    image: 'https://images.unsplash.com/photo-1587280501635-68a0e82cd5ff?w=400&h=300&fit=crop',
    distance: '5,2km',
    isOpen: false,
    sports: [
      { emoji: '🏃', name: 'Athlétisme' },
      { emoji: '🏊', name: 'Natation' },
      { emoji: '🚴', name: 'Cyclisme' }
    ],
    tags: [
      { emoji: '✅', name: 'Intermédiaire' },
      { emoji: '❌', name: 'Handicapé' }
    ],
    isFavorite: false
  },
  {
    id: 3,
    name: 'Le hook Lille',
    emoji: '🏋️',
    image: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=400&h=300&fit=crop',
    distance: '1,8km',
    isOpen: true,
    sports: [
      { emoji: '💪', name: 'Musculation' },
      { emoji: '🥊', name: 'Boxe' }
    ],
    tags: [
      { emoji: '✅', name: 'Tous niveaux' }
    ],
    isFavorite: true
  }
])

// Filtered clubs based on search and filters
const filteredClubs = computed(() => {
  return allClubs.filter((club) => {
    // Search filter
    const query = searchQuery.value.toLowerCase()
    const matchesSearch = !searchQuery.value
      || club.name.toLowerCase().includes(query)
      || club.sports.some(s => s.name.toLowerCase().includes(query))

    // Favorites filter
    const matchesFavorites = !showFavoritesOnly.value || club.isFavorite

    // Category filter
    const matchesCategory = !selectedCategory.value
      || club.sports.some(s => s.name === selectedCategory.value)

    return matchesSearch && matchesFavorites && matchesCategory
  })
})

function toggleFavorite(club: typeof allClubs[0]) {
  club.isFavorite = !club.isFavorite
}
</script>

<template>
  <div class="flex flex-col pb-24">
    <!-- Header with logo -->
    <div class="bg-white p-4 flex items-center justify-center">
      <img
        src="/Nouveau-logo-sportly-1Logo-1@2x.png"
        alt="Sportly"
        class="h-7"
      >
    </div>

    <!-- Search and Filters -->
    <div class="bg-white px-4 py-4 flex flex-col gap-3">
      <!-- Search bar -->
      <div class="relative">
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Rechercher des clubs, activités"
          class="search-input w-full bg-white border border-[#d6d6d6] h-12 pl-4 pr-12 text-base text-[#1c1c1c] placeholder-[rgba(28,28,28,0.5)] font-roboto focus:outline-none focus:border-[#ef781e]"
        >
        <button class="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 bg-[#ef781e] rounded-md flex items-center justify-center">
          <svg
            class="text-white"
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <circle
              cx="11"
              cy="11"
              r="8"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
            <path
              d="M21 21L16.65 16.65"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </svg>
        </button>
      </div>

      <!-- Filter buttons -->
      <div class="flex items-center gap-2">
        <!-- Favorites toggle -->
        <button
          class="h-10 w-12 border rounded-full flex items-center justify-center transition-colors"
          :class="showFavoritesOnly ? 'border-[#ef781e] bg-[rgba(239,120,30,0.1)]' : 'border-[#d6d6d6] bg-white'"
          @click="showFavoritesOnly = !showFavoritesOnly"
        >
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            :fill="showFavoritesOnly ? '#ef781e' : 'none'"
            :class="showFavoritesOnly ? 'text-[#ef781e]' : 'text-[#545454]'"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </svg>
        </button>

        <!-- Distance dropdown -->
        <div class="relative">
          <button
            class="h-10 px-4 border border-[#d6d6d6] bg-white rounded-full flex items-center gap-2 text-sm font-roboto text-[#1c1c1c]"
            @click="showDistanceDropdown = !showDistanceDropdown"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" class="text-[#545454]">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
              <circle
                cx="12"
                cy="10"
                r="3"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
            </svg>
            <span>Rayon | {{ selectedDistance }}</span>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" class="text-[#545454]">
              <path d="M6 9l6 6 6-6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
            </svg>
          </button>
          <div
            v-if="showDistanceDropdown"
            class="absolute top-full left-0 mt-1 bg-white border border-[#d6d6d6] rounded-lg shadow-lg z-10 min-w-full"
          >
            <button
              v-for="dist in distances"
              :key="dist"
              class="w-full px-3 py-2 text-left text-sm font-roboto hover:bg-gray-100"
              :class="selectedDistance === dist ? 'text-[#ef781e]' : 'text-[#1c1c1c]'"
              @click="selectedDistance = dist; showDistanceDropdown = false"
            >
              {{ dist }}
            </button>
          </div>
        </div>

        <!-- Categories dropdown -->
        <div class="relative flex-1">
          <button
            class="h-10 px-4 w-full border border-[#d6d6d6] bg-white rounded-full flex items-center justify-between gap-2 text-sm font-roboto text-[#1c1c1c]"
            @click="showCategoryDropdown = !showCategoryDropdown"
          >
            <div class="flex items-center gap-2">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" class="text-[#545454]">
                <line
                  x1="4"
                  y1="6"
                  x2="20"
                  y2="6"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                />
                <line
                  x1="4"
                  y1="12"
                  x2="20"
                  y2="12"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                />
                <line
                  x1="4"
                  y1="18"
                  x2="20"
                  y2="18"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                />
              </svg>
              <span>{{ selectedCategory || 'Catégories' }}</span>
            </div>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" class="text-[#545454]">
              <path d="M6 9l6 6 6-6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
            </svg>
          </button>
          <div
            v-if="showCategoryDropdown"
            class="absolute top-full left-0 mt-1 bg-white border border-[#d6d6d6] rounded-lg shadow-lg z-10 w-full"
          >
            <button
              class="w-full px-3 py-2 text-left text-sm font-roboto hover:bg-gray-100 text-[#545454]"
              @click="selectedCategory = ''; showCategoryDropdown = false"
            >
              Toutes
            </button>
            <button
              v-for="cat in categories"
              :key="cat"
              class="w-full px-3 py-2 text-left text-sm font-roboto hover:bg-gray-100"
              :class="selectedCategory === cat ? 'text-[#ef781e]' : 'text-[#1c1c1c]'"
              @click="selectedCategory = cat; showCategoryDropdown = false"
            >
              {{ cat }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Club cards -->
    <div class="flex flex-col gap-4 px-4 pt-4">
      <div
        v-for="club in filteredClubs"
        :key="club.id"
        class="club-card relative h-[224px] rounded-xl overflow-hidden shadow-sm"
      >
        <!-- Background image -->
        <img
          :src="club.image"
          :alt="club.name"
          class="absolute inset-0 w-full h-full object-cover"
          @error="($event.target as HTMLImageElement).src = 'https://via.placeholder.com/400x224?text=Club'"
        >
        <!-- Overlay -->
        <div class="absolute inset-0 bg-[rgba(33,33,33,0.3)]" />

        <!-- Open/Closed badge -->
        <div
          class="absolute top-3 left-3 px-3 py-1 rounded-full text-xs font-medium text-white"
          :class="club.isOpen ? 'bg-[#00c950]' : 'bg-[#ef4444]'"
        >
          {{ club.isOpen ? 'Ouvert' : 'Fermé' }}
        </div>

        <!-- Favorite button -->
        <button
          class="absolute top-3 right-3 w-10 h-10 rounded-full bg-[rgba(255,255,255,0.9)] flex items-center justify-center shadow-md transition-colors"
          :class="club.isFavorite ? 'text-[#ef781e]' : 'text-[#545454]'"
          @click="toggleFavorite(club)"
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            :fill="club.isFavorite ? 'currentColor' : 'none'"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </svg>
        </button>

        <!-- Content -->
        <div class="absolute bottom-0 left-0 right-0 p-4 flex flex-col gap-3">
          <!-- Club name and distance -->
          <div class="flex items-center gap-2">
            <div class="w-8 h-8 bg-white rounded-full flex items-center justify-center text-lg">
              {{ club.emoji }}
            </div>
            <div class="flex flex-col">
              <span class="text-base font-medium text-white font-roboto">{{ club.name }}</span>
              <span class="text-sm text-[rgba(255,255,255,0.8)] font-roboto">à {{ club.distance }}</span>
            </div>
          </div>

          <!-- Sports tags -->
          <div class="flex flex-wrap gap-2">
            <span
              v-for="sport in club.sports"
              :key="sport.name"
              class="bg-[rgba(28,28,28,0.8)] text-white text-xs px-3 py-1 rounded-full font-roboto"
            >
              {{ sport.emoji }} {{ sport.name }}
            </span>
          </div>

          <!-- Level/Accessibility tags -->
          <div class="flex flex-wrap gap-2">
            <span
              v-for="tag in club.tags"
              :key="tag.name"
              class="bg-[rgba(28,28,28,0.8)] text-white text-xs px-3 py-1 rounded-full font-roboto"
            >
              {{ tag.emoji }} {{ tag.name }}
            </span>
          </div>
        </div>
      </div>

      <!-- Empty state -->
      <div
        v-if="filteredClubs.length === 0"
        class="flex flex-col items-center justify-center py-12 text-center"
      >
        <span class="text-4xl mb-4">🔍</span>
        <p class="text-[#545454] font-roboto">
          Aucun club trouvé pour "{{ searchQuery }}"
        </p>
      </div>
    </div>

    <!-- Floating Map button -->
    <NuxtLink
      to="/dashboard/carte"
      class="fixed bottom-24 left-1/2 -translate-x-1/2 bg-white border border-[#d6d6d6] px-6 py-3 rounded-full shadow-lg flex items-center gap-2 z-40 hover:shadow-xl transition-shadow"
    >
      <span class="text-base font-medium text-[#1c1c1c] font-roboto">Carte</span>
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" class="text-[#1c1c1c]">
        <polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
        <line
          x1="8"
          y1="2"
          x2="8"
          y2="18"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
        <line
          x1="16"
          y1="6"
          x2="16"
          y2="22"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
      </svg>
    </NuxtLink>
  </div>
</template>

<style scoped>
.font-roboto {
  font-family: 'Roboto', sans-serif;
}

.search-input {
  border-radius: 12px !important;
}

.club-card {
  border-radius: 12px !important;
}
</style>
