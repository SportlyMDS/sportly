<script setup lang="ts">
definePageMeta({
  layout: false,
  middleware: 'auth'
})

const route = useRoute()
const id = route.params.id as string
const toast = useToast()
const router = useRouter()

const isLoading = ref(false)
const isFetching = ref(true)

// Form state
const title = ref('')
const description = ref('')
const eventType = ref<string>('')
const startDate = ref('')
const startTime = ref('')
const endDate = ref('')
const endTime = ref('')
const maxParticipants = ref<number | undefined>(undefined)
const price = ref(0)
const selectedLevels = ref<string[]>([])
const selectedAudiences = ref<string[]>([])

// Available options
const eventTypes = [
  { value: 'STAGE', label: 'Stage', emoji: '🏕️' },
  { value: 'TOURNOI', label: 'Tournoi', emoji: '🏆' },
  { value: 'ENTRAINEMENT', label: 'Entraînement', emoji: '🏋️' },
  { value: 'DECOUVERTE', label: 'Découverte', emoji: '🔍' }
]

const levels = [
  { value: 'DEBUTANT', label: 'Débutant' },
  { value: 'INTERMEDIAIRE', label: 'Intermédiaire' },
  { value: 'AVANCE', label: 'Avancé' },
  { value: 'PRO', label: 'Pro' }
]

const audiences = [
  { value: 'ENFANTS', label: 'Enfants' },
  { value: 'ADOS', label: 'Ados' },
  { value: 'ADULTES', label: 'Adultes' },
  { value: 'SENIORS', label: 'Seniors' },
  { value: 'TOUS', label: 'Tous' }
]

// Fetch existing event data
onMounted(async () => {
  try {
    const data = await $fetch<any>(`/api/events/${id}`)
    title.value = data.title || ''
    description.value = data.description || ''
    eventType.value = data.eventType || ''
    price.value = Number(data.price) || 0
    maxParticipants.value = data.maxParticipants || undefined
    selectedLevels.value = data.levelRequired || []
    selectedAudiences.value = data.audience || []

    if (data.startTime) {
      const start = new Date(data.startTime)
      startDate.value = start.toISOString().split('T')[0]
      startTime.value = start.toTimeString().slice(0, 5)
    }
    if (data.endTime) {
      const end = new Date(data.endTime)
      endDate.value = end.toISOString().split('T')[0]
      endTime.value = end.toTimeString().slice(0, 5)
    }
  } catch (err: unknown) {
    const errorMessage = err && typeof err === 'object' && 'data' in err
      ? (err.data as { message?: string })?.message || 'Événement introuvable'
      : 'Événement introuvable'
    toast.add({
      title: 'Erreur',
      description: errorMessage,
      color: 'error'
    })
    router.back()
  } finally {
    isFetching.value = false
  }
})

const formValid = computed(() => {
  return title.value.trim().length >= 3
    && eventType.value !== ''
    && startDate.value && startTime.value
    && endDate.value && endTime.value
    && selectedLevels.value.length > 0
    && selectedAudiences.value.length > 0
})

function toggleLevel(level: string) {
  const idx = selectedLevels.value.indexOf(level)
  if (idx === -1) selectedLevels.value.push(level)
  else selectedLevels.value.splice(idx, 1)
}

function toggleAudience(audience: string) {
  const idx = selectedAudiences.value.indexOf(audience)
  if (idx === -1) selectedAudiences.value.push(audience)
  else selectedAudiences.value.splice(idx, 1)
}

async function handleSubmit() {
  if (!formValid.value) return

  isLoading.value = true

  try {
    const startDateTime = new Date(`${startDate.value}T${startTime.value}:00`).toISOString()
    const endDateTime = new Date(`${endDate.value}T${endTime.value}:00`).toISOString()

    await $fetch(`/api/events/${id}`, {
      method: 'PUT',
      body: {
        eventType: eventType.value,
        title: title.value.trim(),
        description: description.value.trim() || undefined,
        startTime: startDateTime,
        endTime: endDateTime,
        levelRequired: selectedLevels.value,
        audience: selectedAudiences.value,
        price: price.value,
        maxParticipants: maxParticipants.value || undefined
      }
    })

    toast.add({
      title: 'Événement modifié',
      description: 'Les modifications ont été enregistrées',
      color: 'success'
    })
    await navigateTo(`/events/${id}`)
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
    isLoading.value = false
  }
}
</script>

