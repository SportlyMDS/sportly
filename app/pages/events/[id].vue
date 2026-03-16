<script setup lang="ts">
definePageMeta({
  layout: 'dashboard'
})

const route = useRoute()
const router = useRouter()
const id = route.params.id as string
const toast = useToast()

const { data: event, status, error, refresh } = useFetch(`/api/events/${id}`, {
  key: `event-${id}`
})

const isLoading = computed(() => status.value === 'pending')
const isError = computed(() => status.value === 'error' && (error.value as any)?.statusCode !== 404)
const notFound = computed(() => status.value === 'error' && (error.value as any)?.statusCode === 404)

const isRegistering = ref(false)

async function copyToClipboard(text: string) {
  if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(text)
    return
  }

  if (typeof document === 'undefined') {
    throw new TypeError('Clipboard unavailable')
  }

  const textarea = document.createElement('textarea')
  textarea.value = text
  textarea.setAttribute('readonly', '')
  textarea.style.position = 'fixed'
  textarea.style.top = '0'
  textarea.style.left = '0'
  textarea.style.opacity = '0'
  document.body.appendChild(textarea)
  textarea.focus()
  textarea.select()
  const ok = document.execCommand('copy')
  document.body.removeChild(textarea)

  if (!ok) {
    throw new Error('Copy failed')
  }
}

async function handleShare() {
  try {
    if (typeof window === 'undefined') return
    await copyToClipboard(window.location.href)
    toast.add({
      title: 'Lien copié',
      description: 'Le lien de l\'événement a été copié dans le presse-papiers.',
      color: 'success'
    })
  } catch {
    toast.add({
      title: 'Erreur',
      description: 'Impossible de copier le lien.',
      color: 'error'
    })
  }
}

useHead({
  title: computed(() => event.value ? `${(event.value as any).title} - Sportly` : 'Événement - Sportly')
})

const EVENT_TYPE_LABELS: Record<string, string> = {
  STAGE: 'Stage',
  TOURNOI: 'Tournoi',
  ENTRAINEMENT: 'Entraînement',
  DECOUVERTE: 'Découverte'
}

function formatDate(dateStr: string | null | undefined): string {
  if (!dateStr) return ''
  const d = new Date(dateStr)
  return d.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' })
}

function formatTime(dateStr: string | null | undefined): string {
  if (!dateStr) return ''
  const d = new Date(dateStr)
  return d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }).replace(':', 'h')
}

function formatPrice(priceStr: string | null | undefined): string {
  if (!priceStr || Number(priceStr) === 0) return 'Gratuit'
  return `${Number(priceStr).toFixed(0)}€`
}

const remainingPlaces = computed(() => {
  const e = event.value as any
  if (!e?.participants?.max) return null
  return Math.max(0, e.participants.max - e.participants.count)
})

async function handleRegister() {
  isRegistering.value = true
  try {
    await $fetch(`/api/events/${id}/register`, {
      method: 'POST'
    })
    toast.add({
      title: 'Inscription confirmée !',
      description: 'Vous êtes inscrit à cet événement',
      color: 'success'
    })
    await refresh()
  } catch (err: unknown) {
    const errorMessage = err && typeof err === 'object' && 'data' in err
      ? (err.data as { message?: string })?.message || 'Une erreur est survenue'
      : 'Une erreur est survenue'
    toast.add({
      title: 'Erreur',
      description: errorMessage,
      color: 'error'
    })
  } finally {
    isRegistering.value = false
  }
}
</script>

