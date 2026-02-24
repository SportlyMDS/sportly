<script setup lang="ts">
const props = withDefaults(defineProps<{
  searchQuery: string
  showFavoritesOnly: boolean
  selectedDistance: string
  selectedCategory: string
  distances?: string[]
  categories?: string[]
}>(), {
  distances: () => [],
  categories: () => []
})

const emit = defineEmits<{
  'update:searchQuery': [value: string]
  'update:showFavoritesOnly': [value: boolean]
  'update:selectedDistance': [value: string]
  'update:selectedCategory': [value: string]
}>()

const showDistanceDropdown = ref(false)
const showCategoryDropdown = ref(false)

const searchQueryModel = computed({
  get: () => props.searchQuery,
  set: (value: string) => emit('update:searchQuery', value)
})

const showFavoritesOnlyModel = computed({
  get: () => props.showFavoritesOnly,
  set: (value: boolean) => emit('update:showFavoritesOnly', value)
})

const selectedDistanceModel = computed({
  get: () => props.selectedDistance,
  set: (value: string) => emit('update:selectedDistance', value)
})

const selectedCategoryModel = computed({
  get: () => props.selectedCategory,
  set: (value: string) => emit('update:selectedCategory', value)
})

function toggleFavorites() {
  showFavoritesOnlyModel.value = !showFavoritesOnlyModel.value
}

function toggleDistanceDropdown() {
  showDistanceDropdown.value = !showDistanceDropdown.value
  if (showDistanceDropdown.value) {
    showCategoryDropdown.value = false
  }
}

function toggleCategoryDropdown() {
  showCategoryDropdown.value = !showCategoryDropdown.value
  if (showCategoryDropdown.value) {
    showDistanceDropdown.value = false
  }
}

function selectDistance(distance: string) {
  selectedDistanceModel.value = distance
  showDistanceDropdown.value = false
}

function clearCategory() {
  selectedCategoryModel.value = ''
  showCategoryDropdown.value = false
}

function selectCategory(category: string) {
  selectedCategoryModel.value = category
  showCategoryDropdown.value = false
}
</script>

<template>
  <div class="bg-white px-4 py-4 flex flex-col gap-3">
    <!-- Search bar -->
    <div class="relative">
      <input
        v-model="searchQueryModel"
        type="text"
        placeholder="Rechercher des clubs, activités"
        class="search-input w-full bg-white border border-[#d6d6d6] h-12 pl-4 pr-12 text-base text-[#1c1c1c] placeholder-[rgba(28,28,28,0.5)] font-roboto focus:outline-none focus:border-tango-500"
      >
      <button
        type="button"
        class="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center"
      >
        <svg
          class="text-tango-500"
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
        type="button"
        class="h-10 w-12 shrink-0 border rounded-full flex items-center justify-center transition-colors"
        :class="showFavoritesOnlyModel ? 'border-tango-500 bg-[rgba(239,120,30,0.1)]' : 'border-[#d6d6d6] bg-white'"
        @click="toggleFavorites"
      >
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          :fill="showFavoritesOnlyModel ? '#ef781e' : 'none'"
          :class="showFavoritesOnlyModel ? 'text-tango-500' : 'text-[#545454]'"
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
      <div class="relative shrink-0">
        <button
          type="button"
          class="h-10 px-4 border border-[#d6d6d6] bg-white rounded-full flex items-center gap-2 text-sm font-roboto text-[#1c1c1c] whitespace-nowrap"
          @click="toggleDistanceDropdown"
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
          <span>Rayon | {{ selectedDistanceModel }}</span>
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
            type="button"
            class="w-full px-3 py-2 text-left text-sm font-roboto hover:bg-gray-100"
            :class="selectedDistanceModel === dist ? 'text-tango-500' : 'text-[#1c1c1c]'"
            @click="selectDistance(dist)"
          >
            {{ dist }}
          </button>
        </div>
      </div>

      <!-- Categories dropdown -->
      <div class="relative shrink-0">
        <button
          type="button"
          class="h-10 px-4 w-full border border-[#d6d6d6] bg-white rounded-full flex items-center justify-between gap-2 text-sm font-roboto text-[#1c1c1c]"
          @click="toggleCategoryDropdown"
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
            <span>{{ selectedCategoryModel || 'Catégories' }}</span>
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
            type="button"
            class="w-full px-3 py-2 text-left text-sm font-roboto hover:bg-gray-100 text-[#545454]"
            @click="clearCategory"
          >
            Toutes
          </button>
          <button
            v-for="cat in categories"
            :key="cat"
            type="button"
            class="w-full px-3 py-2 text-left text-sm font-roboto hover:bg-gray-100"
            :class="selectedCategoryModel === cat ? 'text-tango-500' : 'text-[#1c1c1c]'"
            @click="selectCategory(cat)"
          >
            {{ cat }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.font-roboto {
  font-family: 'Roboto', sans-serif;
}

.search-input {
  border-radius: 12px !important;
}

.scrollbar-hide {
  -ms-overflow-style: none;
  scrollbar-width: none;
}

.scrollbar-hide::-webkit-scrollbar {
  display: none;
}
</style>
