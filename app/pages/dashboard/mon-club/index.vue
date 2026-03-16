<script setup lang="ts">
definePageMeta({
  layout: 'dashboard',
  middleware: 'auth'
})

useSeoMeta({
  title: 'Dashboard Club - Sportly',
  description: 'Gérez votre club sportif et vos événements.'
})

const { user, signOut } = useAuth()

async function handleLogout() {
  await signOut()
  navigateTo('/')
}

const activeTab = ref<'events' | 'members'>('events')

// Stats du club
const { data: clubStats, status: statsStatus } = useFetch('/api/clubs/me/stats', {
  key: 'club-stats'
})

// Événements du club
const { data: eventsResponse, status: eventsStatus } = useFetch('/api/events', {
  query: computed(() => ({
    organizerId: user.value?.id,
    limit: 20
  })),
  key: 'club-dashboard-events',
  watch: [() => user.value?.id]
})

const clubEvents = computed(() => (eventsResponse.value as any)?.data || [])

const isLoading = computed(() => statsStatus.value === 'pending')

// Participants par événement
const participantsCounts = ref<Record<string, { registered: number }>>({})

async function loadParticipantsCounts() {
  for (const evt of clubEvents.value) {
    try {
      const res = await $fetch<any>(`/api/events/${evt.id}/participants`, {
        query: { limit: 1 }
      })
      participantsCounts.value[evt.id] = { registered: res.total || 0 }
    } catch {
      participantsCounts.value[evt.id] = { registered: 0 }
    }
  }
}

watch(clubEvents, (val) => {
  if (val.length > 0) loadParticipantsCounts()
}, { immediate: true })

function formatDate(dateStr: string): string {
  const d = new Date(dateStr)
  return d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })
}

function formatTime(dateStr: string): string {
  const d = new Date(dateStr)
  return d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
}

function getEventStatus(evt: any): string {
  const now = new Date()
  const start = new Date(evt.startTime)
  const end = new Date(evt.endTime)
  if (now < start) return 'Actif'
  if (now >= start && now <= end) return 'En cours'
  return 'Terminé'
}

function getStatusColor(status: string): string {
  if (status === 'Actif') return 'text-green-600 bg-green-50'
  if (status === 'En cours') return 'text-tango-600 bg-tango-50'
  return 'text-gray-500 bg-gray-100'
}

const EVENT_TYPE_ICONS: Record<string, string> = {
  TOURNOI: '🏆',
  STAGE: '⛺',
  ENTRAINEMENT: '🏋️',
  DECOUVERTE: '🔍'
}

const OFFER_LABELS: Record<string, string> = {
  ESSENTIEL: 'Plan Essentiel',
  VISIBILITE: 'Plan Visibilité',
  VISIBILITE_PLUS: 'Plan Visibilité +',
  PREMIUM: 'Plan Premium'
}
</script>

