<script setup lang="ts">
definePageMeta({
  layout: 'dashboard'
})

useHead({
  title: 'Événements - Sportly'
})

const searchQuery = ref('')
const selectedType = ref('')
const selectedSport = ref('')
const selectedDateRange = ref('')
const customDateFrom = ref('')
const customDateTo = ref('')
const selectedCity = ref('')
const showFilters = ref(false)

const eventTypes = [
  { value: '', label: 'Tous' },
  { value: 'STAGE', label: '🏕️ Stage' },
  { value: 'TOURNOI', label: '🏆 Tournoi' },
  { value: 'ENTRAINEMENT', label: '🏋️ Entraînement' },
  { value: 'DECOUVERTE', label: '🔍 Découverte' }
]

const dateRanges = [
  { value: '', label: 'Toutes dates' },
  { value: 'today', label: 'Aujourd\'hui' },
  { value: 'week', label: 'Cette semaine' },
  { value: 'month', label: 'Ce mois' },
  { value: 'custom', label: 'Personnalisé' }
]

function getDateRange(range: string): { from?: string, to?: string } {
  const now = new Date()
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate())

  switch (range) {
    case 'today': {
      const endOfDay = new Date(startOfDay)
      endOfDay.setDate(endOfDay.getDate() + 1)
      return { from: startOfDay.toISOString(), to: endOfDay.toISOString() }
    }
    case 'week': {
      const endOfWeek = new Date(startOfDay)
      endOfWeek.setDate(endOfWeek.getDate() + (7 - endOfWeek.getDay()))
      return { from: startOfDay.toISOString(), to: endOfWeek.toISOString() }
    }
    case 'month': {
      const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1)
      return { from: startOfDay.toISOString(), to: endOfMonth.toISOString() }
    }
    case 'custom': {
      const result: { from?: string, to?: string } = {}
      if (customDateFrom.value) result.from = new Date(customDateFrom.value).toISOString()
      if (customDateTo.value) result.to = new Date(customDateTo.value + 'T23:59:59').toISOString()
      return result
    }
    default:
      return {}
  }
}

const limit = ref(20)
const offset = ref(0)

const activeFilterCount = computed(() => {
  let count = 0
  if (selectedType.value) count++
  if (selectedSport.value) count++
  if (selectedDateRange.value) count++
  if (selectedCity.value) count++
  return count
})

const queryParams = computed(() => {
  const params: Record<string, string | number> = {
    limit: limit.value,
    offset: offset.value
  }
  if (selectedType.value) params.type = selectedType.value
  if (selectedSport.value) params.sport = selectedSport.value
  if (selectedCity.value) params.city = selectedCity.value

  const dateRange = getDateRange(selectedDateRange.value)
  if (dateRange.from) params.dateFrom = dateRange.from
  if (dateRange.to) params.dateTo = dateRange.to

  return params
})

const { data: eventsResponse, status } = useFetch('/api/events', {
  query: queryParams,
  key: 'events-list'
})

const isLoading = computed(() => status.value === 'pending')

const events = computed(() => (eventsResponse.value as any)?.data ?? [])
const total = computed(() => (eventsResponse.value as any)?.total ?? 0)

const EVENT_TYPE_LABELS: Record<string, string> = {
  STAGE: '🏕️ Stage',
  TOURNOI: '🏆 Tournoi',
  ENTRAINEMENT: '🏋️ Entraînement',
  DECOUVERTE: '🔍 Découverte'
}

function formatEventDate(dateStr: string | null | undefined): string {
  if (!dateStr) return ''
  const d = new Date(dateStr)
  return d.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' })
}

function formatEventTime(startStr: string | null | undefined, endStr: string | null | undefined): string {
  if (!startStr || !endStr) return ''
  const start = new Date(startStr)
  const end = new Date(endStr)
  const fmt = (d: Date) => d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
  return `${fmt(start)} - ${fmt(end)}`
}

function formatPrice(priceStr: string | null | undefined): string {
  if (!priceStr || Number(priceStr) === 0) return 'Gratuit'
  return `${Number(priceStr).toFixed(0)}€`
}

function loadMore() {
  offset.value += limit.value
}

function resetFilters() {
  selectedType.value = ''
  selectedSport.value = ''
  selectedDateRange.value = ''
  customDateFrom.value = ''
  customDateTo.value = ''
  selectedCity.value = ''
  showFilters.value = false
  offset.value = 0
}

