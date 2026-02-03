<script setup lang="ts">
import type { InscriptionClubData } from '~/composables/useInscriptionClub'

const props = defineProps<{
  data: InscriptionClubData
  isLoading: boolean
}>()

const emit = defineEmits<{
  update: [key: keyof InscriptionClubData, value: string]
  submit: []
}>()

const isFormValid = computed(() => {
  return props.data.firstName.trim() !== ''
    && props.data.lastName.trim() !== ''
    && props.data.email.trim() !== ''
    && props.data.phone.trim() !== ''
    && props.data.password.length >= 8
    && props.data.password === props.data.confirmPassword
})

function handleSubmit() {
  if (isFormValid.value) {
    emit('submit')
  }
}
</script>

<template>
  <div class="flex flex-col gap-8">
    <!-- Titre et sous-titre -->
    <div class="flex flex-col gap-2">
      <h1 class="text-[30px] font-semibold text-[#1c1c1c] leading-[45px] tracking-tight font-asap">
        Informations personnelles
      </h1>
      <p class="text-base text-[#545454] leading-6 font-roboto">
        Créez votre compte pour gérer votre club
      </p>
    </div>

    <!-- Formulaire -->
    <div class="flex flex-col gap-6">
      <!-- Prénom et Nom -->
      <div class="grid grid-cols-2 gap-4">
        <div class="flex flex-col gap-2">
          <label class="text-base text-[#1c1c1c] leading-6 font-roboto">Prénom *</label>
          <input
            :value="data.firstName"
            type="text"
            placeholder="Prénom"
            class="w-full bg-[#f7f7f7] border-2 border-[#e5e7eb] rounded-lg h-12 px-3 text-sm text-[#1c1c1c] placeholder-[#545454] font-roboto focus:outline-none focus:border-[#ef781e]"
            @input="emit('update', 'firstName', ($event.target as HTMLInputElement).value)"
          >
        </div>
        <div class="flex flex-col gap-2">
          <label class="text-base text-[#1c1c1c] leading-6 font-roboto">Nom *</label>
          <input
            :value="data.lastName"
            type="text"
            placeholder="Nom"
            class="w-full bg-[#f7f7f7] border-2 border-[#e5e7eb] rounded-lg h-12 px-3 text-sm text-[#1c1c1c] placeholder-[#545454] font-roboto focus:outline-none focus:border-[#ef781e]"
            @input="emit('update', 'lastName', ($event.target as HTMLInputElement).value)"
          >
        </div>
      </div>

      <!-- Adresse e-mail -->
      <div class="flex flex-col gap-2">
        <label class="text-base text-[#1c1c1c] leading-6 font-roboto">Adresse e-mail *</label>
        <div class="relative">
          <input
            :value="data.email"
            type="email"
            placeholder="Adresse e-mail"
            class="w-full bg-[#f7f7f7] border-2 border-[#e5e7eb] rounded-lg h-12 pl-12 pr-3 text-sm text-[#1c1c1c] placeholder-[#545454] font-roboto focus:outline-none focus:border-[#ef781e]"
            @input="emit('update', 'email', ($event.target as HTMLInputElement).value)"
          >
          <svg
            class="absolute left-4 top-1/2 -translate-y-1/2 text-[#545454]"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path d="M4 4H20C21.1 4 22 4.9 22 6V18C22 19.1 21.1 20 20 20H4C2.9 20 2 19.1 2 18V6C2 4.9 2.9 4 4 4Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
            <path d="M22 6L12 13L2 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
          </svg>
        </div>
      </div>

      <!-- Numéro de téléphone -->
      <div class="flex flex-col gap-2">
        <label class="text-base text-[#1c1c1c] leading-6 font-roboto">Numéro de téléphone *</label>
        <div class="relative">
          <input
            :value="data.phone"
            type="tel"
            placeholder="Numéro de téléphone"
            class="w-full bg-[#f7f7f7] border-2 border-[#e5e7eb] rounded-lg h-12 pl-12 pr-3 text-sm text-[#1c1c1c] placeholder-[#545454] font-roboto focus:outline-none focus:border-[#ef781e]"
            @input="emit('update', 'phone', ($event.target as HTMLInputElement).value)"
          >
          <svg
            class="absolute left-4 top-1/2 -translate-y-1/2 text-[#545454]"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path d="M22 16.92V19.92C22.0011 20.1985 21.9441 20.4742 21.8325 20.7294C21.7209 20.9845 21.5573 21.2136 21.3521 21.4019C21.1469 21.5901 20.9046 21.7335 20.6408 21.8227C20.3769 21.9119 20.0974 21.9451 19.82 21.92C16.7428 21.5856 13.787 20.5341 11.19 18.85C8.77383 17.3147 6.72534 15.2662 5.19 12.85C3.49998 10.2412 2.44824 7.27097 2.12 4.18C2.09501 3.90344 2.12788 3.62476 2.2165 3.36162C2.30513 3.09849 2.44757 2.85668 2.63477 2.65162C2.82196 2.44656 3.04981 2.28271 3.30379 2.17052C3.55778 2.05833 3.83234 2.00026 4.11 2H7.11C7.59531 1.99522 8.06579 2.16708 8.43376 2.48353C8.80173 2.79999 9.04208 3.23945 9.11 3.72C9.23662 4.68006 9.47145 5.62272 9.81 6.53C9.94455 6.88792 9.97366 7.27691 9.89391 7.65088C9.81415 8.02485 9.62886 8.36811 9.36 8.64L8.09 9.91C9.51356 12.4135 11.5865 14.4864 14.09 15.91L15.36 14.64C15.6319 14.3711 15.9752 14.1858 16.3491 14.1061C16.7231 14.0263 17.1121 14.0555 17.47 14.19C18.3773 14.5286 19.3199 14.7634 20.28 14.89C20.7658 14.9585 21.2094 15.2032 21.5265 15.5775C21.8437 15.9518 22.0122 16.4296 22 16.92Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
          </svg>
        </div>
      </div>

      <!-- Mot de passe -->
      <div class="flex flex-col gap-2">
        <label class="text-base text-[#1c1c1c] leading-6 font-roboto">Mot de passe *</label>
        <div class="relative">
          <input
            :value="data.password"
            type="password"
            placeholder="Mot de passe"
            class="w-full bg-[#f7f7f7] border-2 border-[#e5e7eb] rounded-lg h-12 pl-12 pr-3 text-sm text-[#1c1c1c] placeholder-[#545454] font-roboto focus:outline-none focus:border-[#ef781e]"
            @input="emit('update', 'password', ($event.target as HTMLInputElement).value)"
          >
          <svg
            class="absolute left-4 top-1/2 -translate-y-1/2 text-[#545454]"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <rect
              x="3"
              y="11"
              width="18"
              height="11"
              rx="2"
              ry="2"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
            <path d="M7 11V7C7 5.67392 7.52678 4.40215 8.46447 3.46447C9.40215 2.52678 10.6739 2 12 2C13.3261 2 14.5979 2.52678 15.5355 3.46447C16.4732 4.40215 17 5.67392 17 7V11" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
          </svg>
        </div>
      </div>

      <!-- Confirmation du mot de passe -->
      <div class="flex flex-col gap-2">
        <label class="text-base text-[#1c1c1c] leading-6 font-roboto">Confirmation du mot de passe *</label>
        <div class="relative">
          <input
            :value="data.confirmPassword"
            type="password"
            placeholder="Confirmation du mot de passe"
            class="w-full bg-[#f7f7f7] border-2 border-[#e5e7eb] rounded-lg h-12 pl-12 pr-3 text-sm text-[#1c1c1c] placeholder-[#545454] font-roboto focus:outline-none focus:border-[#ef781e]"
            @input="emit('update', 'confirmPassword', ($event.target as HTMLInputElement).value)"
          >
          <svg
            class="absolute left-4 top-1/2 -translate-y-1/2 text-[#545454]"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <rect
              x="3"
              y="11"
              width="18"
              height="11"
              rx="2"
              ry="2"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
            <path d="M7 11V7C7 5.67392 7.52678 4.40215 8.46447 3.46447C9.40215 2.52678 10.6739 2 12 2C13.3261 2 14.5979 2.52678 15.5355 3.46447C16.4732 4.40215 17 5.67392 17 7V11" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
          </svg>
        </div>
        <p class="text-xs text-[#545454] leading-4 font-roboto">
          Cela doit être une combinaison d'au moins 8 lettres, chiffres et symboles.
        </p>
      </div>
    </div>

    <!-- Bouton Continuer -->
    <UButton
      block
      :disabled="!isFormValid || isLoading"
      :loading="isLoading"
      class="bg-tango-500! hover:bg-tango-600! text-white! font-semibold! font-montserrat! text-base! rounded-[50px]! py-3! disabled:opacity-50! disabled:cursor-not-allowed!"
      @click="handleSubmit"
    >
      Continuer
    </UButton>
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
