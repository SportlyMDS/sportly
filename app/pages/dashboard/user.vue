<script setup lang="ts">
definePageMeta({
  middleware: 'auth'
})

const auth = useAuth()
const toast = useToast()

async function handleSignOut() {
  try {
    await auth.signOut({ redirectTo: '/' })
    toast.add({
      title: 'Déconnexion réussie',
      color: 'success'
    })
  } catch (error: any) {
    toast.add({
      title: error.message || 'Erreur lors de la déconnexion',
      color: 'error'
    })
  }
}
</script>

<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-900">
    <UContainer class="py-8">
      <UPageCard>
        <template #header>
          <div class="flex items-center justify-between">
            <h1 class="text-2xl font-bold">
              Tableau de bord utilisateur
            </h1>
            <UButton
              color="error"
              variant="soft"
              icon="i-lucide-log-out"
              @click="handleSignOut"
            >
              Déconnexion
            </UButton>
          </div>
        </template>

        <div class="space-y-6">
          <!-- Informations de session -->
          <div>
            <h2 class="text-lg font-semibold mb-4">
              Informations de session
            </h2>
            <UCard>
              <div class="space-y-3">
                <div class="flex items-center justify-between py-2 border-b border-gray-200 dark:border-gray-700">
                  <span class="text-gray-600 dark:text-gray-400">Statut</span>
                  <UBadge :color="auth.loggedIn.value ? 'success' : 'error'">
                    {{ auth.loggedIn.value ? 'Connecté' : 'Déconnecté' }}
                  </UBadge>
                </div>
                <div class="flex items-center justify-between py-2 border-b border-gray-200 dark:border-gray-700">
                  <span class="text-gray-600 dark:text-gray-400">ID</span>
                  <span class="font-mono text-sm">{{ auth.user.value?.id || 'N/A' }}</span>
                </div>
                <div class="flex items-center justify-between py-2 border-b border-gray-200 dark:border-gray-700">
                  <span class="text-gray-600 dark:text-gray-400">Nom</span>
                  <span class="font-medium">{{ auth.user.value?.name || 'N/A' }}</span>
                </div>
                <div class="flex items-center justify-between py-2 border-b border-gray-200 dark:border-gray-700">
                  <span class="text-gray-600 dark:text-gray-400">Email</span>
                  <span class="font-medium">{{ auth.user.value?.email || 'N/A' }}</span>
                </div>
                <div class="flex items-center justify-between py-2 border-b border-gray-200 dark:border-gray-700">
                  <span class="text-gray-600 dark:text-gray-400">Email vérifié</span>
                  <UBadge :color="auth.user.value?.emailVerified ? 'success' : 'warning'">
                    {{ auth.user.value?.emailVerified ? 'Oui' : 'Non' }}
                  </UBadge>
                </div>
                <div class="flex items-center justify-between py-2 border-b border-gray-200 dark:border-gray-700">
                  <span class="text-gray-600 dark:text-gray-400">Type de compte</span>
                  <UBadge color="primary">
                    {{ (auth.user.value as any)?.accountType || 'N/A' }}
                  </UBadge>
                </div>
                <div class="flex items-center justify-between py-2">
                  <span class="text-gray-600 dark:text-gray-400">Téléphone</span>
                  <span class="font-medium">{{ (auth.user.value as any)?.phone || 'Non renseigné' }}</span>
                </div>
              </div>
            </UCard>
          </div>

          <!-- Objet session complet (pour debug) -->
          <div>
            <h2 class="text-lg font-semibold mb-4">
              Session complète (debug)
            </h2>
            <UCard>
              <pre class="text-xs overflow-auto p-4 bg-gray-100 dark:bg-gray-800 rounded">{{ JSON.stringify(auth.session.value, null, 2) }}</pre>
            </UCard>
          </div>

          <!-- Objet user complet (pour debug) -->
          <div>
            <h2 class="text-lg font-semibold mb-4">
              User complet (debug)
            </h2>
            <UCard>
              <pre class="text-xs overflow-auto p-4 bg-gray-100 dark:bg-gray-800 rounded">{{ JSON.stringify(auth.user.value, null, 2) }}</pre>
            </UCard>
          </div>
        </div>
      </UPageCard>
    </UContainer>
  </div>
</template>
