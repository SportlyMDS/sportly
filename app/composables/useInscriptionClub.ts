export interface InscriptionClubData {
  // Step 2: Sports (step 1 = profile type selection on /inscription)
  sports: string[]

  // Step 3: Infos club
  clubName: string
  website: string
  description: string
  postalCode: string
  city: string
  address: string

  // Step 4: Infos personnelles
  firstName: string
  lastName: string
  email: string
  phone: string
  password: string
  confirmPassword: string

  // Step 5: OTP verification
  verificationCode: string
}

export interface InscriptionClubState {
  currentStep: number
  maxStepReached: number
  data: InscriptionClubData
  isLoading: boolean
  error: string | null
  // Email verification
  verificationId: string | null
  emailVerified: boolean
  // Club registration
  clubId: string | null
}

export const TOTAL_STEPS_CLUB = 5

export const useInscriptionClub = () => {
  const route = useRoute()
  const router = useRouter()

  const state = useState<InscriptionClubState>('inscription-club-state', () => ({
    currentStep: 2,
    maxStepReached: 2,
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
      confirmPassword: '',
      verificationCode: ''
    },
    isLoading: false,
    error: null,
    verificationId: null,
    emailVerified: false,
    clubId: null
  }))

  const currentStep = computed({
    get: () => {
      const stepFromUrl = Number(route.query.step) || 1
      return Math.min(Math.max(stepFromUrl, 1), state.value.maxStepReached)
    },
    set: (value: number) => {
      router.push({
        query: { ...route.query, step: String(value) }
      })
    }
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
      currentStep: 2,
      maxStepReached: 2,
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
        confirmPassword: '',
        verificationCode: ''
      },
      isLoading: false,
      error: null,
      verificationId: null,
      emailVerified: false,
      clubId: null
    }
  }

  return {
    state,
    currentStep,
    goToStep,
    nextStep,
    prevStep,
    updateData,
    resetState,
    totalSteps: TOTAL_STEPS_CLUB
  }
}