<template>
  <div class="flex flex-col pb-24 bg-white min-h-screen">
    <!-- Loading skeleton -->
    <template v-if="isLoading">
      <div class="px-4 pt-4 flex flex-col gap-4">
        <USkeleton class="h-6 w-24" />
        <USkeleton class="h-8 w-3/4" />
        <USkeleton class="h-6 w-1/2" />
        <USkeleton class="h-20 w-full rounded-xl" />
        <USkeleton class="h-32 w-full rounded-xl" />
      </div>
    </template>

    <!-- Error state -->
    <template v-else-if="isError">
      <div class="flex flex-col items-center py-24 gap-4 text-center px-4">
        <span class="text-5xl">😞</span>
        <p class="text-xl font-semibold text-[#1c1c1c] font-asap">
          Une erreur est survenue
        </p>
        <p class="text-sm text-[#545454] font-roboto">
          Impossible de charger cet événement.
        </p>
        <UButton variant="outline" color="neutral" @click="() => refresh()">
          Réessayer
        </UButton>
      </div>
    </template>

    <!-- 404 state -->
    <template v-else-if="notFound">
      <div class="flex flex-col items-center py-24 gap-4 text-center px-4">
        <span class="text-5xl">🔍</span>
        <p class="text-xl font-semibold text-[#1c1c1c] font-asap">
          Événement introuvable
        </p>
        <NuxtLink to="/events" class="text-tango-500 text-sm underline font-roboto">Retour aux événements</NuxtLink>
      </div>
    </template>

    <!-- Event content -->
    <template v-else-if="event">
      <!-- Logo -->
      <div class="flex justify-center px-4 py-4">
        <img src="/long-logo.png" alt="Sportly" class="h-7">
      </div>

      <!-- Nav bar: back + actions -->
      <div class="flex items-center justify-between px-4 h-16">
        <UButton
          color="neutral"
          variant="ghost"
          size="md"
          square
          class="size-10 rounded-lg"
          aria-label="Retour"
          @click="router.back()"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M15 18L9 12L15 6" stroke="#1c1c1c" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
          </svg>
        </UButton>
        <div class="flex items-center gap-2">
          <UButton
            color="neutral"
            variant="ghost"
            size="sm"
            square
            class="size-9"
            aria-label="Partager"
            @click="handleShare"
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path d="M3.33 8.33V13.33C3.33 14.25 4.08 15 5 15H15C15.92 15 16.67 14.25 16.67 13.33V8.33M10 3.33V11.67M10 3.33L13.33 6.67M10 3.33L6.67 6.67" stroke="#1c1c1c" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
            </svg>
          </UButton>
          <UButton
            color="neutral"
            variant="ghost"
            size="sm"
            square
            class="size-9"
            aria-label="Ajouter aux favoris"
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path d="M10 17.5L2.5 10C1.12 8.62 1.12 6.38 2.5 5C3.88 3.62 6.12 3.62 7.5 5L10 7.5L12.5 5C13.88 3.62 16.12 3.62 17.5 5C18.88 6.38 18.88 8.62 17.5 10L10 17.5Z" stroke="#1c1c1c" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
            </svg>
          </UButton>
        </div>
      </div>

      <!-- Content -->
      <div class="px-4 flex flex-col gap-4">
        <!-- Title -->
        <h1 class="text-[28px] font-semibold text-[#1c1c1c] leading-tight tracking-tight font-asap uppercase">
          {{ (event as any).title }}
        </h1>

        <!-- Badges: event type + sports -->
        <div class="flex flex-wrap gap-2">
          <span class="px-3 py-1 border border-[#d6d6d6] rounded-full text-xs font-semibold text-[#1c1c1c] font-roboto">
            {{ EVENT_TYPE_LABELS[(event as any).eventType] || (event as any).eventType }}
          </span>
          <span
            v-for="sport in (event as any).sports"
            :key="sport.sportId"
            class="px-3 py-1 bg-tango-500 rounded-full text-xs font-semibold text-white font-roboto"
          >
            {{ sport.label }}
          </span>
        </div>

        <!-- Club organizer -->
        <div v-if="(event as any).organizer" class="flex items-center gap-3 pb-4 border-b border-[#e8e8e8]">
          <div class="size-8 rounded-full bg-[#f0f0f0] flex items-center justify-center overflow-hidden">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path d="M20 21V19C20 16.79 18.21 15 16 15H8C5.79 15 4 16.79 4 19V21M12 11C14.21 11 16 9.21 16 7C16 4.79 14.21 3 12 3C9.79 3 8 4.79 8 7C8 9.21 9.79 11 12 11Z" stroke="#545454" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
            </svg>
          </div>
          <span class="text-sm font-medium text-[#1c1c1c] font-roboto">{{ (event as any).organizer.clubName }}</span>
        </div>

        <!-- Price + Reserve button -->
        <div class="flex items-center justify-between py-4 border-b border-[#e8e8e8]">
          <div class="flex flex-col">
            <span class="text-xs text-[#545454] font-roboto">Prix par personne</span>
            <span class="text-[32px] font-bold text-[#1c1c1c] leading-tight font-asap">{{ formatPrice((event as any).price) }}</span>
          </div>
          <button
            class="bg-tango-500 hover:bg-tango-600 text-white font-semibold text-sm px-8 py-3 rounded-full font-montserrat transition-colors disabled:opacity-50"
            :disabled="(event as any).participants?.isFull || isRegistering"
            @click="handleRegister"
          >
            {{ isRegistering ? '...' : (event as any).participants?.isFull ? 'Complet' : 'Réserver' }}
          </button>
        </div>

        <!-- Info cards: Quand + Participants -->
        <div class="grid grid-cols-2 gap-3 pt-2">
          <!-- Quand -->
          <div class="border border-[#e8e8e8] rounded-xl p-4 flex flex-col gap-2">
            <div class="size-8 rounded-full bg-tango-50 flex items-center justify-center">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="9" stroke="#e97217" stroke-width="1.5" />
                <path d="M12 7V12L15 15" stroke="#e97217" stroke-width="1.5" stroke-linecap="round" />
              </svg>
            </div>
            <span class="text-xs text-[#545454] font-roboto">Quand</span>
            <span class="text-sm font-semibold text-[#1c1c1c] font-roboto">{{ formatDate((event as any).startTime) }}</span>
            <span class="text-xs text-[#545454] font-roboto">{{ formatTime((event as any).startTime) }} à {{ formatTime((event as any).endTime) }}</span>
          </div>

          <!-- Participants -->
          <div class="border border-[#e8e8e8] rounded-xl p-4 flex flex-col gap-2">
            <div class="size-8 rounded-full bg-tango-50 flex items-center justify-center">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path d="M17 21V19C17 16.79 15.21 15 13 15H5C2.79 15 1 16.79 1 19V21M23 21V19C23 17.17 21.77 15.63 20.12 15.13M16 3.13C17.77 3.63 19 5.17 19 7C19 8.83 17.77 10.37 16 10.87M9 11C11.21 11 13 9.21 13 7C13 4.79 11.21 3 9 3C6.79 3 5 4.79 5 7C5 9.21 6.79 11 9 11Z" stroke="#e97217" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
              </svg>
            </div>
            <span class="text-xs text-[#545454] font-roboto">Participants</span>
            <span class="text-sm font-semibold text-[#1c1c1c] font-roboto">
              {{ (event as any).participants?.count ?? 0 }}{{ (event as any).participants?.max ? '/' + (event as any).participants.max : '' }}
            </span>
            <span v-if="remainingPlaces !== null" class="text-xs text-[#545454] font-roboto">
              {{ remainingPlaces }} place{{ remainingPlaces !== 1 ? 's' : '' }} restante{{ remainingPlaces !== 1 ? 's' : '' }}
            </span>
          </div>
        </div>

        <!-- Lieu -->
        <div v-if="(event as any).address" class="border border-[#e8e8e8] rounded-xl p-4 flex flex-col gap-2">
          <div class="size-8 rounded-full bg-tango-50 flex items-center justify-center">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path d="M12 13C13.66 13 15 11.66 15 10C15 8.34 13.66 7 12 7C10.34 7 9 8.34 9 10C9 11.66 10.34 13 12 13Z" stroke="#e97217" stroke-width="1.5" />
              <path d="M12 22C12 22 20 16 20 10C20 5.58 16.42 2 12 2C7.58 2 4 5.58 4 10C4 16 12 22 12 22Z" stroke="#e97217" stroke-width="1.5" />
            </svg>
          </div>
          <span class="text-xs text-[#545454] font-roboto">Lieu</span>
          <span class="text-sm font-semibold text-[#1c1c1c] font-roboto">
            {{ (event as any).organizer?.clubName || 'Lieu de l\'événement' }}
          </span>
          <span class="text-xs text-[#545454] font-roboto">
            {{ (event as any).address.line1 }}, {{ (event as any).address.postalCode }} {{ (event as any).address.city }}
          </span>
          <a
            v-if="(event as any).address.latitude && (event as any).address.longitude"
            :href="`https://www.google.com/maps?q=${(event as any).address.latitude},${(event as any).address.longitude}`"
            target="_blank"
            class="text-xs text-tango-500 font-medium font-roboto"
          >
            Voir l'itinéraire
          </a>
        </div>

        <!-- Description -->
        <div v-if="(event as any).description" class="pt-2">
          <h2 class="text-lg font-semibold text-[#1c1c1c] mb-2 font-asap">
            À propos
          </h2>
          <p class="text-sm text-[#545454] leading-relaxed font-roboto">
            {{ (event as any).description }}
          </p>
        </div>
      </div>
    </template>
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