watch([selectedType, selectedSport, selectedDateRange, customDateFrom, customDateTo, selectedCity], () => {
  offset.value = 0
})
</script>

<template>
  <div class="flex flex-col gap-6 pb-24 px-4">
    <!-- Header -->
    <div class="flex items-center justify-between">
      <h1 class="text-2xl font-semibold text-[#1c1c1c] tracking-tight font-asap">
        Événements
      </h1>
      <span class="text-sm text-[#545454] font-roboto">{{ total }} résultat(s)</span>
    </div>

    <!-- Search bar -->
    <div class="relative">
      <input
        v-model="searchQuery"
        type="text"
        placeholder="Rechercher un événement..."
        class="search-input w-full bg-white border border-[#d6d6d6] h-12 pl-12 pr-4 text-base text-[#1c1c1c] placeholder-[rgba(28,28,28,0.5)] font-roboto focus:outline-none focus:border-tango-500"
      >
      <svg
        class="absolute left-4 top-1/2 -translate-y-1/2 text-[#545454]"
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M21 21L16.65 16.65M19 11C19 15.4183 15.4183 19 11 19C6.58172 19 3 15.4183 3 11C3 6.58172 6.58172 3 11 3C15.4183 3 19 6.58172 19 11Z"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
      </svg>
    </div>

    <!-- Type filter pills -->
    <div class="flex gap-2 overflow-x-auto hide-scrollbar -mx-4 px-4">
      <button
        v-for="type in eventTypes"
        :key="type.value"
        class="shrink-0 px-4 py-2 rounded-full text-sm font-roboto transition-colors"
        :class="[
          selectedType === type.value
            ? 'bg-tango-500 text-white'
            : 'bg-white border border-[#d6d6d6] text-[#545454]'
        ]"
        @click="selectedType = type.value"
      >
        {{ type.label }}
      </button>
    </div>

    <!-- Filter toggle -->
    <button
      class="flex items-center gap-2 text-sm font-roboto transition-colors"
      :class="showFilters ? 'text-tango-500 font-semibold' : 'text-[#545454]'"
      @click="showFilters = !showFilters"
    >
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
        <path d="M22 3H2L10 12.46V19L14 21V12.46L22 3Z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
      </svg>
      Filtres{{ activeFilterCount > 0 ? ` (${activeFilterCount})` : '' }}
      <svg
        width="14"
        height="14"
        viewBox="0 0 24 24"
        fill="none"
        class="transition-transform"
        :class="showFilters ? 'rotate-180' : ''"
      >
        <path d="M6 9L12 15L18 9" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
      </svg>
    </button>

    <!-- Expanded filters -->
    <div v-if="showFilters" class="flex flex-col gap-4 bg-[#fafafa] border border-[#e8e8e8] rounded-xl p-4 -mt-2">
      <!-- Date range -->
      <div class="flex flex-col gap-2">
        <span class="text-xs font-semibold text-[#1c1c1c] font-roboto uppercase tracking-wide">Date</span>
        <div class="flex gap-2 flex-wrap">
          <button
            v-for="dr in dateRanges"
            :key="dr.value"
            class="px-3 py-1.5 rounded-full text-xs font-roboto transition-colors"
            :class="[
              selectedDateRange === dr.value
                ? 'bg-[#1c1c1c] text-white'
                : 'bg-white border border-[#d6d6d6] text-[#545454]'
            ]"
            @click="selectedDateRange = dr.value"
          >
            {{ dr.label }}
          </button>
        </div>
        <!-- Custom date pickers -->
        <div v-if="selectedDateRange === 'custom'" class="grid grid-cols-2 gap-3 mt-1">
          <div class="flex flex-col gap-1">
            <label class="text-xs text-[#545454] font-roboto">Du</label>
            <input
              v-model="customDateFrom"
              type="date"
              class="bg-white border border-[#d6d6d6] rounded-lg h-10 px-3 text-sm text-[#1c1c1c] font-roboto focus:outline-none focus:border-tango-500"
            >
          </div>
          <div class="flex flex-col gap-1">
            <label class="text-xs text-[#545454] font-roboto">Au</label>
            <input
              v-model="customDateTo"
              type="date"
              class="bg-white border border-[#d6d6d6] rounded-lg h-10 px-3 text-sm text-[#1c1c1c] font-roboto focus:outline-none focus:border-tango-500"
            >
          </div>
        </div>
      </div>

      <!-- City -->
      <div class="flex flex-col gap-2">
        <span class="text-xs font-semibold text-[#1c1c1c] font-roboto uppercase tracking-wide">Localisation</span>
        <div class="relative">
          <input
            v-model="selectedCity"
            type="text"
            placeholder="Ville (ex: Lille, Paris...)"
            class="w-full bg-white border border-[#d6d6d6] rounded-lg h-10 pl-9 pr-3 text-sm text-[#1c1c1c] placeholder-[#999] font-roboto focus:outline-none focus:border-tango-500"
          >
          <svg class="absolute left-3 top-1/2 -translate-y-1/2" width="14" height="14" viewBox="0 0 24 24" fill="none">
            <path d="M12 13C13.66 13 15 11.66 15 10C15 8.34 13.66 7 12 7C10.34 7 9 8.34 9 10C9 11.66 10.34 13 12 13Z" stroke="#999" stroke-width="1.5" />
            <path d="M12 22C12 22 20 16 20 10C20 5.58 16.42 2 12 2C7.58 2 4 5.58 4 10C4 16 12 22 12 22Z" stroke="#999" stroke-width="1.5" />
          </svg>
        </div>
      </div>

      <!-- Reset -->
      <button
        v-if="activeFilterCount > 0"
        class="self-start text-xs text-tango-500 font-semibold font-roboto underline"
        @click="resetFilters"
      >
        Réinitialiser tous les filtres
      </button>
    </div>

    <!-- Loading -->
    <div v-if="isLoading" class="flex flex-col gap-4">
      <USkeleton v-for="i in 3" :key="i" class="h-40 w-full rounded-2xl" />
    </div>

    <!-- Event cards -->
    <div v-else-if="events.length > 0" class="flex flex-col gap-4">
      <NuxtLink
        v-for="evt in events"
        :key="evt.id"
        :to="`/events/${evt.id}`"
        class="event-card bg-white border border-[#d6d6d6] p-4 flex flex-col gap-3 no-underline"
      >
        <!-- Header -->
        <div class="flex items-start justify-between">
          <span class="text-xs font-medium text-[#c45400] bg-[#fef3c7] px-2 py-1 rounded-md font-roboto">
            {{ EVENT_TYPE_LABELS[evt.eventType] || evt.eventType }}
          </span>
          <span class="text-xs text-[#545454] font-roboto">
            {{ formatPrice(evt.price) }}
          </span>
        </div>

        <!-- Title -->
        <h3 class="text-base font-medium text-[#1c1c1c] font-roboto">
          {{ evt.title }}
        </h3>

        <!-- Tags -->
        <div class="flex flex-wrap gap-2">
          <span class="bg-[#f7f7f7] px-3 py-1.5 rounded-xl text-sm text-[#1c1c1c] font-roboto">
            📆 {{ formatEventDate(evt.startTime) }} de {{ formatEventTime(evt.startTime, evt.endTime) }}
          </span>
          <span v-if="evt.maxParticipants" class="bg-[#f7f7f7] px-3 py-1.5 rounded-xl text-sm text-[#1c1c1c] font-roboto">
            👥 {{ evt.maxParticipants }} places
          </span>
          <span v-if="evt.address?.city" class="bg-[#f7f7f7] px-3 py-1.5 rounded-xl text-sm text-[#1c1c1c] font-roboto">
            📍 {{ evt.address.city }}
          </span>
        </div>
      </NuxtLink>

      <!-- Load more -->
      <div v-if="events.length < total" class="flex justify-center pt-4">
        <UButton
          variant="outline"
          color="neutral"
          @click="loadMore"
        >
          Voir plus
        </UButton>
      </div>
    </div>

    <!-- Empty state -->
    <div v-else class="flex flex-col items-center py-16 gap-4 text-center">
      <span class="text-5xl">🗓️</span>
      <p class="text-xl font-semibold text-[#1c1c1c] font-asap">
        Aucun événement
      </p>
      <p class="text-sm text-[#545454] font-roboto">
        Aucun événement ne correspond à vos critères.
      </p>
      <UButton variant="outline" color="neutral" @click="resetFilters">
        Réinitialiser les filtres
      </UButton>
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

.hide-scrollbar {
  -ms-overflow-style: none;
  scrollbar-width: none;
}

.hide-scrollbar::-webkit-scrollbar {
  display: none;
}

.event-card {
  border-radius: 16px !important;
}

.search-input {
  border-radius: 12px !important;
}
</style>
