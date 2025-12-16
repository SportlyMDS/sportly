<template>
  <div class="space-y-6">
    <!-- Titre et sous-titre -->
    <div>
      <h2 class="text-2xl font-bold text-gray-900">
        Zone de recherche
      </h2>
      <p class="mt-1 text-sm text-gray-500">
        Définissez le rayon de recherche autour de votre position
      </p>
    </div>

    <!-- Carte Leaflet -->
    <div class="relative rounded-xl overflow-hidden border border-gray-200">
      <ClientOnly>
        <LMap
          ref="mapRef"
          :zoom="mapZoom"
          :center="mapCenter"
          :use-global-leaflet="false"
          style="height: 280px; width: 100%;"
          @click="handleMapClick"
        >
          <LTileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution="&copy; <a href='https://www.openstreetmap.org/'>OpenStreetMap</a> contributors"
            layer-type="base"
            name="OpenStreetMap"
          />
          <LMarker
            v-if="formState.latitude && formState.longitude"
            :lat-lng="[formState.latitude, formState.longitude]"
          />
          <LCircle
            v-if="formState.latitude && formState.longitude"
            :lat-lng="[formState.latitude, formState.longitude]"
            :radius="formState.searchRadius * 1000"
            color="#f97316"
            :fill-opacity="0.15"
            :weight="2"
          />
        </LMap>
        <template #fallback>
          <div class="h-[280px] bg-gray-100 flex items-center justify-center">
            <UIcon name="i-heroicons-map" class="w-12 h-12 text-gray-400" />
          </div>
        </template>
      </ClientOnly>

      <!-- Radius label overlay -->
      <div
        v-if="formState.latitude && formState.longitude"
        class="absolute top-4 left-1/2 -translate-x-1/2 z-[1000] bg-white rounded-lg px-3 py-1 shadow-md"
      >
        <p class="text-tango-500 font-semibold text-sm">
          {{ formState.searchRadius }} km
        </p>
        <p class="text-gray-500 text-xs text-center">
          de rayon
        </p>
      </div>

      <!-- Locate button -->
      <button
        type="button"
        class="absolute bottom-4 right-4 z-[1000] w-10 h-10 bg-white rounded-full shadow-md flex items-center justify-center hover:bg-gray-50 transition-colors"
        :disabled="isLocating"
        @click="requestGeolocation"
      >
        <UIcon
          :name="isLocating ? 'i-heroicons-arrow-path' : 'i-heroicons-paper-airplane'"
          :class="[
            'w-5 h-5 text-gray-600',
            isLocating ? 'animate-spin' : 'rotate-45'
          ]"
        />
      </button>
    </div>

    <!-- Slider pour le rayon -->
    <div>
      <div class="flex items-center gap-4">
        <input
          v-model.number="formState.searchRadius"
          type="range"
          min="1"
          max="50"
          class="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-tango-500"
        >
        <span class="text-sm font-medium text-gray-900 min-w-[60px] text-right">
          {{ formState.searchRadius }} km
        </span>
      </div>
    </div>

    <!-- Champ d'adresse -->
    <div>
      <label class="block text-sm font-medium text-gray-700 mb-2">Localisation</label>
      <div class="relative">
        <UInput
          v-model="formState.address"
          placeholder="Adresse"
          icon="i-heroicons-map-pin"
          size="lg"
          :disabled="isLoading"
          :ui="{
            base: 'rounded-lg bg-gray-50 text-gray-900'
          }"
          @keyup.enter="searchAddress"
        />
        <button
          type="button"
          class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-tango-500 transition-colors"
          :disabled="isLocating"
          @click="requestGeolocation"
        >
          <UIcon
            :name="isLocating ? 'i-heroicons-arrow-path' : 'i-heroicons-map-pin'"
            :class="['w-5 h-5', isLocating ? 'animate-spin' : '']"
          />
        </button>
      </div>
    </div>

    <!-- Bouton Continuer -->
    <UButton
      block
      size="lg"
      :loading="isLoading"
      :disabled="isLoading || !formState.latitude || !formState.longitude"
      :class="formState.latitude && formState.longitude ? 'bg-tango-500 hover:bg-tango-600' : 'bg-gray-200 text-gray-500'"
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
  submit: []
}>()

