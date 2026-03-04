// ─── Types ────────────────────────────────────────────────────────────────────

export interface ClubAddress {
  id: string
  accountId: string
  line1: string
  line2?: string | null
  postalCode: string
  city: string
  countryCode: string
  latitude?: number | null
  longitude?: number | null
  isPrimary: boolean
  createdAt: string
}

export interface ClubSport {
  sportId: number
  code: string
  label: string
  emoji?: string | null
  levelsAccepted?: string[] | null
  audiences?: string[] | null
}

export interface ClubPhoto {
  id: string
  storagePath?: string | null
  mimeType?: string | null
  createdAt?: string | null
}

export interface ClubOpeningHour {
  id: string
  clubId: string
  dayOfWeek: string
  morningOpen?: string | null
  morningClose?: string | null
  afternoonOpen?: string | null
  afternoonClose?: string | null
}

export interface ClubReviewItem {
  id: string
  clubId: string
  userId: string
  rating: number
  comment?: string | null
  createdAt?: string | null
}

export interface ClubDetail {
  accountId: string
  clubName: string
  description?: string | null
  rating?: string | null
  reviewCount?: number | null
  isOpen?: boolean | null
  websiteUrl?: string | null
  phone?: string | null
  email?: string | null
  offerType?: string | null
  logoMediaId?: string | null
  addresses: ClubAddress[]
  sports: ClubSport[]
  facilities: string[]
  openingHours: ClubOpeningHour[]
  photos: ClubPhoto[]
  reviews: {
    count: number
    items: ClubReviewItem[]
  }
}

// ─── Enum label maps ──────────────────────────────────────────────────────────

export const DAY_LABELS: Record<string, string> = {
  LUN: 'Lundi',
  MAR: 'Mardi',
  MER: 'Mercredi',
  JEU: 'Jeudi',
  VEN: 'Vendredi',
  SAM: 'Samedi',
  DIM: 'Dimanche'
}

export const DAY_ORDER = ['LUN', 'MAR', 'MER', 'JEU', 'VEN', 'SAM', 'DIM']

export const LEVEL_LABELS: Record<string, string> = {
  DEBUTANT: 'Débutant',
  INTERMEDIAIRE: 'Intermédiaire',
  AVANCE: 'Avancé',
  PRO: 'Pro'
}

export const AUDIENCE_LABELS: Record<string, string> = {
  ENFANTS: 'Enfants',
  ADOS: 'Ados',
  ADULTES: 'Adultes',
  SENIORS: 'Seniors',
  TOUS: 'Tous'
}

export const FACILITY_LABELS: Record<string, string> = {
  HANDICAP_FRIENDLY: '♿ Handicap-friendly',
  VESTIAIRES: '🚿 Vestiaires',
  TOILETTES: '🚻 Toilettes'
}

export const OFFER_LABELS: Record<string, string> = {
  ESSENTIEL: 'Essentiel ⭐',
  VISIBILITE: 'Visibilité 🚀'
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

export function formatTime(t: string | null | undefined): string {
  if (!t) return ''
  return t.slice(0, 5)
}

export function formatDaySchedule(hour: ClubOpeningHour): string | null {
  const parts: string[] = []
  if (hour.morningOpen && hour.morningClose) {
    parts.push(`${formatTime(hour.morningOpen)}–${formatTime(hour.morningClose)}`)
  }
  if (hour.afternoonOpen && hour.afternoonClose) {
    parts.push(`${formatTime(hour.afternoonOpen)}–${formatTime(hour.afternoonClose)}`)
  }
  return parts.length ? parts.join(' / ') : null
}

export function getPrimaryAddress(addresses: ClubAddress[]): ClubAddress | null {
  if (!addresses.length) return null
  return addresses.find(a => a.isPrimary) ?? addresses[0]
}

export function formatAddress(addr: ClubAddress): string {
  return `${addr.line1}, ${addr.postalCode} ${addr.city}`
}

export function resolvePhotoUrl(storagePath: string | null | undefined): string {
  if (!storagePath) return 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=800&h=500&fit=crop'
  return `/storage/${storagePath}`
}

// ─── Composable ───────────────────────────────────────────────────────────────

export function useClub(id: string) {
  const { data: club, status, error, refresh } = useFetch<ClubDetail>(`/api/clubs/${id}`, {
    key: `club-${id}`
  })

  const isLoading = computed(() => status.value === 'pending')
  const isError = computed(() => status.value === 'error' && (error.value as any)?.statusCode !== 404)
  const notFound = computed(() => status.value === 'error' && (error.value as any)?.statusCode === 404)

  const primaryAddress = computed(() => {
    if (!club.value) return null
    return getPrimaryAddress(club.value.addresses)
  })

  const sortedHours = computed(() => {
    if (!club.value) return []
    return [...club.value.openingHours].sort(
      (a, b) => DAY_ORDER.indexOf(a.dayOfWeek) - DAY_ORDER.indexOf(b.dayOfWeek)
    )
  })

  const resolvedPhotos = computed(() => {
    if (!club.value) return []
    if (club.value.photos.length === 0) {
      return [{ id: 'placeholder', url: 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=800&h=500&fit=crop', mimeType: null }]
    }
    return club.value.photos.map(p => ({
      id: p.id,
      url: resolvePhotoUrl(p.storagePath),
      mimeType: p.mimeType
    }))
  })

  return {
    club,
    isLoading,
    isError,
    notFound,
    refresh,
    primaryAddress,
    sortedHours,
    resolvedPhotos
  }
}
