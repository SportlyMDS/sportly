<script setup lang="ts">
definePageMeta({
  layout: false
})

const toast = useToast()
const router = useRouter()

const isLoading = ref(false)
const currentStep = ref(1)
const totalSteps = 5
const isSuccess = ref(false)
const createdEventId = ref('')

// Step 1: Event type
const eventType = ref<string>('')

// Step 2: Sports
const selectedSports = ref<number[]>([])
const sportSearch = ref('')
const { data: sportsData } = await useFetch<{ success: boolean, data: { id: number, code: string, label: string, emoji: string | null }[] }>('/api/sports')
const sports = computed(() => sportsData.value?.data || [])

// Step 3: Details
const title = ref('')
const description = ref('')
const price = ref<number | undefined>(undefined)
const maxParticipants = ref<number | undefined>(undefined)
const selectedLevels = ref<string[]>([])

// Step 4: Location & time
const lieu = ref('')
const eventDate = ref('')
const startTime = ref('')
const endTime = ref('')
const accessibility = ref<string[]>([])

// Options
const eventTypes = [
  { value: 'STAGE', label: 'Stage', description: 'Stage intensif sur plusieurs jours' },
  { value: 'ENTRAINEMENT', label: 'Entrainement', description: 'Séance classique ou spécifique' },
  { value: 'TOURNOI', label: 'Tournoi', description: 'Compétition amicale ou officielle' },
  { value: 'DECOUVERTE', label: 'Découverte', description: 'Initiation pour débutants' }
]

const levels = [
  { value: 'DEBUTANT', label: 'Débutant' },
  { value: 'INTERMEDIAIRE', label: 'Intermédiaire' },
  { value: 'AVANCE', label: 'Avancé' },
  { value: 'PRO', label: 'Pro' },
  { value: 'TOUS', label: 'Tous niveaux' }
]

const accessibilityOptions = [
  { value: 'HANDICAP_MATERIEL', label: 'Handicap avec matériel' },
  { value: 'HANDICAP_SANS', label: 'Handicap sans matériel' },
  { value: 'MIXTE', label: 'Mixte (H/F)' }
]

const filteredSports = computed(() => {
  if (!sportSearch.value.trim()) return sports.value
  const q = sportSearch.value.toLowerCase()
  return sports.value.filter(s => s.label.toLowerCase().includes(q))
})

// Validation per step
const step1Valid = computed(() => eventType.value !== '')
const step2Valid = computed(() => selectedSports.value.length > 0)
const step3Valid = computed(() => title.value.trim().length >= 3 && selectedLevels.value.length > 0)
const step4Valid = computed(() => eventDate.value && startTime.value && endTime.value)

// Computed helpers for recap
const eventTypeLabel = computed(() => eventTypes.find(t => t.value === eventType.value)?.label || '')
const selectedSportLabels = computed(() => selectedSports.value.map(id => sports.value.find(s => s.id === id)?.label || id))
const selectedLevelLabels = computed(() => selectedLevels.value.map(v => levels.find(l => l.value === v)?.label || v))
const formattedDate = computed(() => {
  if (!eventDate.value) return ''
  const d = new Date(eventDate.value)
  return d.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' })
})

function toggleSport(sportId: number) {
  const idx = selectedSports.value.indexOf(sportId)
  if (idx === -1) selectedSports.value.push(sportId)
  else selectedSports.value.splice(idx, 1)
}

function toggleLevel(level: string) {
  const idx = selectedLevels.value.indexOf(level)
  if (idx === -1) selectedLevels.value.push(level)
  else selectedLevels.value.splice(idx, 1)
}

function toggleAccessibility(val: string) {
  const idx = accessibility.value.indexOf(val)
  if (idx === -1) accessibility.value.push(val)
  else accessibility.value.splice(idx, 1)
}

function nextStep() {
  if (currentStep.value < totalSteps) currentStep.value++
}

function prevStep() {
  if (currentStep.value > 1) currentStep.value--
  else router.back()
}

// Progress bar width
const progressWidth = computed(() => `${(currentStep.value / totalSteps) * 100}%`)

