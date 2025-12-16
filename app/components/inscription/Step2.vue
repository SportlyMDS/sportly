<template>
  <div class="space-y-8">
    <!-- Icône email -->
    <div class="flex justify-center">
      <div class="w-20 h-20 bg-tango-50 rounded-full flex items-center justify-center">
        <UIcon name="i-heroicons-envelope" class="w-10 h-10 text-tango-500" />
      </div>
    </div>

    <!-- Titre et sous-titre -->
    <div class="text-center">
      <h2 class="text-2xl font-semibold text-gray-900">
        Vérifiez votre e-mail
      </h2>
      <p class="mt-2 text-sm text-gray-500">
        Nous avons envoyé un code de vérification à
      </p>
      <p class="text-sm font-medium text-gray-700">
        {{ data.email }}
      </p>
    </div>

    <!-- Code OTP -->
    <div class="flex justify-center">
      <UPinInput
        v-model="otpValue"
        otp
        type="number"
        :length="6"
        size="xl"
        :disabled="isLoading"
        :ui="{
          base: 'rounded-lg text-black bg-gray-50 ring-1 ring-gray-200 focus:ring-2 focus:ring-tango-500'
        }"
      />
    </div>

    <!-- Renvoyer le code -->
    <div class="text-center text-sm text-gray-500">
      Vous n'avez pas reçu le code ?
      <button
        v-if="resendCountdown === 0"
        type="button"
        class="text-tango-500 font-medium hover:underline"
        :disabled="isLoading"
        @click="handleResend"
      >
        Renvoyer
      </button>
      <span v-else class="text-gray-400">
        Renvoyer ({{ resendCountdown }}s)
      </span>
    </div>

    <!-- Alerte spam -->
    <UAlert
      icon="i-heroicons-envelope"
      color="warning"
      variant="soft"
      title="Pensez à vérifier vos spams si vous ne voyez pas l'e-mail"
      :ui="{
        root: 'bg-tango-50 border-0',
        icon: 'text-tango-500',
        title: 'text-tango-700 text-sm font-normal'
      }"
    />

    <!-- Bouton Continuer -->
    <UButton
      block
      size="lg"
      :loading="isLoading"
      :disabled="isLoading || otpValue.length !== 6"
      :class="otpValue.length === 6 ? 'bg-tango-500 hover:bg-tango-600' : 'bg-gray-200 text-gray-500'"
      @click="onSubmit"
    >
      Continuer
    </UButton>
  </div>
</template>

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
