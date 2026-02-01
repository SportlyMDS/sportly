<script setup lang="ts">
import type { InscriptionParticulierData } from '~/composables/useInscription'

const props = defineProps<{
  data: InscriptionParticulierData
  isLoading: boolean
}>()

const emit = defineEmits<{
  update: [key: keyof InscriptionParticulierData, value: any]
  next: []
  resend: []
}>()

const otpValue = ref<number[]>(props.data.verificationCode ? props.data.verificationCode.split('').map(Number) : [])
const resendCountdown = ref(0)

let countdownInterval: ReturnType<typeof setInterval> | null = null

watch(otpValue, (newVal) => {
  emit('update', 'verificationCode', newVal.join(''))
}, { deep: true })

const handleResend = () => {
  emit('resend')
  resendCountdown.value = 60
  countdownInterval = setInterval(() => {
    resendCountdown.value--
    if (resendCountdown.value <= 0) {
      if (countdownInterval) clearInterval(countdownInterval)
    }
  }, 1000)
}

const onSubmit = () => {
  if (otpValue.value.length === 6) {
    emit('next')
  }
}

onUnmounted(() => {
  if (countdownInterval) clearInterval(countdownInterval)
})
</script>

<template>
  <div class="flex flex-col flex-1 min-h-0">
    <!-- Contenu principal centré -->
    <div class="flex flex-col items-center gap-4">
      <!-- Icône email -->
      <div class="w-20 h-20 bg-[#ffedd4] rounded-full flex items-center justify-center">
        <UIcon name="i-heroicons-envelope" class="w-10 h-10 text-tango-500" />
      </div>

      <!-- Titre et sous-titre -->
      <div class="text-center space-y-2">
        <h2 class="text-[30px] font-semibold text-black leading-[45px] font-[Asap]">
          Vérifiez votre e-mail
        </h2>
        <p class="text-base text-[#4a5565] leading-6">
          Nous avons envoyé un code de vérification à
        </p>
        <p class="text-base text-black">
          {{ data.email }}
        </p>
      </div>

      <!-- Code OTP -->
      <div class="flex justify-center w-full">
        <UPinInput
          v-model="otpValue"
          otp
          type="number"
          :length="6"
          size="xl"
          :disabled="isLoading"
          :ui="{
            base: 'w-12 h-14 rounded-2xl border-2 border-[#e5e7eb] bg-white text-black text-center focus:border-tango-500 focus:ring-0'
          }"
          @complete="onSubmit"
        />
      </div>

      <!-- Renvoyer le code -->
      <div class="text-center text-sm text-[#4a5565]">
        Vous n'avez pas reçu le code ?
        <button
          v-if="resendCountdown === 0"
          type="button"
          class="text-tango-500 font-bold underline hover:no-underline"
          :disabled="isLoading"
          @click="handleResend"
        >
          Renvoyer
        </button>
        <span v-else class="text-gray-400">
          Renvoyer ({{ resendCountdown }}s)
        </span>
      </div>
    </div>

    <!-- Spacer flexible -->
    <div class="flex-1" />

    <!-- Section basse avec alerte et bouton -->
    <div class="flex flex-col gap-8">
      <!-- Alerte spam -->
      <UAlert
        title="💌 Pensez à vérifier vos spams si vous ne voyez pas l'e-mail"
        color="info"
        variant="outline"
        :ui="{
          root: 'bg-[#eff6ff] border-2 border-[#dbeafe] rounded-2xl px-[18px] py-[18px]',
          title: 'text-[#1447e6] text-sm font-normal leading-5'
        }"
      />

      <!-- Bouton Continuer -->
      <UButton
        block
        size="lg"
        :loading="isLoading"
        :disabled="isLoading || otpValue.length !== 6"
        :class="[
          'rounded-full py-2.5 font-semibold',
          otpValue.length === 6 ? 'bg-tango-500 hover:bg-tango-600 text-white' : 'bg-[#d5d7da] text-[#212121] cursor-not-allowed'
        ]"
        @click="onSubmit"
      >
        Continuer
      </UButton>
    </div>
  </div>
</template>
