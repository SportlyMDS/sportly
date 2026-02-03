<script setup lang="ts">
defineProps<{
  selected: boolean
  title: string
  price: string
  priceLabel?: string
  description: string
  features: string[]
  popular?: boolean
  iconBgClass?: string
}>()

const emit = defineEmits<{
  select: []
}>()
</script>

<template>
  <button
    type="button"
    class="w-full text-left !rounded-[12px] p-6 border-2 transition-all duration-200 relative mt-4"
    :class="[
      selected
        ? 'border-[#ef781e] bg-[rgba(224,95,22,0.05)]'
        : 'border-[#d6d6d6] bg-[#f7f7f7] hover:border-gray-400'
    ]"
    @click="emit('select')"
  >
    <!-- Badge Populaire -->
    <div
      v-if="popular"
      class="absolute -top-3 left-4 bg-[#ef781e] text-white text-xs font-medium px-3 py-1 rounded-full"
    >
      Populaire
    </div>

    <!-- Header -->
    <div class="flex items-start justify-between mb-4">
      <div class="flex items-center gap-3">
        <!-- Icon -->
        <div
          class="w-14 h-14 rounded-xl flex items-center justify-center"
          :class="iconBgClass || 'bg-[#f4e1d7]'"
        >
          <slot name="icon" />
        </div>
        <!-- Title & Price -->
        <div>
          <h3 class="text-xl font-semibold text-[#1c1c1c] font-asap">
            {{ title }}
          </h3>
          <div class="flex items-baseline gap-1">
            <span class="text-2xl font-bold text-[#1c1c1c] font-asap">{{ price }}</span>
            <span
              v-if="priceLabel"
              class="text-sm text-[#545454] font-roboto"
            >{{ priceLabel }}</span>
          </div>
        </div>
      </div>
      <!-- Radio -->
      <div
        class="w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0"
        :class="selected ? 'border-[#ef781e]' : 'border-[#d6d6d6]'"
      >
        <div
          v-if="selected"
          class="w-3 h-3 rounded-full bg-[#ef781e]"
        />
      </div>
    </div>

    <!-- Description -->
    <p class="text-sm text-[#545454] leading-5 mb-4 font-roboto">
      {{ description }}
    </p>

    <!-- Features -->
    <div class="flex flex-col gap-2">
      <div
        v-for="(feature, index) in features"
        :key="index"
        class="flex items-center gap-2"
      >
        <svg
          class="w-4 h-4 text-[#ef781e] shrink-0"
          viewBox="0 0 16 16"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M13.3334 4L6.00008 11.3333L2.66675 8"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
        </svg>
        <span class="text-sm text-[#1c1c1c] font-roboto">{{ feature }}</span>
      </div>
    </div>
  </button>
</template>

<style scoped>
.font-asap {
  font-family: 'Asap', sans-serif;
}

.font-roboto {
  font-family: 'Roboto', sans-serif;
}
</style>
