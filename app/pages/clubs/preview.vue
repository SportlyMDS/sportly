<script setup lang="ts">
import {
  DAY_LABELS,
  DAY_ORDER,
  LEVEL_LABELS,
  AUDIENCE_LABELS,
  FACILITY_LABELS,
  formatDaySchedule,
  formatAddress
} from '~/composables/useClub'
import type { ClubDetail } from '~/composables/useClub'

definePageMeta({ layout: 'dashboard' })

const club: ClubDetail = {
  accountId: 'preview',
  clubName: 'Lille Université Club',
  description: 'Club sportif universitaire proposant une grande variété d\'activités pour tous les niveaux. Situé au cœur du campus, nous accueillons étudiants et habitants du quartier dans une ambiance conviviale.',
  rating: '4.3',
  reviewCount: 2,
  isOpen: true,
  websiteUrl: 'https://example.com',
  phone: '+33612345678',
  email: 'contact@luc.fr',
  offerType: 'VISIBILITE',
  logoMediaId: null,
  addresses: [{
    id: '1',
    accountId: 'preview',
    line1: '42 Avenue de l\'Université',
    postalCode: '59000',
    city: 'Lille',
    latitude: 50.6374,
    longitude: 3.0701,
    isPrimary: true,
    countryCode: 'FR',
    createdAt: new Date().toISOString()
  }],
  sports: [
    { sportId: 1, code: 'FOOTBALL', label: 'Football', emoji: '⚽', levelsAccepted: ['DEBUTANT', 'INTERMEDIAIRE'], audiences: ['ADULTES', 'ADOS'] },
    { sportId: 2, code: 'RUGBY', label: 'Rugby', emoji: '🏉', levelsAccepted: ['DEBUTANT', 'INTERMEDIAIRE'], audiences: ['ADULTES'] },
    { sportId: 3, code: 'COURSE', label: 'Course', emoji: '🏃', levelsAccepted: ['DEBUTANT', 'INTERMEDIAIRE', 'AVANCE'], audiences: ['TOUS'] },
    { sportId: 4, code: 'MUSCULATION', label: 'Musculation', emoji: '💪', levelsAccepted: ['INTERMEDIAIRE', 'AVANCE'], audiences: ['ADULTES', 'SENIORS'] }
  ],
  facilities: ['VESTIAIRES', 'TOILETTES', 'HANDICAP_FRIENDLY'],
  openingHours: [
    { id: '1', clubId: 'preview', dayOfWeek: 'LUN', morningOpen: '09:00', morningClose: '12:00', afternoonOpen: '14:00', afternoonClose: '20:00' },
    { id: '2', clubId: 'preview', dayOfWeek: 'MAR', morningOpen: '09:00', morningClose: '12:00', afternoonOpen: '14:00', afternoonClose: '20:00' },
    { id: '3', clubId: 'preview', dayOfWeek: 'MER', morningOpen: '09:00', morningClose: '12:00', afternoonOpen: '14:00', afternoonClose: '20:00' },
    { id: '4', clubId: 'preview', dayOfWeek: 'JEU', morningOpen: '09:00', morningClose: '12:00', afternoonOpen: '14:00', afternoonClose: '20:00' },
    { id: '5', clubId: 'preview', dayOfWeek: 'VEN', morningOpen: '09:00', morningClose: '12:00', afternoonOpen: '14:00', afternoonClose: '18:00' },
    { id: '6', clubId: 'preview', dayOfWeek: 'SAM', morningOpen: '10:00', morningClose: '13:00', afternoonOpen: null, afternoonClose: null }
  ],
  photos: [],
  reviews: {
    count: 2,
    items: [
      { id: '1', clubId: 'preview', userId: 'u1', rating: 5, comment: 'Super club, ambiance top et coachs très disponibles !', createdAt: '2025-01-15T10:00:00Z' },
      { id: '2', clubId: 'preview', userId: 'u2', rating: 4, comment: 'Très bon club, installations propres. Manque juste un peu de créneaux le weekend.', createdAt: '2025-02-03T14:30:00Z' }
    ]
  }
}

