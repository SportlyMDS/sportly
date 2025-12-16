import { z } from 'zod'

/**
 * Types pour le parcours d'inscription
 */
export interface InscriptionParticulierData {
  // Step 1: Informations personnelles
  firstName: string
  lastName: string
  email: string
  password: string
  confirmPassword: string

  // Step 2: Vérification email
  verificationCode: string
  emailVerified: boolean

  // Step 3: Zone de recherche
  address: string
  latitude: number | null
  longitude: number | null
  searchRadius: number // en km
}

export interface InscriptionState {
  currentStep: number
  maxStepReached: number
  data: InscriptionParticulierData
  isLoading: boolean
  error: string | null
}

/**
 * Schémas de validation Zod pour chaque étape
 */
export const inscriptionSchemas = {
  step1: z.object({
    firstName: z.string().min(2, 'Le prénom doit contenir au moins 2 caractères'),
    lastName: z.string().min(2, 'Le nom doit contenir au moins 2 caractères'),
    email: z.string().email('Adresse email invalide'),
    password: z
      .string()
      .min(8, 'Le mot de passe doit contenir au moins 8 caractères')
      .regex(/[A-Z]/, 'Le mot de passe doit contenir au moins une majuscule')
      .regex(/\d/, 'Le mot de passe doit contenir au moins un chiffre'),
    confirmPassword: z.string()
  }).refine(data => data.password === data.confirmPassword, {
    message: 'Les mots de passe ne correspondent pas',
    path: ['confirmPassword']
  }),

  step2: z.object({
    verificationCode: z.string().length(6, 'Le code doit contenir 6 chiffres')
  }),

  step3: z.object({
    address: z.string().min(5, 'Veuillez entrer une adresse valide'),
    latitude: z.number().nullable(),
    longitude: z.number().nullable(),
    searchRadius: z.number().min(1).max(100)
  }).refine(data => data.latitude !== null && data.longitude !== null, {
    message: 'Veuillez sélectionner une adresse sur la carte',
    path: ['address']
  })
}

/**
 * Nombre total d'étapes pour l'inscription particulier
 */
export const TOTAL_STEPS_PARTICULIER = 3

/**
 * Composable pour gérer l'état de l'inscription
 */
export const useInscription = () => {
  const route = useRoute()
  const router = useRouter()

  // État global de l'inscription (persisté pendant la session)
  const state = useState<InscriptionState>('inscription-state', () => ({
    currentStep: 1,
    maxStepReached: 1,
    data: {
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      confirmPassword: '',
      verificationCode: '',
      emailVerified: false,
      address: '',
      latitude: null,
      longitude: null,
      searchRadius: 10
    },
    isLoading: false,
    error: null
  }))

  // Synchroniser le step avec l'URL
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

  // Navigation entre les étapes
  const goToStep = (step: number) => {
    if (step < 1 || step > TOTAL_STEPS_PARTICULIER) return
    if (step > state.value.maxStepReached) return

    currentStep.value = step
  }

  const nextStep = () => {
    const next = currentStep.value + 1
    if (next <= TOTAL_STEPS_PARTICULIER) {
      state.value.maxStepReached = Math.max(state.value.maxStepReached, next)
      currentStep.value = next
    }
  }

  const prevStep = () => {
    const prev = currentStep.value - 1
    if (prev >= 1) {
      currentStep.value = prev
    }
  }

  // Mettre à jour les données
  const updateData = <K extends keyof InscriptionParticulierData>(
    key: K,
    value: InscriptionParticulierData[K]
  ) => {
    state.value.data[key] = value
  }

  // Réinitialiser l'état
  const resetState = () => {
    state.value = {
      currentStep: 1,
      maxStepReached: 1,
      data: {
        firstName: '',
        lastName: '',
        email: '',
        password: '',
        confirmPassword: '',
        verificationCode: '',
        emailVerified: false,
        address: '',
        latitude: null,
        longitude: null,
        searchRadius: 10
      },
      isLoading: false,
      error: null
    }
  }

  // Valider une étape
  const validateStep = (step: number): boolean => {
    try {
      const schema = inscriptionSchemas[`step${step}` as keyof typeof inscriptionSchemas]
      if (!schema) return true

      schema.parse(state.value.data)
      return true
    } catch {
      return false
    }
  }

  // Progression en pourcentage
  const progress = computed(() => {
    return ((currentStep.value - 1) / (TOTAL_STEPS_PARTICULIER - 1)) * 100
  })

  return {
    state,
    currentStep,
    goToStep,
    nextStep,
    prevStep,
    updateData,
    resetState,
    validateStep,
    progress,
    totalSteps: TOTAL_STEPS_PARTICULIER
  }
}
