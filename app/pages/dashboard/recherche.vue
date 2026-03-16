<script setup lang="ts">
import ClubDetailsCard from '~/components/dashboard/ClubDetailsCard.vue'
import SearchFilters from '~/components/dashboard/SearchFilters.vue'

definePageMeta({
  layout: 'dashboard'
})

const LILLE_CENTER: [number, number] = [50.6292, 3.0573]

const searchQuery = ref('')
const showFavoritesOnly = ref(false)
const selectedDistance = ref('30km')
const selectedCategory = ref('')

const distances = ['5km', '10km', '20km', '30km', '50km']
const categories = ['Football', 'Rugby', 'Natation', 'Musculation', 'Basketball', 'Course', 'Cyclisme', 'Athlétisme', 'Boxe']

// Map drawer state
const showMapDrawer = ref(false)
const mapZoom = ref(13)
const mapCenter = ref<[number, number]>(LILLE_CENTER)
const isLocating = ref(false)
const mapSelectedClub = ref<typeof allClubs[0] | null>(null)

// Clubs data
const allClubs = reactive([
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
      { emoji: '✅', name: 'Situ. de handicap.' }
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
  }
])

const selectedClub = ref<typeof allClubs[0] | null>(null)
const showClubDetails = ref(false)

function parseDistanceKm(distance: string) {
  const normalized = distance.replace(',', '.').replace(/\s+/g, '').toLowerCase()
  const match = normalized.match(/[\d.]+/)

  return match ? Number.parseFloat(match[0]) : Number.POSITIVE_INFINITY
}

// Filtered clubs based on search and filters
const filteredClubs = computed(() => {
  const maxDistance = parseDistanceKm(selectedDistance.value)

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

    // Distance filter
    const matchesDistance = !selectedDistance.value
      || parseDistanceKm(club.distance) <= maxDistance

    return matchesSearch && matchesFavorites && matchesCategory && matchesDistance
  })
})

function toggleFavorite(club: typeof allClubs[0]) {
  club.isFavorite = !club.isFavorite
}

function openClubDetails(club: typeof allClubs[0]) {
  selectedClub.value = club
  showClubDetails.value = true
}

function closeClubDetails() {
  showClubDetails.value = false
  selectedClub.value = null
}

// Map drawer functions
function openMapDrawer() {
  showMapDrawer.value = true
  requestGeolocation()
}

function onMarkerClick(club: typeof allClubs[0]) {
  mapSelectedClub.value = club
  mapCenter.value = [club.latitude, club.longitude]
  mapZoom.value = 15
}

function closeMapClubSheet() {
  mapSelectedClub.value = null
}

function onMapClick() {
  mapSelectedClub.value = null
}

