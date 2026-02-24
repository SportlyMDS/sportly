<script setup lang="ts">
import ClubDetailsCard from '~/components/dashboard/ClubDetailsCard.vue'
import SearchFilters from '~/components/dashboard/SearchFilters.vue'

definePageMeta({
  layout: 'dashboard'
})

const LILLE_CENTER: [number, number] = [50.6292, 3.0573]

const mapRef = ref()
const mapZoom = ref(13)
const mapCenter = ref<[number, number]>(LILLE_CENTER)
const isLocating = ref(false)
const selectedClub = ref<typeof clubs[0] | null>(null)
const showClubSheet = ref(false)
const searchQuery = ref('')
const showFavoritesOnly = ref(false)
const selectedDistance = ref('30km')
const selectedCategory = ref('')

const distances = ['5km', '10km', '20km', '30km', '50km']
const categories = ['Football', 'Rugby', 'Natation', 'Musculation', 'Basketball', 'Course', 'Cyclisme', 'Athlétisme', 'Boxe']

const clubs = reactive([
  {
    id: 1,
    name: 'Lille université club',
    emoji: '🏟️',
    image: 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=400&h=300&fit=crop',
    distance: '3,45km',
    isOpen: true,
    latitude: 50.6374,
    longitude: 3.0701,
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
    latitude: 50.6242,
    longitude: 3.0432,
    sports: [
      { emoji: '🏃', name: 'Athlétisme' },
      { emoji: '🏊', name: 'Natation' },
      { emoji: '🚴', name: 'Cyclisme' }
    ],
    tags: [
      { emoji: '✅', name: 'Intermédiaire' }
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
    latitude: 50.6321,
    longitude: 3.0612,
    sports: [
      { emoji: '💪', name: 'Musculation' },
      { emoji: '🥊', name: 'Boxe' }
    ],
    tags: [
      { emoji: '✅', name: 'Tous niveaux' }
    ],
    isFavorite: true
  },
  {
    id: 4,
    name: 'Aqua Center',
    emoji: '🏊',
    image: '/aqualille.jpg',
    distance: '2,3km',
    isOpen: true,
    latitude: 50.6198,
    longitude: 3.0531,
    sports: [
      { emoji: '🏊', name: 'Natation' }
    ],
    tags: [
      { emoji: '✅', name: 'Débutant' }
    ],
    isFavorite: false
  }
])

function parseDistanceKm(distance: string) {
  const normalized = distance.replace(',', '.').replace(/\s+/g, '').toLowerCase()
  const match = normalized.match(/[\d.]+/)

  return match ? Number.parseFloat(match[0]) : Number.POSITIVE_INFINITY
}

const filteredClubs = computed(() => {
  const maxDistance = parseDistanceKm(selectedDistance.value)

  return clubs.filter((club) => {
    const query = searchQuery.value.toLowerCase()
    const matchesSearch = !searchQuery.value
      || club.name.toLowerCase().includes(query)
      || club.sports.some(s => s.name.toLowerCase().includes(query))

    const matchesFavorites = !showFavoritesOnly.value || club.isFavorite

    const matchesCategory = !selectedCategory.value
      || club.sports.some(s => s.name === selectedCategory.value)

    const matchesDistance = !selectedDistance.value
      || parseDistanceKm(club.distance) <= maxDistance

    return matchesSearch && matchesFavorites && matchesCategory && matchesDistance
  })
})

function onMarkerClick(club: typeof clubs[0]) {
  selectedClub.value = club
  showClubSheet.value = true
  mapCenter.value = [club.latitude, club.longitude]
  mapZoom.value = 15
}

function closeSheet() {
  showClubSheet.value = false
  selectedClub.value = null
}

function toggleFavorite(club: typeof clubs[0]) {
  club.isFavorite = !club.isFavorite
}

const requestGeolocation = () => {
  if (!navigator.geolocation) return

  isLocating.value = true

  navigator.geolocation.getCurrentPosition(
    (position) => {
      const { latitude, longitude } = position.coords
      mapCenter.value = [latitude, longitude]
      mapZoom.value = 14
      isLocating.value = false
    },
    () => {
      isLocating.value = false
    },
    { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
  )
}

onMounted(() => {
  requestGeolocation()
})

watch(filteredClubs, (clubsList) => {
  if (selectedClub.value && !clubsList.some(club => club.id === selectedClub.value?.id)) {
    closeSheet()
  }
})
</script>

<template>
  <div class="fixed inset-0 bottom-[64px] flex flex-col">
    <!-- Header -->
    <div class="absolute top-0 left-0 right-0 z-1000">
      <div class="bg-white p-4 flex items-center justify-center">
        <img
          src="/Nouveau-logo-sportly-1Logo-1@2x.png"
          alt="Sportly"
          class="h-7"
        >
      </div>

      <SearchFilters
        v-model:search-query="searchQuery"
        v-model:show-favorites-only="showFavoritesOnly"
        v-model:selected-distance="selectedDistance"
        v-model:selected-category="selectedCategory"
        :distances="distances"
        :categories="categories"
      />
    </div>

    <!-- Map -->
    <ClientOnly>
      <LMap
        ref="mapRef"
        :zoom="mapZoom"
        :center="mapCenter"
        :use-global-leaflet="false"
        :options="{ zoomControl: false }"
        class="flex-1 w-full h-full"
        @click="closeSheet"
      >
        <LTileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution="&copy; <a href='https://www.openstreetmap.org/'>OpenStreetMap</a> contributors"
          layer-type="base"
          name="OpenStreetMap"
        />
        <LMarker
          v-for="club in filteredClubs"
          :key="club.id"
          :lat-lng="[club.latitude, club.longitude]"
          :options="{ bubblingMouseEvents: false }"
          @click="onMarkerClick(club)"
        >
          <LIcon
            :icon-url="'data:image/svg+xml;utf8,' + encodeURIComponent(`<svg xmlns='http://www.w3.org/2000/svg' width='36' height='44' viewBox='0 0 36 44'><path d='M18 0C8.06 0 0 8.06 0 18c0 13.5 18 26 18 26S36 31.5 36 18C36 8.06 27.94 0 18 0z' fill='${club.id === selectedClub?.id ? '#ef781e' : '#1c1c1c'}'/><text x='18' y='24' text-anchor='middle' font-size='16'>${club.emoji}</text></svg>`)"
            :icon-size="[36, 44]"
            :icon-anchor="[18, 44]"
          />
        </LMarker>
      </LMap>
      <template #fallback>
        <div class="flex-1 bg-gray-100 flex items-center justify-center">
          <UIcon name="i-heroicons-map" class="w-16 h-16 text-gray-400" />
        </div>
      </template>
    </ClientOnly>

    <!-- Locate button -->
    <button
      type="button"
      class="absolute right-4 z-1000 w-10 h-10 bg-white rounded-full shadow-md flex items-center justify-center hover:bg-gray-50 transition-colors"
      :class="showClubSheet ? 'bottom-[240px]' : 'bottom-6'"
      :disabled="isLocating"
      @click="requestGeolocation"
    >
      <UIcon
        :name="isLocating ? 'i-heroicons-map-pin' : 'i-heroicons-paper-airplane'"
        :class="[
          'w-5 h-5',
          isLocating ? 'animate-pulse text-tango-500' : 'text-gray-600 rotate-45'
        ]"
      />
    </button>

    <!-- Clubs count pill -->
    <div
      v-if="!showClubSheet"
      class="absolute bottom-6 left-1/2 -translate-x-1/2 z-1000 bg-white border border-[#d6d6d6] px-5 py-2.5 rounded-full shadow-md flex items-center gap-2"
    >
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" class="text-[#1c1c1c]">
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
      <span class="text-sm font-medium text-[#1c1c1c] font-roboto">{{ filteredClubs.length }} clubs à proximité</span>
    </div>

    <!-- Club bottom sheet -->
    <Transition name="sheet">
      <div
        v-if="showClubSheet && selectedClub"
        class="absolute bottom-0 left-0 right-0 z-1000 bg-white rounded-t-2xl shadow-2xl"
        style="max-height: 300px;"
      >
        <!-- Handle -->
        <div class="flex justify-center pt-3 pb-2">
          <div class="w-10 h-1 bg-[#d6d6d6] rounded-full" />
        </div>

        <ClubDetailsCard
          :club="selectedClub"
          @close="closeSheet"
          @toggle-favorite="toggleFavorite(selectedClub)"
        />
      </div>
    </Transition>
  </div>
</template>

<style scoped>
.font-roboto {
  font-family: 'Roboto', sans-serif;
}

.sheet-enter-active,
.sheet-leave-active {
  transition: transform 0.3s ease;
}

.sheet-enter-from,
.sheet-leave-to {
  transform: translateY(100%);
}
</style>
