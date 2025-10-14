<template>
  <div>
    <!-- Header du dashboard club -->
    <div class="mb-8">
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-3xl font-bold text-gray-900 dark:text-white">
            Dashboard Club
          </h1>
          <p class="text-gray-600 dark:text-gray-400">
            Gérez votre club {{ user?.name || 'Mon Club' }}
          </p>
        </div>

        <UDropdown :items="clubMenuItems">
          <UAvatar
            :src="user?.image || undefined"
            :alt="user?.name || user?.email"
            size="lg"
          />
        </UDropdown>
      </div>
    </div>

    <!-- Statistiques du club -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <UCard>
        <div class="flex items-center">
          <div class="flex-shrink-0">
            <UIcon name="i-heroicons-calendar" class="h-8 w-8 text-blue-500" />
          </div>
          <div class="ml-4">
            <p class="text-sm font-medium text-gray-500 dark:text-gray-400">
              Événements actifs
            </p>
            <p class="text-2xl font-semibold text-gray-900 dark:text-white">
              {{ activeEvents.length }}
            </p>
          </div>
        </div>
      </UCard>

      <UCard>
        <div class="flex items-center">
          <div class="flex-shrink-0">
            <UIcon name="i-heroicons-users" class="h-8 w-8 text-green-500" />
          </div>
          <div class="ml-4">
            <p class="text-sm font-medium text-gray-500 dark:text-gray-400">
              Membres inscrits
            </p>
            <p class="text-2xl font-semibold text-gray-900 dark:text-white">
              {{ totalMembers }}
            </p>
          </div>
        </div>
      </UCard>

      <UCard>
        <div class="flex items-center">
          <div class="flex-shrink-0">
            <UIcon name="i-heroicons-star" class="h-8 w-8 text-yellow-500" />
          </div>
          <div class="ml-4">
            <p class="text-sm font-medium text-gray-500 dark:text-gray-400">
              Note moyenne
            </p>
            <p class="text-2xl font-semibold text-gray-900 dark:text-white">
              {{ clubRating }}/5
            </p>
          </div>
        </div>
      </UCard>

      <UCard>
        <div class="flex items-center">
          <div class="flex-shrink-0">
            <UIcon name="i-heroicons-currency-euro" class="h-8 w-8 text-purple-500" />
          </div>
          <div class="ml-4">
            <p class="text-sm font-medium text-gray-500 dark:text-gray-400">
              Revenus ce mois
            </p>
            <p class="text-2xl font-semibold text-gray-900 dark:text-white">
              {{ monthlyRevenue }}€
            </p>
          </div>
        </div>
      </UCard>
    </div>

    <!-- Actions rapides -->
    <div class="mb-8">
      <h2 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">
        Actions rapides
      </h2>
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <UCard class="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
          <div class="flex items-center space-x-4">
            <div class="flex-shrink-0">
              <UIcon name="i-heroicons-plus-circle" class="h-8 w-8 text-blue-500" />
            </div>
            <div>
              <h3 class="font-medium text-gray-900 dark:text-white">
                Créer un événement
              </h3>
              <p class="text-sm text-gray-500 dark:text-gray-400">
                Organisez un nouveau stage ou tournoi
              </p>
            </div>
          </div>
        </UCard>

        <UCard class="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
          <div class="flex items-center space-x-4">
            <div class="flex-shrink-0">
              <UIcon name="i-heroicons-cog-6-tooth" class="h-8 w-8 text-green-500" />
            </div>
            <div>
              <h3 class="font-medium text-gray-900 dark:text-white">
                Gérer le profil
              </h3>
              <p class="text-sm text-gray-500 dark:text-gray-400">
                Modifier les informations du club
              </p>
            </div>
          </div>
        </UCard>

        <UCard class="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
          <div class="flex items-center space-x-4">
            <div class="flex-shrink-0">
              <UIcon name="i-heroicons-chart-bar" class="h-8 w-8 text-purple-500" />
            </div>
            <div>
              <h3 class="font-medium text-gray-900 dark:text-white">
                Voir les statistiques
              </h3>
              <p class="text-sm text-gray-500 dark:text-gray-400">
                Analyser les performances
              </p>
            </div>
          </div>
        </UCard>
      </div>
    </div>

    <!-- Contenu principal -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <!-- Événements récents -->
      <div class="lg:col-span-2">
        <UCard>
          <template #header>
            <div class="flex items-center justify-between">
              <h2 class="text-xl font-semibold">
                Événements récents
              </h2>
              <UButton
                variant="outline"
                size="sm"
                icon="i-heroicons-plus"
              >
                Nouveau
              </UButton>
            </div>
          </template>

          <div v-if="recentEvents.length === 0" class="text-center py-8">
            <UIcon name="i-heroicons-calendar-x" class="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p class="text-gray-500 dark:text-gray-400">
              Aucun événement récent
            </p>
            <UButton
              variant="soft"
              size="sm"
              class="mt-4"
            >
              Créer votre premier événement
            </UButton>
          </div>

          <div v-else class="space-y-4">
            <div
              v-for="event in recentEvents"
              :key="event.id"
              class="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg"
            >
              <div class="flex items-center space-x-4">
                <div class="flex-shrink-0">
                  <div class="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
                    <UIcon name="i-heroicons-calendar" class="h-6 w-6 text-blue-600 dark:text-blue-400" />
                  </div>
                </div>
                <div>
                  <h3 class="font-medium text-gray-900 dark:text-white">
                    {{ event.title }}
                  </h3>
                  <p class="text-sm text-gray-500 dark:text-gray-400">
                    {{ formatDate(event.startTime) }} • {{ event.participants }} participants
                  </p>
                </div>
              </div>

              <div class="flex items-center space-x-2">
                <UBadge :color="getEventStatusColor(event.status)" variant="soft">
                  {{ event.status }}
                </UBadge>
                <UDropdown :items="getEventActions(event)">
                  <UButton
                    variant="ghost"
                    size="sm"
                    icon="i-heroicons-ellipsis-vertical"
                  />
                </UDropdown>
              </div>
            </div>
          </div>
        </UCard>
      </div>

      <!-- Sidebar -->
      <div class="space-y-6">
        <!-- Inscriptions récentes -->
        <UCard>
          <template #header>
            <h2 class="text-lg font-semibold">
              Inscriptions récentes
            </h2>
          </template>

          <div class="space-y-3">
            <div
              v-for="registration in recentRegistrations"
              :key="registration.id"
              class="flex items-center space-x-3"
            >
              <UAvatar
                :src="registration.user.avatar || undefined"
                :alt="registration.user.name"
                size="sm"
              />
              <div class="flex-1 min-w-0">
                <p class="text-sm font-medium text-gray-900 dark:text-white truncate">
                  {{ registration.user.name }}
                </p>
                <p class="text-xs text-gray-500 dark:text-gray-400">
                  {{ registration.event }} • {{ formatRelativeTime(registration.createdAt) }}
                </p>
              </div>
            </div>
          </div>
        </UCard>

        <!-- Avis récents -->
        <UCard>
          <template #header>
            <h2 class="text-lg font-semibold">
              Avis récents
            </h2>
          </template>

          <div class="space-y-3">
            <div
              v-for="review in recentReviews"
              :key="review.id"
              class="border-b border-gray-200 dark:border-gray-700 pb-3 last:border-b-0"
            >
              <div class="flex items-center space-x-2 mb-2">
                <UAvatar
                  :src="review.user.avatar || undefined"
                  :alt="review.user.name"
                  size="xs"
                />
                <span class="text-sm font-medium text-gray-900 dark:text-white">
                  {{ review.user.name }}
                </span>
                <div class="flex">
                  <UIcon
                    v-for="i in 5"
                    :key="i"
                    name="i-heroicons-star-solid"
                    :class="i <= review.rating ? 'text-yellow-400' : 'text-gray-300'"
                    class="h-4 w-4"
                  />
                </div>
              </div>
              <p class="text-sm text-gray-600 dark:text-gray-400">
                {{ review.comment }}
              </p>
              <p class="text-xs text-gray-500 dark:text-gray-500 mt-1">
                {{ formatRelativeTime(review.createdAt) }}
              </p>
            </div>
          </div>
        </UCard>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