const photos = [
  { id: '1', url: 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=800&h=500&fit=crop', mimeType: 'image/jpeg' },
  { id: '2', url: 'https://images.unsplash.com/photo-1587280501635-68a0e82cd5ff?w=800&h=500&fit=crop', mimeType: 'image/jpeg' },
  { id: '3', url: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800&h=500&fit=crop', mimeType: 'image/jpeg' }
]

const primaryAddress = club.addresses[0]

// ─── Tabs ─────────────────────────────────────────────────────────────────────
const activeTab = ref('apropos')

const tabItems = computed(() => [
  { label: 'À propos', value: 'apropos', slot: 'apropos' as const },
  { label: 'Événements', value: 'evenements', slot: 'evenements' as const },
  { label: `Avis (${club.reviews.count})`, value: 'avis', slot: 'avis' as const }
])

// ─── À propos: sports & levels ───────────────────────────────────────────────
const LEVEL_ORDER = ['DEBUTANT', 'INTERMEDIAIRE', 'AVANCE', 'PRO']

const uniqueLevels = computed(() => {
  const set = new Set<string>()
  club.sports.forEach(s => s.levelsAccepted?.forEach(l => set.add(l)))
  return LEVEL_ORDER.filter(l => set.has(l))
})

const otherFacilities = club.facilities.filter(f => f !== 'HANDICAP_FRIENDLY')

// ─── Horaires ─────────────────────────────────────────────────────────────────
const todayKey = DAY_ORDER[(new Date().getDay() + 6) % 7]
const hoursMap = Object.fromEntries(club.openingHours.map(h => [h.dayOfWeek, h]))

// ─── Mini-carte ───────────────────────────────────────────────────────────────
const mapCenter: [number, number] = [50.6374, 3.0701]
const mapPinSvg = `data:image/svg+xml;utf8,${encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="36" height="44" viewBox="0 0 36 44"><path d="M18 0C8.06 0 0 8.06 0 18c0 13.5 18 26 18 26S36 31.5 36 18C36 8.06 27.94 0 18 0z" fill="#ef781e"/><circle cx="18" cy="18" r="7" fill="white"/></svg>')}`

// ─── Date ─────────────────────────────────────────────────────────────────────
function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('fr-FR', { year: 'numeric', month: 'long', day: 'numeric' })
}

async function copyShareUrl(): Promise<void> {
  if (!import.meta.client) return
  const url = window.location.href
  await navigator.clipboard.writeText(url)
}

const isFavorite = ref(false)

const clubInitials = computed(() => {
  const parts = club.clubName.trim().split(/\s+/)
  return parts.map(w => w[0]).join('').toUpperCase().slice(0, 3)
})
</script>

<template>
  <div class="flex flex-col font-roboto pb-20">
    <!-- ── Logo bar ───────────────────────────────────────────────────────── -->
    <div class="bg-white flex items-center justify-center px-4 py-4">
      <img src="/long-logo.png" alt="Sportly" class="h-7 w-auto">
    </div>

    <!-- ── Nav bar ────────────────────────────────────────────────────────── -->
    <div class="bg-white flex items-center justify-between px-3 py-1">
      <UButton
        icon="i-heroicons-chevron-left"
        variant="ghost"
        color="neutral"
        size="md"
        @click="$router.back()"
      />
      <div class="flex items-center gap-1">
        <UButton
          icon="i-heroicons-arrow-up-on-square"
          variant="ghost"
          color="neutral"
          size="md"
          @click="copyShareUrl"
        />
        <UButton
          :icon="isFavorite ? 'i-heroicons-heart-solid' : 'i-heroicons-heart'"
          variant="ghost"
          color="neutral"
          size="md"
          :class="{ 'text-tango-500': isFavorite }"
          @click="isFavorite = !isFavorite"
        />
      </div>
    </div>

    <!-- ── Hero image ─────────────────────────────────────────────────────── -->
    <div class="relative w-full h-56 overflow-hidden">
      <img
        :src="photos[0]?.url"
        :alt="club.clubName"
        class="w-full h-full object-cover"
      >
      <!-- gradient overlay -->
      <div class="absolute inset-0 bg-linear-to-t from-black/70 via-black/20 to-transparent" />
      <!-- open/closed badge -->
      <div class="absolute top-3 left-3">
        <UBadge :color="club.isOpen ? 'success' : 'error'" variant="solid">
          {{ club.isOpen ? 'Ouvert' : 'Fermé' }}
        </UBadge>
      </div>
      <!-- club identity overlay -->
      <div class="absolute bottom-3 left-3 flex items-center gap-3 pr-4">
        <div class="size-12 rounded-full bg-violet-700 flex items-center justify-center border-2 border-white shrink-0">
          <span class="text-white text-xs font-bold">{{ clubInitials }}</span>
        </div>
        <div class="min-w-0">
          <h1 class="text-white text-xl font-bold leading-tight drop-shadow">
            {{ club.clubName }}
          </h1>
          <p class="text-white/80 text-sm drop-shadow truncate">
            {{ formatAddress(primaryAddress!) }}
          </p>
        </div>
      </div>
    </div>

    <!-- ── Photo thumbnails ──────────────────────────────────────────────── -->
    <div
      class="flex gap-2 px-2 py-2 overflow-x-auto"
      style="scrollbar-width: none; -ms-overflow-style: none;"
    >
      <div
        v-for="photo in photos"
        :key="photo.id"
        class="shrink-0 size-24 rounded-lg overflow-hidden"
      >
        <img :src="photo.url" :alt="club.clubName" class="size-full object-cover">
      </div>
    </div>

    <!-- ── CTA ───────────────────────────────────────────────────────────── -->
    <div class="px-4 pt-1 pb-3">
      <UButton
        color="primary"
        variant="solid"
        icon="i-heroicons-chat-bubble-left-ellipsis"
        size="lg"
        class="w-full rounded-full bg-[#e97217] hover:bg-[#c45312] justify-center"
      >
        Contacter le club
      </UButton>
    </div>

    <!-- ── Rating + Adresse ──────────────────────────────────────────────── -->
    <div class="flex items-center gap-6 px-4 pb-4">
      <div class="flex items-center gap-1.5">
        <UIcon name="i-heroicons-star-solid" class="size-5 text-yellow-500" />
        <span class="text-base font-semibold text-[#1c1c1c]">{{ Number(club.rating).toFixed(1) }}</span>
        <span class="text-sm text-[#545454]">({{ club.reviewCount }} avis)</span>
      </div>
      <div class="flex items-center gap-1.5">
        <UIcon name="i-heroicons-map-pin" class="size-5 text-[#545454]" />
        <span class="text-sm text-[#545454]">{{ primaryAddress?.city }}</span>
      </div>
    </div>

    <!-- ── UTabs ────────────────────────────────────────────────────────────── -->
    <UTabs
      v-model="activeTab"
      :items="tabItems"
      variant="link"
      color="primary"
      size="xl"
      :ui="{
        root: 'gap-0',
        list: 'p-0 px-4 gap-6',
        trigger: 'data-[state=active]:font-semibold data-[state=inactive]:font-normal',
        content: 'p-0'
      }"
    >
      <!-- ── À propos ─────────────────────────────────────────────────────── -->
      <template #apropos>
        <div class="flex flex-col">
          <!-- Description -->
          <div class="px-4 py-5 border-b border-[#f0f0f0]">
            <h2 class="text-lg font-semibold text-[#1c1c1c] mb-3">
              Description
            </h2>
            <p class="text-sm text-[#545454] leading-relaxed">
              {{ club.description }}
            </p>
          </div>

          <!-- Sports proposés + Niveaux acceptés -->
          <div class="px-4 py-5 border-b border-[#f0f0f0] flex flex-col gap-5">
            <div>
              <h2 class="text-lg font-semibold text-[#1c1c1c] mb-3">
                Sports proposés
              </h2>
              <div class="flex flex-wrap gap-2">
                <span
                  v-for="sport in club.sports"
                  :key="sport.sportId"
                  class="px-4 py-1.5 bg-[#f0f0f0] text-[#1c1c1c] text-sm rounded-full"
                >
                  {{ sport.label }}
                </span>
              </div>
            </div>

            <div v-if="uniqueLevels.length || club.facilities.includes('HANDICAP_FRIENDLY')">
              <h2 class="text-lg font-semibold text-[#1c1c1c] mb-3">
                Niveaux acceptés
              </h2>
              <div class="flex flex-wrap gap-2">
                <span
                  v-for="level in uniqueLevels"
                  :key="level"
                  class="inline-flex items-center gap-1.5 px-4 py-1.5 bg-tango-500 text-white text-sm font-medium rounded-full"
                >
                  <span>✓</span>{{ LEVEL_LABELS[level] }}
                </span>
                <span
                  v-if="club.facilities.includes('HANDICAP_FRIENDLY')"
                  class="inline-flex items-center gap-1.5 px-4 py-1.5 bg-tango-500 text-white text-sm font-medium rounded-full"
                >
                  <span>✓</span>Handicapé
                </span>
              </div>
            </div>
          </div>

          <!-- Public accueilli -->
          <div
            v-if="club.sports.some(s => s.audiences?.length)"
            class="px-4 py-5 border-b border-[#f0f0f0]"
          >
            <h2 class="text-lg font-semibold text-[#1c1c1c] mb-3">
              Public accueilli
            </h2>
            <div class="flex flex-wrap gap-2">
              <span
                v-for="audience in [...new Set(club.sports.flatMap(s => s.audiences ?? []))]"
                :key="audience"
                class="px-4 py-1.5 bg-[#f0f0f0] text-[#545454] text-sm rounded-full"
              >
                {{ AUDIENCE_LABELS[audience] ?? audience }}
              </span>
            </div>
          </div>

          <!-- Équipements -->
          <div v-if="otherFacilities.length" class="px-4 py-5 border-b border-[#f0f0f0]">
            <h2 class="text-lg font-semibold text-[#1c1c1c] mb-3">
              Équipements
            </h2>
            <div class="flex flex-wrap gap-2">
              <span
                v-for="facility in otherFacilities"
                :key="facility"
                class="px-4 py-1.5 bg-[#f0f0f0] text-[#545454] text-sm rounded-full"
              >
                {{ FACILITY_LABELS[facility] }}
              </span>
            </div>
          </div>

          <!-- Horaires -->
          <div class="px-4 py-5 border-b border-[#f0f0f0]">
            <h2 class="text-lg font-semibold text-[#1c1c1c] mb-3">
              Horaires
            </h2>
            <div class="rounded-xl overflow-hidden border border-[#e8e8e8]">
              <table class="w-full text-sm">
                <tbody>
                  <tr
                    v-for="day in DAY_ORDER"
                    :key="day"
                    :class="['border-b border-[#f0f0f0] last:border-0', day === todayKey ? 'bg-tango-50' : 'bg-white']"
                  >
                    <td class="py-2.5 pl-3 pr-2 font-medium w-28">
                      <span :class="day === todayKey ? 'text-tango-600' : 'text-[#1c1c1c]'">{{ DAY_LABELS[day] }}</span>
                    </td>
                    <td class="py-2.5 pr-3">
                      <template v-if="day in hoursMap">
                        <span :class="day === todayKey ? 'text-tango-600' : 'text-[#545454]'">
                          {{ formatDaySchedule(hoursMap[day]!) ?? 'Fermé' }}
                        </span>
                      </template>
                      <template v-else>
                        <span class="text-[#b0b0b0]">—</span>
                      </template>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <!-- Mini-carte -->
          <div class="px-4 py-5">
            <h2 class="text-lg font-semibold text-[#1c1c1c] mb-3">
              Localisation
            </h2>
            <div class="rounded-xl overflow-hidden h-44 border border-[#e8e8e8]">
              <ClientOnly>
                <LMap
                  :zoom="15"
                  :center="mapCenter"
                  :use-global-leaflet="false"
                  :options="{ zoomControl: false, dragging: false, scrollWheelZoom: false }"
                  class="w-full h-full z-1"
                >
                  <LTileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                  <LMarker :lat-lng="mapCenter">
                    <LIcon :icon-url="mapPinSvg" :icon-size="[36, 44]" :icon-anchor="[18, 44]" />
                  </LMarker>
                </LMap>
                <template #fallback>
                  <div class="w-full h-full bg-[#f7f7f7] flex items-center justify-center">
                    <UIcon name="i-heroicons-map" class="w-10 h-10 text-[#b0b0b0]" />
                  </div>
                </template>
              </ClientOnly>
            </div>
          </div>
        </div>
      </template>

      <!-- ── Événements ───────────────────────────────────────────────────── -->
      <template #evenements>
        <div class="flex flex-col items-center py-16 px-4 gap-3 text-center">
          <span class="text-4xl">🗓️</span>
          <p class="text-base font-semibold text-[#1c1c1c]">
            Aucun événement à venir
          </p>
          <p class="text-sm text-[#545454]">
            Ce club n'a pas encore publié d'événements.
          </p>
        </div>
      </template>

      <!-- ── Avis ─────────────────────────────────────────────────────────── -->
      <template #avis>
        <div class="px-4 py-5">
          <div class="bg-[#f7f7f7] border border-[#d6d6d6] rounded-xl px-4 py-3 flex items-center justify-between mb-5">
            <div class="flex flex-col gap-1">
              <span class="text-[36px] font-bold leading-none text-[#1c1c1c]">{{ Number(club.rating).toFixed(1) }}</span>
              <ClubStarRow :rating="Number(club.rating)" :size="14" />
              <span class="text-xs text-[#545454]">{{ club.reviews.count }} avis</span>
            </div>
            <UButton
              color="primary"
              variant="solid"
              icon="i-heroicons-pencil-square"
              size="xl"
              class="bg-tango-600 hover:bg-[#c45312] rounded-lg text-sm font-medium"
            >
              Donner mon avis
            </UButton>
          </div>

          <div v-if="club.reviews.items.length" class="flex flex-col gap-3">
            <ClubReviewCard
              v-for="review in club.reviews.items"
              :key="review.id"
              name="Membre Sportly"
              :date="formatDate(review.createdAt!)"
              :rating="Number(review.rating)"
              :comment="review.comment ?? undefined"
            />
          </div>

          <div v-else class="text-center py-8 text-sm text-[#b0b0b0]">
            Aucun avis pour le moment
          </div>
        </div>
      </template>
    </UTabs>

    <!-- ── CTA bar ─────────────────────────────────────────────────────────── -->
    <!-- <div class="fixed bottom-16 left-0 right-0 z-40 bg-white border-t border-[#e8e8e8] px-4 py-3 flex gap-2">
      <UButton
        as="a"
        :href="club.websiteUrl!"
        target="_blank"
        color="primary"
        variant="solid"
        icon="i-heroicons-globe-alt"
        class="flex-1"
      >
        Site web
      </UButton>
      <UButton
        as="a"
        :href="`tel:${club.phone}`"
        color="primary"
        variant="outline"
        icon="i-heroicons-phone"
        class="flex-1"
      >
        Appeler
      </UButton>
      <UButton
        as="a"
        :href="`mailto:${club.email}`"
        color="neutral"
        variant="outline"
        icon="i-heroicons-envelope"
        class="flex-1"
      >
        Email
      </UButton>
    </div> -->
  </div>
</template>

<style scoped>
.font-roboto {
  font-family: 'Roboto', sans-serif;
}
div::-webkit-scrollbar {
  display: none;
}
</style>
