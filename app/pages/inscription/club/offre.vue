<script setup lang="ts">
definePageMeta({
  layout: false
})

const { state, resetState } = useInscriptionClub()
const toast = useToast()

type OfferType = 'essentiel' | 'visibilite'

const selectedOffer = ref<OfferType>('essentiel')
const isLoading = ref(false)

const offers = {
  essentiel: {
    title: 'Essentiel',
    price: 'Gratuit',
    priceLabel: '',
    description: 'Parfait pour démarrer votre présence sur Sportly',
    features: [
      'Création d\'événements illimités',
      'Gestion des membres',
      'Présence sur la plateforme',
      'Messagerie de base'
    ],
    popular: false,
    iconBgClass: 'bg-[#f4e1d7]'
  },
  visibilite: {
    title: 'Visibilité+',
    price: '10€',
    priceLabel: '/mois',
    description: 'Donnez un coup de projecteur à votre club !',
    features: [
      'Tout de l\'offre Essentiel',
      'Mise en avant exclusive',
      'Badge premium visible',
      'Statistiques avancées',
      'Support prioritaire'
    ],
    popular: true,
    iconBgClass: 'bg-[#f4e1d7]'
  }
}

function goBack() {
  navigateTo('/inscription/club?step=4')
}

async function goNext() {
  if (!state.value.clubId) {
    toast.add({
      title: 'Erreur',
      description: 'Aucun club trouvé. Veuillez recommencer l\'inscription.',
      color: 'error'
    })
    navigateTo('/inscription/club')
    return
  }

  isLoading.value = true

  try {
    const offerType = selectedOffer.value === 'essentiel' ? 'ESSENTIEL' : 'VISIBILITE'

    await $fetch('/api/clubs/offer', {
      method: 'POST',
      body: {
        clubId: state.value.clubId,
        offerType
      }
    })

    toast.add({
      title: 'Inscription terminée !',
      description: 'Votre club est maintenant actif sur Sportly',
      color: 'success'
    })

    // Reset state and navigate to success
    resetState()
    navigateTo('/inscription/club/success')
  } catch (error: unknown) {
    console.error('Save offer error:', error)
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
    <!-- Header avec logo -->
    <div class="w-full bg-white flex items-center justify-center p-4 relative">
      <img
        class="w-[120px] h-auto object-cover"
        loading="lazy"
        alt="Logo Sportly"
        src="/Nouveau-logo-sportly-1Logo-1@2x.png"
      >
      <!-- Barre de progression (100%) -->
      <div class="absolute bottom-0 left-0 w-full h-[2px] bg-gray-200">
        <div class="h-full bg-tango-500 w-full" />
      </div>
    </div>

    <!-- Contenu principal -->
    <div class="flex-1 flex flex-col px-4 pb-4">
      <!-- Bouton Retour -->
      <div
        class="flex items-center gap-2 cursor-pointer py-4"
        @click="goBack"
      >
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M15 18L9 12L15 6"
            stroke="black"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
        </svg>
        <span class="text-base text-black font-roboto">Retour</span>
      </div>

      <!-- Contenu scrollable -->
      <div class="flex-1 overflow-y-auto">
        <!-- Header section -->
        <div class="flex flex-col items-center gap-6 pb-6">
          <h2 class="text-xl font-semibold text-[#1c1c1c] font-asap">
            Choisissez votre offre
          </h2>

          <!-- Emoji & Title -->
          <div class="flex flex-col items-center gap-2">
            <span class="text-5xl">🚀</span>
            <h1 class="text-2xl font-semibold text-[#1c1c1c] font-asap text-center">
              Boostez votre club
            </h1>
            <p class="text-base text-[#545454] text-center font-roboto">
              Choisissez l'offre qui correspond à vos ambitions
            </p>
          </div>
        </div>

        <!-- Offer cards -->
        <div class="flex flex-col gap-4 pb-4">
          <!-- Essentiel -->
          <InscriptionClubOfferCard
            :selected="selectedOffer === 'essentiel'"
            :title="offers.essentiel.title"
            :price="offers.essentiel.price"
            :description="offers.essentiel.description"
            :features="offers.essentiel.features"
            :icon-bg-class="offers.essentiel.iconBgClass"
            @select="selectedOffer = 'essentiel'"
          >
            <template #icon>
              <svg
                class="w-8 h-8 text-tango-600"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M13 2L3 14H12L11 22L21 10H12L13 2Z"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />
              </svg>
            </template>
          </InscriptionClubOfferCard>

          <!-- Visibilité+ -->
          <InscriptionClubOfferCard
            :selected="selectedOffer === 'visibilite'"
            :title="offers.visibilite.title"
            :price="offers.visibilite.price"
            :price-label="offers.visibilite.priceLabel"
            :description="offers.visibilite.description"
            :features="offers.visibilite.features"
            :popular="offers.visibilite.popular"
            :icon-bg-class="offers.visibilite.iconBgClass"
            @select="selectedOffer = 'visibilite'"
          >
            <template #icon>
              <svg
                class="w-8 h-8 text-tango-600"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />
              </svg>
            </template>
          </InscriptionClubOfferCard>
        </div>

        <!-- Info box -->
        <div class="bg-[rgba(227,227,227,0.5)] border border-[#d6d6d6] rounded-lg p-4 mb-4">
          <div class="flex gap-2">
            <span class="text-sm">💡</span>
            <p class="text-sm text-[#545454] font-roboto">
              <span class="font-medium">Bon à savoir : </span>
              <span>Vous pourrez changer d'offre à tout moment depuis les paramètres de votre club.</span>
            </p>
          </div>
        </div>
      </div>

      <!-- Footer button -->
      <div class="pt-4 border-t border-[#d6d6d6]">
        <UButton
          block
          :loading="isLoading"
          class="bg-tango-500! hover:bg-tango-600! text-white! font-semibold! font-montserrat! text-base! rounded-[50px]! py-3!"
          @click="goNext"
        >
          Continuer
        </UButton>
      </div>
    </div>
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