function requestGeolocation() {
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

watch(filteredClubs, (clubsList) => {
  if (mapSelectedClub.value && !clubsList.some(club => club.id === mapSelectedClub.value?.id)) {
    closeMapClubSheet()
  }
})
</script>

<template>
  <div class="flex flex-col pb-24">
    <!-- Search and Filters -->
    <SearchFilters
      v-model:search-query="searchQuery"
      v-model:show-favorites-only="showFavoritesOnly"
      v-model:selected-distance="selectedDistance"
      v-model:selected-category="selectedCategory"
      :distances="distances"
      :categories="categories"
    />

    <!-- Club cards -->
    <div class="flex flex-col gap-4 px-4 pt-4">
      <div
        v-for="club in filteredClubs"
        :key="club.id"
        class="club-card relative h-[224px] rounded-xl overflow-hidden shadow-sm cursor-pointer"
        @click="openClubDetails(club)"
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
          :class="club.isFavorite ? 'text-tango-500' : 'text-[#545454]'"
          @click.stop="toggleFavorite(club)"
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
    <button
      type="button"
      class="fixed bottom-24 left-1/2 -translate-x-1/2 bg-white border border-[#d6d6d6] px-6 py-3 rounded-full shadow-lg flex items-center gap-2 z-40 hover:shadow-xl transition-shadow"
      @click="openMapDrawer"
    >
      <span class="text-base font-medium text-[#1c1c1c] font-roboto">Carte</span>
      <svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        class="text-[#1c1c1c]"
      >
        <polygon
          points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
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
    </button>

    <!-- Map Drawer -->
    <UDrawer
      v-model:open="showMapDrawer"
      title="Carte"
      direction="bottom"
      :handle="true"
      :overlay="true"
      :ui="{
        content: 'h-dvh rounded-t-2xl',
        handle: 'bg-[#d6d6d6] w-10',
        overlay: 'bg-black/35',
        title: 'sr-only',
        header: 'hidden'
      }"
      @close="closeMapClubSheet"
    >
      <template #content>
        <div class="flex flex-col h-full overflow-hidden rounded-t-2xl bg-white">
          <!-- Search and Filters inside drawer -->
          <SearchFilters
            v-model:search-query="searchQuery"
            v-model:show-favorites-only="showFavoritesOnly"
            v-model:selected-distance="selectedDistance"
            v-model:selected-category="selectedCategory"
            :distances="distances"
            :categories="categories"
          />

          <!-- Map -->
          <div class="flex-1 relative">
            <ClientOnly>
              <LMap
                :zoom="mapZoom"
                :center="mapCenter"
                :use-global-leaflet="false"
                :options="{ zoomControl: false }"
                class="w-full h-full"
                @click="onMapClick"
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
                    :icon-url="'data:image/svg+xml;utf8,' + encodeURIComponent(`<svg xmlns='http://www.w3.org/2000/svg' width='36' height='44' viewBox='0 0 36 44'><path d='M18 0C8.06 0 0 8.06 0 18c0 13.5 18 26 18 26S36 31.5 36 18C36 8.06 27.94 0 18 0z' fill='${club.id === mapSelectedClub?.id ? '#ef781e' : '#1c1c1c'}'/><text x='18' y='24' text-anchor='middle' font-size='16'>${club.emoji}</text></svg>`)"
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
              :class="mapSelectedClub ? 'bottom-[220px]' : 'bottom-6'"
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

            <!-- Club bottom sheet inside map -->
            <Transition name="sheet">
              <div
                v-if="mapSelectedClub"
                class="absolute bottom-0 left-0 right-0 z-1000 bg-white rounded-t-2xl shadow-2xl"
              >
                <div class="flex justify-center pt-3 pb-2">
                  <div class="w-10 h-1 bg-[#d6d6d6] rounded-full" />
                </div>

                <ClubDetailsCard
                  :club="mapSelectedClub"
                  @close="closeMapClubSheet"
                  @toggle-favorite="toggleFavorite(mapSelectedClub!)"
                />
              </div>
            </Transition>
          </div>
        </div>
      </template>
    </UDrawer>

    <!-- Club details overlay (list view) -->
    <Transition name="club-details-overlay">
      <div
        v-if="showClubDetails && selectedClub"
        class="fixed inset-0 z-50 bg-black/35"
        @click="closeClubDetails"
      >
        <Transition name="club-details-sheet">
          <div
            v-if="showClubDetails && selectedClub"
            class="absolute bottom-0 left-0 right-0 bg-white rounded-t-2xl shadow-2xl"
            @click.stop
          >
            <div class="flex justify-center pt-3 pb-2">
              <div class="w-10 h-1 bg-[#d6d6d6] rounded-full" />
            </div>

            <ClubDetailsCard
              :club="selectedClub"
              @close="closeClubDetails"
              @toggle-favorite="toggleFavorite(selectedClub)"
            />
          </div>
        </Transition>
      </div>
    </Transition>
  </div>
</template>

<style scoped>
.font-roboto {
  font-family: 'Roboto', sans-serif;
}

.club-card {
  border-radius: 12px !important;
}

.club-details-overlay-enter-active,
.club-details-overlay-leave-active {
  transition: opacity 0.25s ease;
}

.club-details-overlay-enter-from,
.club-details-overlay-leave-to {
  opacity: 0;
}

.club-details-sheet-enter-active,
.club-details-sheet-leave-active {
  transition: transform 0.25s ease;
}

.club-details-sheet-enter-from,
.club-details-sheet-leave-to {
  transform: translateY(100%);
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
