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

const eventTypes = [
  { value: '', label: 'Tous' },
  { value: 'STAGE', label: '🏕️ Stage' },
  { value: 'TOURNOI', label: '🏆 Tournoi' },
  { value: 'ENTRAINEMENT', label: '🏋️ Entraînement' },
  { value: 'DECOUVERTE', label: '🔍 Découverte' }
]

const limit = ref(20)
const offset = ref(0)

const queryParams = computed(() => {
  const params: Record<string, string | number> = {
    limit: limit.value,
    offset: offset.value
  }
  if (selectedType.value) params.type = selectedType.value
  if (selectedSport.value) params.sport = selectedSport.value
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
  offset.value = 0
}

watch([selectedType, selectedSport], () => {
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
