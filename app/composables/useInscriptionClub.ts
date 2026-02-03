export interface InscriptionClubData {
  // Step 1: Sports
  sports: string[]

  // Step 2: Infos club
  clubName: string
  website: string
  description: string
  postalCode: string
  city: string
  address: string

  // Step 3: Infos personnelles
  firstName: string
  lastName: string
  email: string
  phone: string
  password: string
  confirmPassword: string
}

export interface InscriptionClubState {
  currentStep: number
  maxStepReached: number
  data: InscriptionClubData
  isLoading: boolean
  error: string | null
}

export const TOTAL_STEPS_CLUB = 3

export const useInscriptionClub = () => {
  const route = useRoute()
  const router = useRouter()

  const state = useState<InscriptionClubState>('inscription-club-state', () => ({
    currentStep: 1,
    maxStepReached: 1,
    data: {
      sports: [],
      clubName: '',
      website: '',
      description: '',
      postalCode: '',
      city: '',
      address: '',
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      password: '',
      confirmPassword: ''
    },
    isLoading: false,
    error: null
  }))

  const currentStep = computed({
    get: () => {
      const stepFromUrl = Number(route.query.step) || 1
      return Math.min(Math.max(stepFromUrl, 1), state.value.maxStepReached)
    },
    set: (value: number) => {
      router.push({
        path: '/inscription/club',
        query: { step: String(value) }
      })
    }
  })

  const progress = computed(() => {
    return (currentStep.value / TOTAL_STEPS_CLUB) * 100
  })

  const goToStep = (step: number) => {
    if (step < 1 || step > TOTAL_STEPS_CLUB) return
    if (step > state.value.maxStepReached) return
    currentStep.value = step
  }

  const nextStep = () => {
    const next = currentStep.value + 1
    if (next <= TOTAL_STEPS_CLUB) {
      state.value.maxStepReached = Math.max(state.value.maxStepReached, next)
      currentStep.value = next
    }
  }

  const prevStep = () => {
    const prev = currentStep.value - 1
    if (prev >= 1) {
      currentStep.value = prev
    } else {
      router.push('/inscription')
    }
  }

  const updateData = <K extends keyof InscriptionClubData>(
    key: K,
    value: InscriptionClubData[K]
  ) => {
    state.value.data[key] = value
  }

  const resetState = () => {
    state.value = {
      currentStep: 1,
      maxStepReached: 1,
      data: {
        sports: [],
        clubName: '',
        website: '',
        description: '',
        postalCode: '',
        city: '',
        address: '',
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        password: '',
        confirmPassword: ''
      },
      isLoading: false,
      error: null
    }
  }

  return {
    state,
    currentStep,
    progress,
    goToStep,
    nextStep,
    prevStep,
    updateData,
    resetState,
    totalSteps: TOTAL_STEPS_CLUB
  }
}