<template>
  <div class="flex flex-col gap-0 px-4">
    <!-- Loading -->
    <div
      v-if="isLoading"
      class="flex flex-col gap-4"
    >
      <USkeleton class="h-16 w-full rounded-xl" />
      <USkeleton class="h-10 w-3/4 rounded-lg" />
      <div class="grid grid-cols-2 gap-4">
        <USkeleton class="h-24 rounded-xl" />
        <USkeleton class="h-24 rounded-xl" />
      </div>
      <USkeleton class="h-24 w-1/2 rounded-xl" />
    </div>

    <!-- Content -->
    <div
      v-else
      class="flex flex-col gap-8 pt-2"
    >
      <!-- Club info -->
      <div class="flex flex-col gap-4">
        <div class="flex items-center gap-4">
          <div class="flex items-center gap-4 flex-1">
            <!-- Avatar -->
            <div class="size-12 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden shrink-0">
              <span class="text-lg font-bold text-gray-500 font-asap">
                {{ (clubStats as any)?.club?.clubName?.charAt(0) || 'C' }}
              </span>
            </div>
            <!-- Name + subtitle -->
            <div class="flex flex-col gap-1">
              <h1 class="text-2xl font-semibold text-[#212121] font-asap leading-tight">
                {{ (clubStats as any)?.club?.clubName || 'Mon Club' }}
              </h1>
              <p class="text-base text-[#545454] font-montserrat">
                Gestion du club
              </p>
              <span
                v-if="(clubStats as any)?.club?.offerType"
                class="bg-tango-500/10 text-tango-500 text-xs font-montserrat px-2 py-1 rounded-full w-fit"
              >
                {{ OFFER_LABELS[(clubStats as any)?.club?.offerType] || (clubStats as any)?.club?.offerType }}
              </span>
            </div>
          </div>
        </div>

        <!-- Address -->
        <div class="flex flex-col gap-2">
          <div
            v-if="(clubStats as any)?.address"
            class="flex items-center gap-1"
          >
            <svg
              width="15"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
            >
              <path
                d="M12 13C13.66 13 15 11.66 15 10C15 8.34 13.66 7 12 7C10.34 7 9 8.34 9 10C9 11.66 10.34 13 12 13Z"
                stroke="#545454"
                stroke-width="1.5"
              />
              <path
                d="M12 22C12 22 20 16 20 10C20 5.58 16.42 2 12 2C7.58 2 4 5.58 4 10C4 16 12 22 12 22Z"
                stroke="#545454"
                stroke-width="1.5"
              />
            </svg>
            <span class="text-sm text-[#545454] font-montserrat">
              {{ (clubStats as any)?.address?.line1 }}, {{ (clubStats as any)?.address?.city }}
            </span>
          </div>
        </div>
      </div>

      <!-- KPI Cards -->
      <div class="flex flex-col gap-4">
        <div class="grid grid-cols-2 gap-4">
          <!-- Members -->
          <div class="bg-gray-100 rounded-xl p-4 flex flex-col gap-1 shadow-sm">
            <div class="flex items-center justify-between">
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
              >
                <path
                  d="M17 21V19C17 16.79 15.21 15 13 15H5C2.79 15 1 16.79 1 19V21"
                  stroke="#545454"
                  stroke-width="1.5"
                  stroke-linecap="round"
                />
                <circle
                  cx="9"
                  cy="7"
                  r="4"
                  stroke="#545454"
                  stroke-width="1.5"
                />
                <path
                  d="M23 21V19C23 17.36 21.94 15.95 20.5 15.44"
                  stroke="#545454"
                  stroke-width="1.5"
                  stroke-linecap="round"
                />
                <path
                  d="M16.5 3.44C17.94 3.95 19 5.36 19 7C19 8.64 17.94 10.05 16.5 10.56"
                  stroke="#545454"
                  stroke-width="1.5"
                  stroke-linecap="round"
                />
              </svg>
            </div>
            <span class="text-3xl font-semibold text-[#212121] font-asap">
              {{ (clubStats as any)?.stats?.totalMembers || 0 }}
            </span>
            <span class="text-sm text-[#545454] font-montserrat">
              Membres
            </span>
          </div>

          <!-- Revenue -->
          <div class="bg-gray-100 rounded-xl p-4 flex flex-col gap-1 shadow-sm">
            <div class="flex items-center justify-between">
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
              >
                <path
                  d="M12 1V23M17 5H9.5C8.57 5 7.68 5.37 7.02 6.02C6.37 6.68 6 7.57 6 8.5C6 9.43 6.37 10.32 7.02 10.98C7.68 11.63 8.57 12 9.5 12H14.5C15.43 12 16.32 12.37 16.98 13.02C17.63 13.68 18 14.57 18 15.5C18 16.43 17.63 17.32 16.98 17.98C16.32 18.63 15.43 19 14.5 19H6"
                  stroke="#545454"
                  stroke-width="1.5"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />
              </svg>
            </div>
            <span class="text-3xl font-semibold text-[#212121] font-asap">
              {{ (clubStats as any)?.stats?.totalRevenue || 0 }}€
            </span>
            <span class="text-sm text-[#545454] font-montserrat">
              Revenus
            </span>
          </div>
        </div>

        <!-- Events count -->
        <div class="bg-gray-100 rounded-xl p-4 flex flex-col gap-1 shadow-sm w-1/2">
          <div class="flex items-center justify-between">
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
            >
              <rect
                x="3"
                y="4"
                width="18"
                height="18"
                rx="2"
                stroke="#545454"
                stroke-width="1.5"
              />
              <path
                d="M16 2V6M8 2V6M3 10H21"
                stroke="#545454"
                stroke-width="1.5"
                stroke-linecap="round"
              />
            </svg>
            <span
              v-if="(clubStats as any)?.stats?.eventsThisMonth"
              class="text-xs font-semibold text-green-600 bg-green-50 px-1.5 py-0.5 rounded-full font-montserrat"
            >
              +{{ (clubStats as any)?.stats?.eventsThisMonth }}
            </span>
          </div>
          <span class="text-3xl font-semibold text-[#212121] font-asap">
            {{ (clubStats as any)?.stats?.totalEvents || 0 }}
          </span>
          <span class="text-sm text-[#545454] font-montserrat">
            Événements
          </span>
        </div>
      </div>

      <!-- Quick Actions -->
      <div class="grid grid-cols-2 gap-4">
        <NuxtLink
          to="/dashboard/mon-club/events/new"
          class="bg-tango-500 text-white rounded-xl p-4 flex flex-col items-center gap-2 hover:bg-tango-600 transition-colors"
        >
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
          >
            <path
              d="M12 5V19M5 12H19"
              stroke="white"
              stroke-width="2"
              stroke-linecap="round"
            />
          </svg>
          <span class="text-sm font-semibold font-montserrat">
            Nouvel événement
          </span>
        </NuxtLink>

        <div class="bg-white border border-[#d6d6d6] rounded-xl p-4 flex flex-col items-center gap-2">
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
          >
            <path
              d="M17 21V19C17 16.79 15.21 15 13 15H5C2.79 15 1 16.79 1 19V21"
              stroke="#545454"
              stroke-width="1.5"
              stroke-linecap="round"
            />
            <circle
              cx="9"
              cy="7"
              r="4"
              stroke="#545454"
              stroke-width="1.5"
            />
            <path
              d="M23 12H17"
              stroke="#545454"
              stroke-width="1.5"
              stroke-linecap="round"
            />
            <path
              d="M20 9V15"
              stroke="#545454"
              stroke-width="1.5"
              stroke-linecap="round"
            />
          </svg>
          <span class="text-sm font-semibold text-[#212121] font-montserrat">
            Inviter membres
          </span>
        </div>

        <div class="bg-white border border-[#d6d6d6] rounded-xl p-4 flex flex-col items-center gap-2">
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
          >
            <path
              d="M22 12H18L15 21L9 3L6 12H2"
              stroke="#545454"
              stroke-width="1.5"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </svg>
          <span class="text-sm font-semibold text-[#212121] font-montserrat">
            Statistiques
          </span>
        </div>
      </div>

      <!-- Tabs -->
      <div class="flex border-b border-[#e2e8f0]">
        <button
          class="flex-1 py-3 text-sm font-semibold font-montserrat transition-colors border-b-2"
          :class="activeTab === 'events' ? 'text-[#212121] border-[#212121]' : 'text-[#545454] border-transparent'"
          @click="activeTab = 'events'"
        >
          Événements
        </button>
        <button
          class="flex-1 py-3 text-sm font-semibold font-montserrat transition-colors border-b-2"
          :class="activeTab === 'members' ? 'text-[#212121] border-[#212121]' : 'text-[#545454] border-transparent'"
          @click="activeTab = 'members'"
        >
          Membres
        </button>
      </div>

      <!-- Tab: Événements -->
      <div
        v-if="activeTab === 'events'"
        class="flex flex-col gap-4"
      >
        <div
          v-if="eventsStatus === 'pending'"
          class="flex flex-col gap-3"
        >
          <USkeleton
            v-for="i in 3"
            :key="i"
            class="h-32 w-full rounded-xl"
          />
        </div>

        <div
          v-else-if="clubEvents.length === 0"
          class="flex flex-col items-center py-12 text-center"
        >
          <div class="size-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
            <svg
              width="28"
              height="28"
              viewBox="0 0 24 24"
              fill="none"
            >
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
          <p class="text-base font-semibold text-[#212121] font-asap mb-1">
            Aucun événement
          </p>
          <p class="text-sm text-[#545454] font-montserrat mb-4">
            Créez votre premier événement
          </p>
          <NuxtLink
            to="/dashboard/mon-club/events/new"
            class="bg-tango-500 text-white text-sm font-semibold px-6 py-3 rounded-full font-montserrat"
          >
            Créer un événement
          </NuxtLink>
        </div>

        <div
          v-else
          class="flex flex-col gap-3"
        >
          <div
            v-for="evt in clubEvents"
            :key="evt.id"
            class="border border-[#e2e8f0] rounded-xl p-4 flex flex-col gap-3"
          >
            <!-- Top: icon + title + status -->
            <div class="flex items-start gap-3">
              <div class="size-10 rounded-full bg-tango-50 flex items-center justify-center shrink-0">
                <span class="text-lg">
                  {{ EVENT_TYPE_ICONS[evt.eventType] || '📅' }}
                </span>
              </div>
              <div class="flex-1 min-w-0">
                <div class="flex items-center gap-2">
                  <NuxtLink
                    :to="`/dashboard/events/${evt.id}`"
                    class="text-base font-semibold text-[#212121] font-asap truncate hover:text-tango-500 transition-colors"
                  >
                    {{ evt.title }}
                  </NuxtLink>
                  <span
                    :class="getStatusColor(getEventStatus(evt))"
                    class="text-xs font-semibold px-2 py-0.5 rounded-full font-montserrat whitespace-nowrap"
                  >
                    {{ getEventStatus(evt) }}
                  </span>
                </div>
                <p class="text-sm text-[#545454] font-montserrat mt-0.5">
                  {{ formatDate(evt.startTime) }} · {{ formatTime(evt.startTime) }}
                </p>
              </div>
              <NuxtLink
                :to="`/dashboard/mon-club/events/${evt.id}/edit`"
                class="size-8 flex items-center justify-center rounded-lg hover:bg-gray-100 transition-colors shrink-0"
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                >
                  <circle
                    cx="12"
                    cy="5"
                    r="1"
                    fill="#545454"
                  />
                  <circle
                    cx="12"
                    cy="12"
                    r="1"
                    fill="#545454"
                  />
                  <circle
                    cx="12"
                    cy="19"
                    r="1"
                    fill="#545454"
                  />
                </svg>
              </NuxtLink>
            </div>

            <!-- Participants progress bar -->
            <div class="flex items-center gap-4">
              <div class="flex-1 flex flex-col gap-1">
                <div class="flex items-center justify-between">
                  <span class="text-xs text-[#545454] font-montserrat">
                    Participants
                  </span>
                  <span class="text-xs text-[#545454] font-montserrat">
                    {{ participantsCounts[evt.id]?.registered || 0 }}{{ evt.maxParticipants ? `/${evt.maxParticipants}` : '' }}
                  </span>
                </div>
                <div class="h-2 bg-[#e3e3e3] rounded-full overflow-hidden border border-[#e2e8f0]">
                  <div
                    class="h-full bg-tango-600 rounded-full transition-all"
                    :style="{ width: evt.maxParticipants ? `${Math.min(100, ((participantsCounts[evt.id]?.registered || 0) / evt.maxParticipants) * 100)}%` : '0%' }"
                  />
                </div>
              </div>
              <NuxtLink
                :to="`/dashboard/mon-club/events/${evt.id}/edit`"
                class="border border-[#d6d6d6] rounded-lg px-3.5 py-1.5 text-sm font-medium text-[#212121] font-montserrat hover:bg-gray-50 transition-colors whitespace-nowrap"
              >
                Gérer
              </NuxtLink>
            </div>
          </div>
        </div>
      </div>

      <!-- Tab: Membres -->
      <div
        v-if="activeTab === 'members'"
        class="flex flex-col items-center py-12 text-center"
      >
        <div class="size-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
          <svg
            width="28"
            height="28"
            viewBox="0 0 24 24"
            fill="none"
          >
            <path
              d="M17 21V19C17 16.79 15.21 15 13 15H5C2.79 15 1 16.79 1 19V21"
              stroke="#999"
              stroke-width="1.5"
              stroke-linecap="round"
            />
            <circle
              cx="9"
              cy="7"
              r="4"
              stroke="#999"
              stroke-width="1.5"
            />
          </svg>
        </div>
        <p class="text-base font-semibold text-[#212121] font-asap mb-1">
          Gestion des membres
        </p>
        <p class="text-sm text-[#545454] font-montserrat">
          Bientôt disponible
        </p>
      </div>

      <!-- Déconnexion -->
      <button
        class="w-full mt-4 py-3 text-sm font-semibold text-red-500 border border-red-200 rounded-xl hover:bg-red-50 transition-colors font-montserrat"
        @click="handleLogout"
      >
        Se déconnecter
      </button>
    </div>
  </div>
</template>

<style scoped>
.font-asap {
  font-family: 'Asap', sans-serif;
}

.font-montserrat {
  font-family: 'Montserrat', sans-serif;
}

.font-roboto {
  font-family: 'Roboto', sans-serif;
}
</style>
