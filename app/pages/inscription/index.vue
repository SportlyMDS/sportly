<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
    <div class="max-w-lg w-full space-y-8">
      <!-- Header -->
      <div class="text-center">
        <h1 class="text-3xl font-bold text-gray-900 dark:text-white">
          Rejoignez Sportly
        </h1>
        <p class="mt-2 text-sm text-gray-600 dark:text-gray-400">
          Choisissez votre type de profil pour commencer
        </p>
      </div>

      <!-- Sélection du type de profil -->
      <div class="grid gap-4">
        <UCard
          class="cursor-pointer hover:ring-2 hover:ring-primary-500 transition-all"
          @click="selectProfileType('particulier')"
        >
          <div class="flex items-center gap-4">
            <div class="flex-shrink-0 w-12 h-12 bg-primary-100 dark:bg-primary-900 rounded-full flex items-center justify-center">
              <UIcon name="i-heroicons-user" class="w-6 h-6 text-primary-600 dark:text-primary-400" />
            </div>
            <div class="flex-1">
              <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
                Particulier
              </h3>
              <p class="text-sm text-gray-600 dark:text-gray-400">
                Je recherche des activités sportives près de chez moi
              </p>
            </div>
            <UIcon name="i-heroicons-chevron-right" class="w-5 h-5 text-gray-400" />
          </div>
        </UCard>

        <UCard
          class="cursor-pointer hover:ring-2 hover:ring-primary-500 transition-all"
          @click="selectProfileType('club')"
        >
          <div class="flex items-center gap-4">
            <div class="flex-shrink-0 w-12 h-12 bg-primary-100 dark:bg-primary-900 rounded-full flex items-center justify-center">
              <UIcon name="i-heroicons-building-office" class="w-6 h-6 text-primary-600 dark:text-primary-400" />
            </div>
            <div class="flex-1">
              <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
                Club / Salle
              </h3>
              <p class="text-sm text-gray-600 dark:text-gray-400">
                Je propose des activités sportives et souhaite attirer de nouveaux membres
              </p>
            </div>
            <UIcon name="i-heroicons-chevron-right" class="w-5 h-5 text-gray-400" />
          </div>
        </UCard>
      </div>

      <!-- Lien vers connexion -->
      <div class="text-center">
        <p class="text-sm text-gray-600 dark:text-gray-400">
          Vous avez déjà un compte ?
          <UButton
            variant="link"
            size="sm"
            to="/auth/login"
          >
            Se connecter
          </UButton>
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  middleware: 'guest',
  layout: false
})

useSeoMeta({
  title: 'Inscription - Sportly',
  description: 'Créez votre compte Sportly et rejoignez la communauté sportive.'
})

const selectProfileType = (type: 'particulier' | 'club') => {
  navigateTo({
    path: `/inscription/${type}`,
    query: { step: '1' }
  })
}
</script>