// Lille center as fallback
const LILLE_CENTER: [number, number] = [50.6292, 3.0573]

const mapRef = ref()
const mapZoom = ref(13)
const mapCenter = ref<[number, number]>(LILLE_CENTER)
const isLocating = ref(false)

const formState = reactive({
  address: props.data.address,
  latitude: props.data.latitude,
  longitude: props.data.longitude,
  searchRadius: props.data.searchRadius || 5
})

// Watcher pour synchroniser les données avec le parent
watch(formState, (newVal) => {
  emit('update', 'address', newVal.address)
  emit('update', 'latitude', newVal.latitude)
  emit('update', 'longitude', newVal.longitude)
  emit('update', 'searchRadius', newVal.searchRadius)
}, { deep: true })

// Request geolocation with permission
const requestGeolocation = async () => {
  if (!navigator.geolocation) {
    console.warn('Geolocation not supported, using Lille fallback')
    setLocationToLille()
    return
  }

  isLocating.value = true

  navigator.geolocation.getCurrentPosition(
    async (position) => {
      const { latitude, longitude } = position.coords
      formState.latitude = latitude
      formState.longitude = longitude
      mapCenter.value = [latitude, longitude]
      mapZoom.value = 14

      // Reverse geocoding pour obtenir l'adresse
      await reverseGeocode(latitude, longitude)
      isLocating.value = false
    },
    (error) => {
      console.warn('Geolocation denied or error:', error.message)
      setLocationToLille()
      isLocating.value = false
    },
    {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 0
    }
  )
}

// Fallback to Lille center
const setLocationToLille = async () => {
  formState.latitude = LILLE_CENTER[0]
  formState.longitude = LILLE_CENTER[1]
  mapCenter.value = LILLE_CENTER
  mapZoom.value = 13
  await reverseGeocode(LILLE_CENTER[0], LILLE_CENTER[1])
}

// Reverse geocoding helper
const reverseGeocode = async (lat: number, lng: number) => {
  try {
    const response = await $fetch<any>('https://nominatim.openstreetmap.org/reverse', {
      params: {
        lat,
        lon: lng,
        format: 'json'
      }
    })

    if (response && response.display_name) {
      formState.address = response.display_name
    }
  } catch (error) {
    console.error('Erreur de reverse geocoding:', error)
  }
}

// Géocodage de l'adresse via Nominatim (OpenStreetMap)
const searchAddress = async () => {
  if (!formState.address || formState.address.length < 3) return

  try {
    const response = await $fetch<any[]>('https://nominatim.openstreetmap.org/search', {
      params: {
        q: formState.address,
        format: 'json',
        limit: 1
      }
    })

    if (response && response.length > 0) {
      const result = response[0]
      formState.latitude = Number.parseFloat(result.lat)
      formState.longitude = Number.parseFloat(result.lon)
      formState.address = result.display_name

      // Centrer la carte sur le résultat
      mapCenter.value = [formState.latitude, formState.longitude]
      mapZoom.value = 14
    }
  } catch (error) {
    console.error('Erreur de géocodage:', error)
  }
}

// Gérer le clic sur la carte
const handleMapClick = async (event: any) => {
  const { lat, lng } = event.latlng
  formState.latitude = lat
  formState.longitude = lng
  await reverseGeocode(lat, lng)
}

const onSubmit = () => {
  emit('submit')
}

// Request geolocation on mount
onMounted(() => {
  if (!formState.latitude || !formState.longitude) {
    requestGeolocation()
  } else {
    mapCenter.value = [formState.latitude, formState.longitude]
  }
})
</script>
