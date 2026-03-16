<script setup lang="ts">
definePageMeta({
  layout: 'dashboard',
  middleware: 'auth'
})

useSeoMeta({
  title: 'Mes inscriptions - Sportly',
  description: 'Consultez vos inscriptions aux événements'
})

const toast = useToast()

const { data: response, status, refresh } = useFetch('/api/user/registrations', {
  key: 'user-registrations'
})

const registrations = computed(() => (response.value as any)?.data || [])
const isLoading = computed(() => status.value === 'pending')

const activeTab = ref<'upcoming' | 'past'>('upcoming')

const now = new Date()

const upcomingRegistrations = computed(() =>
  registrations.value.filter((r: any) => new Date(r.event.startTime) >= now)
)

const pastRegistrations = computed(() =>
  registrations.value.filter((r: any) => new Date(r.event.startTime) < now)
)

const displayedRegistrations = computed(() =>
  activeTab.value === 'upcoming' ? upcomingRegistrations.value : pastRegistrations.value
)

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

const STATUS_LABELS: Record<string, string> = {
  REGISTERED: 'Inscrit',
  CANCELLED: 'Annulé',
  ATTENDED: 'Participé'
}

const STATUS_COLORS: Record<string, string> = {
  REGISTERED: 'bg-green-100 text-green-700',
  CANCELLED: 'bg-red-100 text-red-700',
  ATTENDED: 'bg-blue-100 text-blue-700'
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

async function cancelRegistration(eventId: string) {
  if (!confirm('Annuler votre inscription ?')) return
  try {
    await $fetch(`/api/events/${eventId}/register`, { method: 'DELETE' })
    toast.add({ title: 'Inscription annulée', color: 'success' })
    await refresh()
  } catch {
    toast.add({ title: 'Erreur lors de l\'annulation', color: 'error' })
  }
}
</script>

<template>
  <div class="flex flex-col pb-24 bg-white min-h-screen">
    <!-- Header -->
    <div class="flex items-center gap-3 px-4 py-4 border-b border-[#e8e8e8]">
      <button
        class="size-10 flex items-center justify-center rounded-lg"
        @click="$router.back()"
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <path d="M15 18L9 12L15 6" stroke="#1c1c1c" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
        </svg>
      </button>
      <h1 class="text-xl font-semibold text-[#1c1c1c] font-asap">
        Mes inscriptions
      </h1>
    </div>

    <!-- Tabs -->
    <div class="flex px-4 pt-4 gap-2">
      <button
        class="flex-1 py-2.5 text-sm font-semibold rounded-full transition-colors font-montserrat"
        :class="activeTab === 'upcoming' ? 'bg-[#1c1c1c] text-white' : 'bg-[#f0f0f0] text-[#545454]'"
        @click="activeTab = 'upcoming'"
      >
        À venir ({{ upcomingRegistrations.length }})
      </button>
      <button
        class="flex-1 py-2.5 text-sm font-semibold rounded-full transition-colors font-montserrat"
        :class="activeTab === 'past' ? 'bg-[#1c1c1c] text-white' : 'bg-[#f0f0f0] text-[#545454]'"
        @click="activeTab = 'past'"
      >
        Passés ({{ pastRegistrations.length }})
      </button>
    </div>

    <!-- Loading -->
    <div v-if="isLoading" class="px-4 pt-6 flex flex-col gap-4">
      <USkeleton v-for="i in 3" :key="i" class="h-28 w-full rounded-xl" />
    </div>

    <!-- Empty state -->
    <div
      v-else-if="displayedRegistrations.length === 0"
      class="flex flex-col items-center justify-center py-20 px-4 text-center"
    >
      <div class="size-16 rounded-full bg-[#f0f0f0] flex items-center justify-center mb-4">
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
          <rect
            x="3"
            y="4"
            width="18"
            height="18"
            rx="2"
            stroke="#999"
            stroke-width="1.5"
          />
          <path
            d="M16 2V6M8 2V6M3 10H21"
            stroke="#999"
            stroke-width="1.5"
            stroke-linecap="round"
          />
        </svg>
      </div>
      <p class="text-base font-semibold text-[#1c1c1c] font-asap mb-1">
        {{ activeTab === 'upcoming' ? 'Aucune inscription à venir' : 'Aucun événement passé' }}
      </p>
      <p class="text-sm text-[#545454] font-roboto mb-6">
        {{ activeTab === 'upcoming' ? 'Parcourez les événements pour vous inscrire' : 'Vos participations passées apparaîtront ici' }}
      </p>
      <NuxtLink
        v-if="activeTab === 'upcoming'"
        to="/events"
        class="bg-tango-500 hover:bg-tango-600 text-white text-sm font-semibold px-6 py-3 rounded-full font-montserrat transition-colors"
      >
        Voir les événements
      </NuxtLink>
    </div>

    <!-- Registrations list -->
    <div v-else class="px-4 pt-4 flex flex-col gap-3">
      <div
        v-for="reg in displayedRegistrations"
        :key="reg.eventId"
        class="border border-[#e8e8e8] rounded-xl p-4 flex flex-col gap-3"
      >
        <!-- Top row: type badge + status -->
        <div class="flex items-center justify-between">
          <span
            class="px-2.5 py-0.5 rounded-full text-xs font-semibold font-roboto"
            :class="EVENT_TYPE_COLORS[reg.event.eventType] || 'bg-gray-100 text-gray-700'"
          >
            {{ EVENT_TYPE_LABELS[reg.event.eventType] || reg.event.eventType }}
          </span>
          <span
            class="px-2.5 py-0.5 rounded-full text-xs font-semibold font-roboto"
            :class="STATUS_COLORS[reg.status] || 'bg-gray-100 text-gray-700'"
          >
            {{ STATUS_LABELS[reg.status] || reg.status }}
          </span>
        </div>

        <!-- Title -->
        <NuxtLink
          :to="`/events/${reg.event.id}`"
          class="text-base font-semibold text-[#1c1c1c] font-asap hover:text-tango-500 transition-colors"
        >
          {{ reg.event.title }}
        </NuxtLink>

        <!-- Info row -->
        <div class="flex items-center gap-4 text-xs text-[#545454] font-roboto">
          <div class="flex items-center gap-1">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="9" stroke="#545454" stroke-width="1.5" />
              <path d="M12 7V12L15 15" stroke="#545454" stroke-width="1.5" stroke-linecap="round" />
            </svg>
            {{ formatDate(reg.event.startTime) }} · {{ formatTime(reg.event.startTime) }}
          </div>
          <div v-if="reg.address?.city" class="flex items-center gap-1">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
              <path d="M12 13C13.66 13 15 11.66 15 10C15 8.34 13.66 7 12 7C10.34 7 9 8.34 9 10C9 11.66 10.34 13 12 13Z" stroke="#545454" stroke-width="1.5" />
              <path d="M12 22C12 22 20 16 20 10C20 5.58 16.42 2 12 2C7.58 2 4 5.58 4 10C4 16 12 22 12 22Z" stroke="#545454" stroke-width="1.5" />
            </svg>
            {{ reg.address.city }}
          </div>
        </div>

        <!-- Bottom row: price + cancel -->
        <div class="flex items-center justify-between pt-2 border-t border-[#f0f0f0]">
          <span class="text-sm font-semibold text-[#1c1c1c] font-roboto">
            {{ formatPrice(reg.event.price) }}
          </span>
          <button
            v-if="reg.status === 'REGISTERED' && activeTab === 'upcoming'"
            class="text-xs text-red-500 font-semibold font-roboto hover:underline"
            @click="cancelRegistration(reg.eventId)"
          >
            Annuler
          </button>
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
