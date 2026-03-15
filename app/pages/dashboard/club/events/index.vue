<script setup lang="ts">
definePageMeta({
  layout: 'dashboard',
  middleware: 'auth'
})

useSeoMeta({
  title: 'Mes événements - Sportly',
  description: 'Gérez vos événements sportifs'
})

const { user } = useAuth()
const toast = useToast()

const activeTab = ref<'upcoming' | 'past'>('upcoming')

const { data: eventsResponse, status, refresh } = useFetch('/api/events', {
  query: computed(() => ({
    organizerId: user.value?.id,
    limit: 50
  })),
  key: 'club-events',
  watch: [() => user.value?.id]
})

const allEvents = computed(() => (eventsResponse.value as any)?.data || [])

const now = new Date()

const upcomingEvents = computed(() =>
  allEvents.value.filter((e: any) => new Date(e.startTime) >= now)
)

const pastEvents = computed(() =>
  allEvents.value.filter((e: any) => new Date(e.startTime) < now)
)

const displayedEvents = computed(() =>
  activeTab.value === 'upcoming' ? upcomingEvents.value : pastEvents.value
)

const isLoading = computed(() => status.value === 'pending')

const EVENT_TYPE_LABELS: Record<string, string> = {
  STAGE: 'Stage',
  TOURNOI: 'Tournoi',
  ENTRAINEMENT: 'Entraînement',
  DECOUVERTE: 'Découverte'
}

const EVENT_TYPE_COLORS: Record<string, string> = {
  STAGE: 'bg-blue-100 text-blue-700',
  TOURNOI: 'bg-purple-100 text-purple-700',
  ENTRAINEMENT: 'bg-green-100 text-green-700',
  DECOUVERTE: 'bg-tango-100 text-tango-700'
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr)
  return d.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' })
}

function formatTime(dateStr: string): string {
  const d = new Date(dateStr)
  return d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }).replace(':', 'h')
}

function formatPrice(priceStr: string | null | undefined): string {
  if (!priceStr || Number(priceStr) === 0) return 'Gratuit'
  return `${Number(priceStr).toFixed(0)}€`
}

async function deleteEvent(eventId: string) {
  if (!confirm('Supprimer cet événement ?')) return
  try {
    await $fetch(`/api/events/${eventId}`, { method: 'DELETE' })
    toast.add({ title: 'Événement supprimé', color: 'success' })
    await refresh()
  } catch {
    toast.add({ title: 'Erreur lors de la suppression', color: 'error' })
  }
}
</script>