// Middleware d'authentification
definePageMeta({
  middleware: 'auth'
})

// SEO
useSeoMeta({
  title: 'Dashboard Club - Sportly',
  description: 'Gérez votre club sportif et vos événements.'
})

// Composables
const { user, signOut } = useAuth()
const toast = useToast()

// Menu club
const clubMenuItems = [
  [{
    label: 'Profil du club',
    icon: 'i-heroicons-building-office',
    click: () => navigateTo('/club/profile')
  }],
  [{
    label: 'Paramètres',
    icon: 'i-heroicons-cog-6-tooth',
    click: () => navigateTo('/club/settings')
  }],
  [{
    label: 'Déconnexion',
    icon: 'i-heroicons-arrow-right-on-rectangle',
    click: () => handleSignOut()
  }]
]

// Données mockées du club
const activeEvents = ref([
  { id: '1', title: 'Stage Tennis Été' },
  { id: '2', title: 'Tournoi Badminton' }
])

const totalMembers = ref(156)
const clubRating = ref(4.7)
const monthlyRevenue = ref(2450)

const recentEvents = ref([
  {
    id: '1',
    title: 'Stage de Tennis Débutant',
    startTime: new Date(Date.now() + 86400000),
    participants: 12,
    status: 'Actif'
  },
  {
    id: '2',
    title: 'Tournoi de Badminton',
    startTime: new Date(Date.now() + 172800000),
    participants: 24,
    status: 'Complet'
  },
  {
    id: '3',
    title: 'Entraînement Collectif',
    startTime: new Date(Date.now() - 86400000),
    participants: 8,
    status: 'Terminé'
  }
])