<template>
  <div class="w-[393px] min-h-screen bg-white max-w-full overflow-hidden flex flex-col mx-auto">
    <!-- Header -->
    <header class="shrink-0">
      <div class="px-4 py-4">
        <button class="flex items-center gap-2 text-gray-500" @click="router.back()">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M15 18L9 12L15 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
          </svg>
          <span class="text-base font-roboto">Retour</span>
        </button>
      </div>
    </header>

    <!-- Loading -->
    <div v-if="isFetching" class="flex-1 flex flex-col gap-4 px-4">
      <USkeleton class="h-8 w-3/4" />
      <USkeleton class="h-12 w-full" />
      <USkeleton class="h-12 w-full" />
      <USkeleton class="h-12 w-full" />
      <USkeleton class="h-12 w-full" />
    </div>

    <!-- Form -->
    <main v-else class="flex-1 flex flex-col min-h-0 px-4 pb-8 gap-6 overflow-y-auto">
      <div class="flex flex-col gap-2">
        <h1 class="text-[28px] font-semibold text-[#1c1c1c] leading-tight tracking-tight font-asap">
          Modifier l'événement
        </h1>
        <p class="text-base text-[#545454] leading-6 font-roboto">
          Mettez à jour les informations
        </p>
      </div>

      <!-- Event type -->
      <div class="flex flex-col gap-3">
        <label class="text-sm font-medium text-[#1c1c1c] font-roboto">Type d'événement</label>
        <div class="grid grid-cols-2 gap-3">
          <button
            v-for="type in eventTypes"
            :key="type.value"
            type="button"
            class="bg-[#f7f7f7] border-2 border-solid rounded-xl p-4 flex items-center justify-center gap-2 transition-all duration-200 h-[68px]"
            :class="eventType === type.value ? 'border-tango-500 bg-white' : 'border-[#d6d6d6] hover:border-gray-300'"
            @click="eventType = type.value"
          >
            <span class="text-[28px] leading-none shrink-0">{{ type.emoji }}</span>
            <span class="text-sm leading-5 text-[#1c1c1c] font-roboto">{{ type.label }}</span>
          </button>
        </div>
      </div>

      <!-- Title -->
      <div class="flex flex-col gap-2">
        <label class="text-sm font-medium text-[#1c1c1c] font-roboto">Titre</label>
        <input
          v-model="title"
          type="text"
          maxlength="160"
          class="w-full bg-[#f7f7f7] border-2 border-[#f7f7f7] rounded-lg h-12 px-4 text-sm text-[#1c1c1c] font-roboto focus:outline-none focus:border-tango-500"
        >
      </div>

      <!-- Description -->
      <div class="flex flex-col gap-2">
        <label class="text-sm font-medium text-[#1c1c1c] font-roboto">Description</label>
        <textarea
          v-model="description"
          rows="4"
          class="w-full bg-[#f7f7f7] border-2 border-[#f7f7f7] rounded-lg px-4 py-3 text-sm text-[#1c1c1c] font-roboto focus:outline-none focus:border-tango-500 resize-none"
        />
      </div>

      <!-- Start date/time -->
      <div class="flex flex-col gap-3">
        <label class="text-sm font-medium text-[#1c1c1c] font-roboto">Date et heure de début</label>
        <div class="flex gap-3">
          <input
            v-model="startDate"
            type="date"
            class="flex-1 bg-[#f7f7f7] border-2 border-[#f7f7f7] rounded-lg h-12 px-4 text-sm text-[#1c1c1c] font-roboto focus:outline-none focus:border-tango-500"
          >
          <input
            v-model="startTime"
            type="time"
            class="w-28 bg-[#f7f7f7] border-2 border-[#f7f7f7] rounded-lg h-12 px-4 text-sm text-[#1c1c1c] font-roboto focus:outline-none focus:border-tango-500"
          >
        </div>
      </div>

      <!-- End date/time -->
      <div class="flex flex-col gap-3">
        <label class="text-sm font-medium text-[#1c1c1c] font-roboto">Date et heure de fin</label>
        <div class="flex gap-3">
          <input
            v-model="endDate"
            type="date"
            class="flex-1 bg-[#f7f7f7] border-2 border-[#f7f7f7] rounded-lg h-12 px-4 text-sm text-[#1c1c1c] font-roboto focus:outline-none focus:border-tango-500"
          >
          <input
            v-model="endTime"
            type="time"
            class="w-28 bg-[#f7f7f7] border-2 border-[#f7f7f7] rounded-lg h-12 px-4 text-sm text-[#1c1c1c] font-roboto focus:outline-none focus:border-tango-500"
          >
        </div>
      </div>

      <!-- Price -->
      <div class="flex flex-col gap-2">
        <label class="text-sm font-medium text-[#1c1c1c] font-roboto">Prix (€)</label>
        <input
          v-model.number="price"
          type="number"
          min="0"
          step="0.01"
          class="w-full bg-[#f7f7f7] border-2 border-[#f7f7f7] rounded-lg h-12 px-4 text-sm text-[#1c1c1c] font-roboto focus:outline-none focus:border-tango-500"
        >
      </div>

      <!-- Max participants -->
      <div class="flex flex-col gap-2">
        <label class="text-sm font-medium text-[#1c1c1c] font-roboto">Capacité maximale</label>
        <input
          v-model.number="maxParticipants"
          type="number"
          min="1"
          placeholder="Illimité si vide"
          class="w-full bg-[#f7f7f7] border-2 border-[#f7f7f7] rounded-lg h-12 px-4 text-sm text-[#1c1c1c] placeholder-[#999] font-roboto focus:outline-none focus:border-tango-500"
        >
      </div>

      <!-- Levels -->
      <div class="flex flex-col gap-3">
        <label class="text-sm font-medium text-[#1c1c1c] font-roboto">Niveau(x) requis</label>
        <div class="flex flex-wrap gap-2">
          <button
            v-for="level in levels"
            :key="level.value"
            type="button"
            class="px-4 py-2 rounded-full text-sm font-roboto transition-colors"
            :class="selectedLevels.includes(level.value)
              ? 'bg-tango-500 text-white'
              : 'bg-[#f7f7f7] border border-[#d6d6d6] text-[#545454]'"
            @click="toggleLevel(level.value)"
          >
            {{ level.label }}
          </button>
        </div>
      </div>

      <!-- Audience -->
      <div class="flex flex-col gap-3">
        <label class="text-sm font-medium text-[#1c1c1c] font-roboto">Public ciblé</label>
        <div class="flex flex-wrap gap-2">
          <button
            v-for="aud in audiences"
            :key="aud.value"
            type="button"
            class="px-4 py-2 rounded-full text-sm font-roboto transition-colors"
            :class="selectedAudiences.includes(aud.value)
              ? 'bg-tango-500 text-white'
              : 'bg-[#f7f7f7] border border-[#d6d6d6] text-[#545454]'"
            @click="toggleAudience(aud.value)"
          >
            {{ aud.label }}
          </button>
        </div>
      </div>

      <!-- Submit button -->
      <UButton
        block
        :disabled="!formValid"
        :loading="isLoading"
        class="bg-tango-500! hover:bg-tango-600! text-white! font-semibold! font-montserrat! text-base! rounded-[50px]! py-3! disabled:opacity-50! disabled:cursor-not-allowed!"
        @click="handleSubmit"
      >
        Enregistrer les modifications
      </UButton>
    </main>
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