<template>
  <div class="flex flex-col pb-24 bg-white min-h-screen">
    <!-- Header -->
    <div class="flex items-center justify-between px-4 py-4 border-b border-[#e8e8e8]">
      <div class="flex items-center gap-3">
        <button class="size-10 flex items-center justify-center rounded-lg" @click="$router.back()">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M15 18L9 12L15 6" stroke="#1c1c1c" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
          </svg>
        </button>
        <h1 class="text-xl font-semibold text-[#1c1c1c] font-asap">Mes événements</h1>
      </div>
      <NuxtLink
        to="/dashboard/club/events/new"
        class="bg-tango-500 hover:bg-tango-600 text-white text-sm font-semibold px-4 py-2.5 rounded-full font-montserrat transition-colors flex items-center gap-2"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
          <path d="M12 5V19M5 12H19" stroke="white" stroke-width="2" stroke-linecap="round" />
        </svg>
        Créer
      </NuxtLink>
    </div>

    <!-- Tabs -->
    <div class="flex px-4 pt-4 gap-2">
      <button
        class="flex-1 py-2.5 text-sm font-semibold rounded-full transition-colors font-montserrat"
        :class="activeTab === 'upcoming' ? 'bg-[#1c1c1c] text-white' : 'bg-[#f0f0f0] text-[#545454]'"
        @click="activeTab = 'upcoming'"
      >
        À venir ({{ upcomingEvents.length }})
      </button>
      <button
        class="flex-1 py-2.5 text-sm font-semibold rounded-full transition-colors font-montserrat"
        :class="activeTab === 'past' ? 'bg-[#1c1c1c] text-white' : 'bg-[#f0f0f0] text-[#545454]'"
        @click="activeTab = 'past'"
      >
        Passés ({{ pastEvents.length }})
      </button>
    </div>

    <!-- Loading -->
    <div v-if="isLoading" class="px-4 pt-6 flex flex-col gap-4">
      <USkeleton v-for="i in 3" :key="i" class="h-28 w-full rounded-xl" />
    </div>

    <!-- Empty state -->
    <div v-else-if="displayedEvents.length === 0" class="flex flex-col items-center justify-center py-20 px-4 text-center">
      <div class="size-16 rounded-full bg-[#f0f0f0] flex items-center justify-center mb-4">
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
          <rect x="3" y="4" width="18" height="18" rx="2" stroke="#999" stroke-width="1.5" />
          <path d="M16 2V6M8 2V6M3 10H21" stroke="#999" stroke-width="1.5" stroke-linecap="round" />
        </svg>
      </div>
      <p class="text-base font-semibold text-[#1c1c1c] font-asap mb-1">
        {{ activeTab === 'upcoming' ? 'Aucun événement à venir' : 'Aucun événement passé' }}
      </p>
      <p class="text-sm text-[#545454] font-roboto mb-6">
        {{ activeTab === 'upcoming' ? 'Créez votre premier événement pour commencer' : 'Vos événements terminés apparaîtront ici' }}
      </p>
      <NuxtLink
        v-if="activeTab === 'upcoming'"
        to="/dashboard/club/events/new"
        class="bg-tango-500 hover:bg-tango-600 text-white text-sm font-semibold px-6 py-3 rounded-full font-montserrat transition-colors"
      >
        Créer un événement
      </NuxtLink>
    </div>

    <!-- Events list -->
    <div v-else class="px-4 pt-4 flex flex-col gap-3">
      <div
        v-for="evt in displayedEvents"
        :key="evt.id"
        class="border border-[#e8e8e8] rounded-xl p-4 flex flex-col gap-3"
      >
        <!-- Top row: type badge + actions -->
        <div class="flex items-center justify-between">
          <span
            class="px-2.5 py-0.5 rounded-full text-xs font-semibold font-roboto"
            :class="EVENT_TYPE_COLORS[evt.eventType] || 'bg-gray-100 text-gray-700'"
          >
            {{ EVENT_TYPE_LABELS[evt.eventType] || evt.eventType }}
          </span>
          <div class="flex items-center gap-1">
            <NuxtLink
              :to="`/dashboard/club/events/${evt.id}/edit`"
              class="size-8 flex items-center justify-center rounded-lg hover:bg-[#f0f0f0] transition-colors"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path d="M11 4H4C3.45 4 3 4.45 3 5V20C3 20.55 3.45 21 4 21H19C19.55 21 20 20.55 20 20V13M18.5 2.5C19.33 1.67 20.67 1.67 21.5 2.5C22.33 3.33 22.33 4.67 21.5 5.5L12 15L8 16L9 12L18.5 2.5Z" stroke="#545454" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
              </svg>
            </NuxtLink>
            <button
              class="size-8 flex items-center justify-center rounded-lg hover:bg-red-50 transition-colors"
              @click="deleteEvent(evt.id)"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path d="M3 6H5H21M19 6V20C19 21.1 18.1 22 17 22H7C5.9 22 5 21.1 5 20V6M8 6V4C8 2.9 8.9 2 10 2H14C15.1 2 16 2.9 16 4V6" stroke="#ef4444" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
              </svg>
            </button>
          </div>
        </div>

        <!-- Title -->
        <NuxtLink :to="`/events/${evt.id}`" class="text-base font-semibold text-[#1c1c1c] font-asap hover:text-tango-500 transition-colors">
          {{ evt.title }}
        </NuxtLink>

        <!-- Info row -->
        <div class="flex items-center gap-4 text-xs text-[#545454] font-roboto">
          <div class="flex items-center gap-1">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="9" stroke="#545454" stroke-width="1.5" />
              <path d="M12 7V12L15 15" stroke="#545454" stroke-width="1.5" stroke-linecap="round" />
            </svg>
            {{ formatDate(evt.startTime) }} · {{ formatTime(evt.startTime) }}
          </div>
          <div class="flex items-center gap-1">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
              <path d="M12 13C13.66 13 15 11.66 15 10C15 8.34 13.66 7 12 7C10.34 7 9 8.34 9 10C9 11.66 10.34 13 12 13Z" stroke="#545454" stroke-width="1.5" />
              <path d="M12 22C12 22 20 16 20 10C20 5.58 16.42 2 12 2C7.58 2 4 5.58 4 10C4 16 12 22 12 22Z" stroke="#545454" stroke-width="1.5" />
            </svg>
            {{ evt.address?.city || 'Non défini' }}
          </div>
        </div>

        <!-- Bottom row: price + participants -->
        <div class="flex items-center justify-between pt-2 border-t border-[#f0f0f0]">
          <span class="text-sm font-semibold text-[#1c1c1c] font-roboto">
            {{ formatPrice(evt.price) }}
          </span>
          <span v-if="evt.maxParticipants" class="text-xs text-[#545454] font-roboto">
            {{ evt.maxParticipants }} places max
          </span>
        </div>
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