const recentRegistrations = ref([
  {
    id: '1',
    user: { name: 'Marie Dubois', avatar: null },
    event: 'Stage Tennis',
    createdAt: new Date(Date.now() - 3600000)
  },
  {
    id: '2',
    user: { name: 'Pierre Martin', avatar: null },
    event: 'Tournoi Badminton',
    createdAt: new Date(Date.now() - 7200000)
  }
])

const recentReviews = ref([
  {
    id: '1',
    user: { name: 'Sophie L.', avatar: null },
    rating: 5,
    comment: 'Excellent club, très bon encadrement !',
    createdAt: new Date(Date.now() - 86400000)
  },
  {
    id: '2',
    user: { name: 'Thomas R.', avatar: null },
    rating: 4,
    comment: 'Bonnes installations, je recommande.',
    createdAt: new Date(Date.now() - 172800000)
  }
])

// Méthodes utilitaires
const formatDate = (date: Date) => {
  return new Intl.DateTimeFormat('fr-FR', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(date)
}

const formatRelativeTime = (date: Date) => {
  const rtf = new Intl.RelativeTimeFormat('fr-FR', { numeric: 'auto' })
  const diff = date.getTime() - Date.now()
  const diffInHours = Math.round(diff / (1000 * 60 * 60))

  if (Math.abs(diffInHours) < 24) {
    return rtf.format(diffInHours, 'hour')
  } else {
    const diffInDays = Math.round(diffInHours / 24)
    return rtf.format(diffInDays, 'day')
  }
}

const getEventStatusColor = (status: string): 'primary' | 'secondary' | 'success' | 'info' | 'warning' | 'error' | 'neutral' => {
  const colors: Record<string, 'primary' | 'secondary' | 'success' | 'info' | 'warning' | 'error' | 'neutral'> = {
    Actif: 'success',
    Complet: 'warning',
    Terminé: 'neutral',
    Annulé: 'error'
  }
  return colors[status] || 'neutral'
}

const getEventActions = (event: any) => {
  return [
    [{
      label: 'Voir les détails',
      icon: 'i-heroicons-eye',
      click: () => navigateTo(`/events/${event.id}`)
    }],
    [{
      label: 'Modifier',
      icon: 'i-heroicons-pencil',
      click: () => navigateTo(`/events/${event.id}/edit`)
    }],
    [{
      label: 'Supprimer',
      icon: 'i-heroicons-trash',
      click: () => deleteEvent(event.id)
    }]
  ]
}

// Actions
const handleSignOut = async () => {
  const result = await signOut()
  if (result?.data) {
    toast.add({
      title: 'Déconnexion réussie',
      description: 'À bientôt !',
      color: 'success'
    })
  }
}

const deleteEvent = (_eventId: string) => {
  toast.add({
    title: 'Fonctionnalité à venir',
    description: 'La suppression d\'événements sera bientôt disponible.',
    color: 'info'
  })
}
</script>