async function handleSubmit() {
  if (!step1Valid.value || !step2Valid.value || !step3Valid.value || !step4Valid.value) return

  isLoading.value = true

  try {
    const startDateTime = new Date(`${eventDate.value}T${startTime.value}:00`).toISOString()
    const endDateTime = new Date(`${eventDate.value}T${endTime.value}:00`).toISOString()

    const response = await $fetch<{ success: boolean, data: { id: string } }>('/api/events', {
      method: 'POST',
      body: {
        eventType: eventType.value,
        title: title.value.trim(),
        description: description.value.trim() || undefined,
        startTime: startDateTime,
        endTime: endDateTime,
        levelRequired: selectedLevels.value,
        price: price.value || 0,
        maxParticipants: maxParticipants.value || undefined,
        sportIds: selectedSports.value,
        accessibility: accessibility.value
      }
    })

    if (response.success) {
      createdEventId.value = response.data.id
      isSuccess.value = true
    }
  } catch (error: unknown) {
    console.error('Create event error:', error)
    const errorMessage = error && typeof error === 'object' && 'data' in error
      ? (error.data as { message?: string })?.message || 'Une erreur est survenue'
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
    <!-- ========== SUCCESS SCREEN (Félicitation) ========== -->
    <template v-if="isSuccess">
      <!-- Header: Logo -->
      <div class="bg-white flex items-center justify-center p-4">
        <img src="/long-logo.png" alt="Sportly" class="w-[120px] h-auto object-cover">
      </div>

      <main class="flex-1 flex flex-col items-center justify-center px-4">
        <!-- Confetti icon -->
        <div class="w-[120px] h-[120px] rounded-full bg-[#ef781e] flex items-center justify-center mb-6">
          <svg width="56" height="56" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M5.8 11.3L2 22L12.7 18.2" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
            <path d="M4 3H4.01M22 8H22.01M16 2H16.01M11 7H11.01M20 14H20.01M7 4L9.5 6.5M17 3L20 6M21 11L22 12" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
          </svg>
        </div>

        <!-- Title -->
        <h1 class="text-[36px] font-bold text-[#212121] font-asap mb-4">
          Félicitation
        </h1>

        <!-- Description -->
        <p class="text-base text-[#545454] font-montserrat text-center leading-6">
          Votre événement <span class="font-bold text-[#212121]">"{{ title.toUpperCase() }}"</span> est maintenant en ligne. Préparez-vous à recevoir vos premiers membres !
        </p>
      </main>

      <!-- Action buttons -->
      <div class="px-4 pb-4 flex flex-col gap-3">
        <NuxtLink
          :to="`/events/${createdEventId}`"
          class="w-full h-10 rounded-full bg-[#ef781e] hover:bg-[#e05f16] text-white font-semibold text-base font-montserrat flex items-center justify-center gap-2 transition-colors"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M1 12C1 12 5 4 12 4C19 4 23 12 23 12C23 12 19 20 12 20C5 20 1 12 1 12Z" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
            <circle cx="12" cy="12" r="3" stroke="white" stroke-width="2" />
          </svg>
          Voir mon événement
        </NuxtLink>
        <NuxtLink
          to="/dashboard"
          class="w-full h-10 rounded-full bg-[#f1f1f1] hover:bg-[#e5e5e5] text-[#212121] font-semibold text-base font-montserrat flex items-center justify-center gap-2 transition-colors"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M3 9L12 2L21 9V20C21 20.5304 20.7893 21.0391 20.4142 21.4142C20.0391 21.7893 19.5304 22 19 22H5C4.46957 22 3.96086 21.7893 3.58579 21.4142C3.21071 21.0391 3 20.5304 3 20V9Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
            <path d="M9 22V12H15V22" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
          </svg>
          Retour à l'accueil
        </NuxtLink>
      </div>
    </template>

    <!-- ========== FORM STEPS ========== -->
    <template v-else>
      <!-- Header: Logo -->
      <div class="bg-white flex items-center justify-center p-4">
        <img src="/long-logo.png" alt="Sportly" class="w-[120px] h-auto object-cover">
      </div>

      <!-- Sub-header: Back + Step indicator -->
      <div class="bg-white border-b border-[#d6d6d6] px-4 pt-4 pb-4">
        <!-- Back button row -->
        <div class="flex items-center gap-4 mb-4">
          <template v-if="currentStep <= 2">
            <button class="flex items-center gap-2 cursor-pointer" @click="prevStep">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M15 18L9 12L15 6" stroke="#212121" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
              </svg>
              <span class="text-base text-[#212121] font-montserrat">Retour</span>
            </button>
          </template>
          <template v-else>
            <button class="rounded-lg p-2" @click="prevStep">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M15 18L9 12L15 6" stroke="#212121" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
              </svg>
            </button>
            <p class="text-[20px] font-bold text-[#212121] text-center flex-1 font-asap">
              Créer un événement
            </p>
            <div class="w-10" />
          </template>
        </div>

        <!-- Step counter + progress -->
        <div class="flex flex-col gap-2">
          <p class="text-xs font-medium text-[#545454] font-montserrat">
            Étape {{ currentStep }} sur {{ totalSteps }}
          </p>
          <div class="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
            <div
              class="h-full bg-[#ef781e] rounded-full transition-all duration-300"
              :style="{ width: progressWidth }"
            />
          </div>
        </div>
      </div>

      <!-- Main content -->
      <main class="flex-1 flex flex-col min-h-0 overflow-y-auto">
        <Transition name="slide" mode="out-in">
          <!-- Step 1: Event type -->
          <div v-if="currentStep === 1" key="step1" class="flex-1 flex flex-col p-4">
            <div class="flex-1 flex flex-col gap-4">
              <div class="flex flex-col items-center text-center gap-2">
                <h1 class="text-2xl font-semibold text-[#212121] font-asap leading-9">
                  Quel type d'événement ?
                </h1>
                <p class="text-base text-[#545454] font-montserrat">
                  Choisissez la catégorie qui correspond le mieux.
                </p>
              </div>

              <div class="flex flex-col gap-3 mt-2">
                <button
                  v-for="type in eventTypes"
                  :key="type.value"
                  type="button"
                  class="w-full border rounded-2xl p-5 flex flex-col gap-1 text-left transition-all duration-200"
                  :class="eventType === type.value
                    ? 'border-[#ef781e] bg-[#fef8f4]'
                    : 'border-[#d6d6d6] bg-white hover:border-gray-300'"
                  @click="eventType = type.value"
                >
                  <span class="text-base font-medium text-[#212121] font-montserrat">{{ type.label }}</span>
                  <span class="text-sm text-[#545454] font-montserrat">{{ type.description }}</span>
                </button>
              </div>
            </div>

            <div class="pt-4">
              <button
                :disabled="!step1Valid"
                class="w-full h-10 rounded-full text-white font-semibold text-base font-montserrat transition-colors"
                :class="step1Valid ? 'bg-[#ef781e] hover:bg-[#e05f16]' : 'bg-[#ef781e]/50 cursor-not-allowed'"
                @click="nextStep"
              >
                Continuer
              </button>
            </div>
          </div>

          <!-- Step 2: Sport selection -->
          <div v-else-if="currentStep === 2" key="step2" class="flex-1 flex flex-col p-4">
            <div class="flex-1 flex flex-col gap-4">
              <div class="flex flex-col items-center text-center gap-2">
                <h1 class="text-2xl font-semibold text-[#212121] font-asap leading-9">
                  Le sport concerné
                </h1>
                <p class="text-base text-[#545454] font-montserrat">
                  Sélectionnez un ou plusieurs sports.
                </p>
              </div>

              <div class="relative flex items-center">
                <svg
                  class="absolute left-3 text-[#545454]"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path d="M21 21L16.65 16.65M19 11C19 15.4183 15.4183 19 11 19C6.58172 19 3 15.4183 3 11C3 6.58172 6.58172 3 11 3C15.4183 3 19 6.58172 19 11Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                </svg>
                <input
                  v-model="sportSearch"
                  type="text"
                  placeholder="Rechercher un sport..."
                  class="w-full bg-white border border-[#d6d6d6] rounded-full h-12 pl-10 pr-12 text-base text-[#212121] placeholder-[#999] font-montserrat focus:outline-none focus:border-[#ef781e]"
                >
                <svg
                  class="absolute right-3 text-[#545454]"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path d="M4 21V14M4 10V3M12 21V12M12 8V3M20 21V16M20 12V3M1 14H7M9 8H15M17 16H23" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                </svg>
              </div>

              <div class="grid grid-cols-2 gap-3">
                <button
                  v-for="sport in filteredSports"
                  :key="sport.id"
                  type="button"
                  class="h-[52px] rounded-full border text-base font-montserrat transition-all duration-200"
                  :class="selectedSports.includes(sport.id)
                    ? 'border-[#ef781e] bg-[#fef8f4] text-[#212121]'
                    : 'border-[#d6d6d6] bg-white text-[#212121] hover:border-gray-300'"
                  @click="toggleSport(sport.id)"
                >
                  {{ sport.label }}
                </button>
              </div>
            </div>

            <div class="pt-4">
              <button
                :disabled="!step2Valid"
                class="w-full h-10 rounded-full text-white font-semibold text-base font-montserrat transition-colors"
                :class="step2Valid ? 'bg-[#ef781e] hover:bg-[#e05f16]' : 'bg-[#ef781e]/50 cursor-not-allowed'"
                @click="nextStep"
              >
                Continuer
              </button>
            </div>
          </div>

          <!-- Step 3: Details -->
          <div v-else-if="currentStep === 3" key="step3" class="flex-1 flex flex-col p-4">
            <div class="flex-1 flex flex-col gap-6">
              <div class="flex flex-col items-center text-center gap-2">
                <h1 class="text-2xl font-semibold text-[#212121] font-asap leading-9">
                  Détails de l'événement
                </h1>
                <p class="text-base text-[#545454] font-montserrat">
                  Dites-nous en plus sur votre activité.
                </p>
              </div>

              <div class="flex flex-col gap-2">
                <label class="text-sm font-medium text-[#212121] font-montserrat">Titre</label>
                <input
                  v-model="title"
                  type="text"
                  placeholder="Ex: Tournoi Urban Foot 5"
                  maxlength="160"
                  class="w-full bg-[#f7f7f7] border border-[#d6d6d6] rounded-lg h-12 px-4 text-base text-[#212121] placeholder-[#999] font-montserrat focus:outline-none focus:border-[#ef781e]"
                >
              </div>

              <div class="flex flex-col gap-2">
                <label class="text-sm font-medium text-[#212121] font-montserrat">Description (optionnel)</label>
                <textarea
                  v-model="description"
                  placeholder="Décrivez le déroulement, le matériel nécessaire..."
                  rows="3"
                  class="w-full bg-[#f7f7f7] border border-[#d6d6d6] rounded-lg px-4 py-3 text-base text-[#212121] placeholder-[#999] font-montserrat focus:outline-none focus:border-[#ef781e] resize-none"
                />
              </div>

              <div class="grid grid-cols-2 gap-4">
                <div class="flex flex-col gap-2">
                  <label class="text-sm font-medium text-[#212121] font-montserrat">Prix</label>
                  <input
                    v-model.number="price"
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="Ex: 22€"
                    class="w-full bg-[#f7f7f7] border border-[#d6d6d6] rounded-lg h-12 px-4 text-base text-[#212121] placeholder-[#999] font-montserrat focus:outline-none focus:border-[#ef781e]"
                  >
                </div>
                <div class="flex flex-col gap-2">
                  <label class="text-sm font-medium text-[#212121] font-montserrat">Participants max</label>
                  <input
                    v-model.number="maxParticipants"
                    type="number"
                    min="1"
                    placeholder="Ex: 10"
                    class="w-full bg-[#f7f7f7] border border-[#d6d6d6] rounded-lg h-12 px-4 text-base text-[#212121] placeholder-[#999] font-montserrat focus:outline-none focus:border-[#ef781e]"
                  >
                </div>
              </div>

              <div class="flex flex-col gap-2">
                <label class="text-sm font-medium text-[#212121] font-montserrat">Niveau requis</label>
                <div class="flex flex-wrap gap-2">
                  <button
                    v-for="level in levels"
                    :key="level.value"
                    type="button"
                    class="px-4 py-2 rounded-full text-sm font-montserrat border transition-colors"
                    :class="selectedLevels.includes(level.value)
                      ? 'border-[#ef781e] bg-[#fef8f4] text-[#212121]'
                      : 'border-[#d6d6d6] bg-white text-[#545454]'"
                    @click="toggleLevel(level.value)"
                  >
                    {{ level.label }}
                  </button>
                </div>
              </div>
            </div>

            <div class="pt-4">
              <button
                :disabled="!step3Valid"
                class="w-full h-10 rounded-full text-white font-semibold text-base font-montserrat transition-colors"
                :class="step3Valid ? 'bg-[#ef781e] hover:bg-[#e05f16]' : 'bg-[#ef781e]/50 cursor-not-allowed'"
                @click="nextStep"
              >
                Continuer
              </button>
            </div>
          </div>

          <!-- Step 4: Location & time -->
          <div v-else-if="currentStep === 4" key="step4" class="flex-1 flex flex-col p-4">
            <div class="flex-1 flex flex-col gap-6">
              <div class="flex flex-col items-center text-center gap-2">
                <h1 class="text-2xl font-semibold text-[#212121] font-asap leading-9">
                  Où et quand ?
                </h1>
                <p class="text-base text-[#545454] font-montserrat">
                  Définissez le lieu et les horaires.
                </p>
              </div>

              <div class="flex flex-col gap-2">
                <label class="text-sm font-medium text-[#212121] font-montserrat">Lieu</label>
                <div class="relative">
                  <svg
                    class="absolute left-3 top-1/2 -translate-y-1/2 text-[#545454]"
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path d="M21 10C21 17 12 23 12 23C12 23 3 17 3 10C3 7.61305 3.94821 5.32387 5.63604 3.63604C7.32387 1.94821 9.61305 1 12 1C14.3869 1 16.6761 1.94821 18.364 3.63604C20.0518 5.32387 21 7.61305 21 10Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                    <circle cx="12" cy="10" r="3" stroke="currentColor" stroke-width="2" />
                  </svg>
                  <input
                    v-model="lieu"
                    type="text"
                    placeholder="Adresse ou nom du lieu"
                    class="w-full bg-[#f7f7f7] border border-[#d6d6d6] rounded-lg h-12 pl-10 pr-4 text-base text-[#212121] placeholder-[#999] font-montserrat focus:outline-none focus:border-[#ef781e]"
                  >
                </div>
              </div>

              <div class="flex flex-col gap-2">
                <label class="text-sm font-medium text-[#212121] font-montserrat">Date</label>
                <input
                  v-model="eventDate"
                  type="date"
                  class="w-full bg-[#f7f7f7] border border-[#d6d6d6] rounded-lg h-12 px-4 text-base text-[#212121] font-montserrat focus:outline-none focus:border-[#ef781e]"
                >
              </div>

              <div class="flex gap-4">
                <div class="flex-1 flex flex-col gap-2">
                  <label class="text-sm font-medium text-[#212121] font-montserrat">Début</label>
                  <input
                    v-model="startTime"
                    type="time"
                    class="w-full bg-[#f7f7f7] border border-[#d6d6d6] rounded-lg h-12 px-4 text-base text-[#212121] font-montserrat focus:outline-none focus:border-[#ef781e]"
                  >
                </div>
                <div class="flex-1 flex flex-col gap-2">
                  <label class="text-sm font-medium text-[#212121] font-montserrat">Fin</label>
                  <input
                    v-model="endTime"
                    type="time"
                    class="w-full bg-[#f7f7f7] border border-[#d6d6d6] rounded-lg h-12 px-4 text-base text-[#212121] font-montserrat focus:outline-none focus:border-[#ef781e]"
                  >
                </div>
              </div>

              <div class="flex flex-col gap-2">
                <label class="text-sm font-medium text-[#212121] font-montserrat">Accessibilité</label>
                <div class="flex flex-col gap-2">
                  <button
                    v-for="opt in accessibilityOptions"
                    :key="opt.value"
                    type="button"
                    class="w-full flex items-center gap-3 border rounded-lg h-12 px-4 transition-colors"
                    :class="accessibility.includes(opt.value)
                      ? 'border-[#ef781e] bg-[#fef8f4]'
                      : 'border-[#d6d6d6] bg-white'"
                    @click="toggleAccessibility(opt.value)"
                  >
                    <div
                      class="w-5 h-5 rounded border-2 flex items-center justify-center shrink-0"
                      :class="accessibility.includes(opt.value) ? 'border-[#ef781e] bg-[#ef781e]' : 'border-[#d6d6d6]'"
                    >
                      <svg
                        v-if="accessibility.includes(opt.value)"
                        width="12"
                        height="12"
                        viewBox="0 0 24 24"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path d="M20 6L9 17L4 12" stroke="white" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" />
                      </svg>
                    </div>
                    <span class="text-base text-[#212121] font-montserrat">{{ opt.label }}</span>
                  </button>
                </div>
              </div>
            </div>

            <div class="pt-4">
              <button
                :disabled="!step4Valid"
                class="w-full h-10 rounded-full text-white font-semibold text-base font-montserrat transition-colors"
                :class="step4Valid ? 'bg-[#ef781e] hover:bg-[#e05f16]' : 'bg-[#ef781e]/50 cursor-not-allowed'"
                @click="nextStep"
              >
                Continuer
              </button>
            </div>
          </div>

          <!-- Step 5: Récapitulatif -->
          <div v-else-if="currentStep === 5" key="step5" class="flex-1 flex flex-col p-4">
            <div class="flex-1 flex flex-col gap-4">
              <div class="flex flex-col items-center text-center gap-2">
                <h1 class="text-2xl font-semibold text-[#212121] font-asap leading-9">
                  Récapitulatif
                </h1>
                <p class="text-base text-[#545454] font-montserrat">
                  Vérifiez les informations avant de publier.
                </p>
              </div>

              <!-- Summary card -->
              <div class="border border-[#d6d6d6] rounded-2xl p-5 flex flex-col gap-5">
                <!-- Title + badges -->
                <div class="flex flex-col gap-3">
                  <h2 class="text-lg font-bold text-[#212121] font-asap uppercase">
                    {{ title }}
                  </h2>
                  <div class="flex flex-wrap gap-2">
                    <span class="px-3 py-1 rounded-full bg-[#ef781e] text-white text-xs font-semibold font-montserrat">
                      {{ eventTypeLabel }}
                    </span>
                    <span
                      v-for="sport in selectedSportLabels"
                      :key="sport"
                      class="px-3 py-1 rounded-full bg-[#ef781e] text-white text-xs font-semibold font-montserrat"
                    >
                      {{ sport }}
                    </span>
                  </div>
                </div>

                <!-- Date et Heure -->
                <div class="flex items-start gap-3">
                  <svg
                    class="shrink-0 mt-0.5 text-[#545454]"
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <rect
                      x="3"
                      y="4"
                      width="18"
                      height="18"
                      rx="2"
                      ry="2"
                      stroke="currentColor"
                      stroke-width="2"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                    />
                    <line
                      x1="16"
                      y1="2"
                      x2="16"
                      y2="6"
                      stroke="currentColor"
                      stroke-width="2"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                    />
                    <line
                      x1="8"
                      y1="2"
                      x2="8"
                      y2="6"
                      stroke="currentColor"
                      stroke-width="2"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                    />
                    <line
                      x1="3"
                      y1="10"
                      x2="21"
                      y2="10"
                      stroke="currentColor"
                      stroke-width="2"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                    />
                  </svg>
                  <div class="flex flex-col">
                    <span class="text-sm font-medium text-[#212121] font-montserrat">Date et Heure</span>
                    <span class="text-sm text-[#545454] font-montserrat">{{ formattedDate }}</span>
                    <span class="text-sm text-[#545454] font-montserrat">{{ startTime }} à {{ endTime }}</span>
                  </div>
                </div>

                <!-- Lieu -->
                <div v-if="lieu" class="flex items-start gap-3">
                  <svg
                    class="shrink-0 mt-0.5 text-[#545454]"
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path d="M21 10C21 17 12 23 12 23C12 23 3 17 3 10C3 7.61305 3.94821 5.32387 5.63604 3.63604C7.32387 1.94821 9.61305 1 12 1C14.3869 1 16.6761 1.94821 18.364 3.63604C20.0518 5.32387 21 7.61305 21 10Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                    <circle cx="12" cy="10" r="3" stroke="currentColor" stroke-width="2" />
                  </svg>
                  <div class="flex flex-col">
                    <span class="text-sm font-medium text-[#212121] font-montserrat">Lieu</span>
                    <span class="text-sm text-[#545454] font-montserrat">{{ lieu }}</span>
                  </div>
                </div>

                <!-- Détails -->
                <div class="flex items-start gap-3">
                  <svg
                    class="shrink-0 mt-0.5 text-[#545454]"
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <circle
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      stroke-width="2"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                    />
                    <line
                      x1="12"
                      y1="16"
                      x2="12"
                      y2="12"
                      stroke="currentColor"
                      stroke-width="2"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                    />
                    <line
                      x1="12"
                      y1="8"
                      x2="12.01"
                      y2="8"
                      stroke="currentColor"
                      stroke-width="2"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                    />
                  </svg>
                  <div class="flex flex-col">
                    <span class="text-sm font-medium text-[#212121] font-montserrat">Détails</span>
                    <span class="text-sm text-[#545454] font-montserrat">Niveau : {{ selectedLevelLabels.join(', ') || 'Non défini' }}</span>
                    <span class="text-sm text-[#545454] font-montserrat">Prix : {{ price ? `${price}€` : 'Gratuit' }}</span>
                    <span class="text-sm text-[#545454] font-montserrat">Nombre de participants : {{ maxParticipants ? `${maxParticipants} maximum` : 'Illimité' }}</span>
                  </div>
                </div>
              </div>
            </div>

            <!-- Publier button -->
            <div class="pt-4">
              <button
                :disabled="isLoading"
                class="w-full h-10 rounded-full text-white font-semibold text-base font-montserrat transition-colors bg-[#ef781e] hover:bg-[#e05f16] disabled:opacity-50"
                @click="handleSubmit"
              >
                {{ isLoading ? 'Publication...' : 'Publier' }}
              </button>
            </div>
          </div>
        </Transition>
      </main>
    </template>

    <!-- Bottom Nav -->
    <nav class="shrink-0 bg-white border-t border-[#d6d6d6] py-2">
      <div class="flex items-center justify-around">
        <NuxtLink to="/dashboard" class="flex flex-col items-center gap-1 py-2 px-3 text-[#545454]">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M3 9L12 2L21 9V20C21 20.5304 20.7893 21.0391 20.4142 21.4142C20.0391 21.7893 19.5304 22 19 22H5C4.46957 22 3.96086 21.7893 3.58579 21.4142C3.21071 21.0391 3 20.5304 3 20V9Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
            <path d="M9 22V12H15V22" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
          </svg>
          <span class="text-xs font-montserrat">Accueil</span>
        </NuxtLink>
        <NuxtLink to="/dashboard/recherche" class="flex flex-col items-center gap-1 py-2 px-3 text-[#545454]">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle
              cx="11"
              cy="11"
              r="8"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
            <path d="M21 21L16.65 16.65" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
          </svg>
          <span class="text-xs font-montserrat">Recherche</span>
        </NuxtLink>
        <div class="flex flex-col items-center gap-1 py-2 px-3 text-[#e97217]">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 5V19M5 12H19" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
          </svg>
          <span class="text-xs font-bold font-montserrat">Créer</span>
        </div>
        <NuxtLink to="/events" class="flex flex-col items-center gap-1 py-2 px-3 text-[#545454]">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect
              x="3"
              y="4"
              width="18"
              height="18"
              rx="2"
              ry="2"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
            <line
              x1="16"
              y1="2"
              x2="16"
              y2="6"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
            <line
              x1="8"
              y1="2"
              x2="8"
              y2="6"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
            <line
              x1="3"
              y1="10"
              x2="21"
              y2="10"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </svg>
          <span class="text-xs font-montserrat">Événements</span>
        </NuxtLink>
        <NuxtLink to="/dashboard/profil" class="flex flex-col items-center gap-1 py-2 px-3 text-[#545454]">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M20 21V19C20 17.9391 19.5786 16.9217 18.8284 16.1716C18.0783 15.4214 17.0609 15 16 15H8C6.93913 15 5.92172 15.4214 5.17157 16.1716C4.42143 16.9217 4 17.9391 4 19V21" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
            <circle
              cx="12"
              cy="7"
              r="4"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </svg>
          <span class="text-xs font-montserrat">Profil</span>
        </NuxtLink>
      </div>
    </nav>
  </div>
</template>

<style scoped>
.font-asap {
  font-family: 'Asap', sans-serif;
}

.font-montserrat {
  font-family: 'Montserrat', sans-serif;
}

.slide-enter-active,
.slide-leave-active {
  transition: all 0.3s ease;
}

.slide-enter-from {
  opacity: 0;
  transform: translateX(30px);
}

.slide-leave-to {
  opacity: 0;
  transform: translateX(-30px);
}
</style>
