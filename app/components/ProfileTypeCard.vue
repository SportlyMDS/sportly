<script setup lang="ts">
defineProps<{
  modelValue: boolean
  icon: string
  title: string
  description: string
}>()

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
}>()

function handleClick() {
  emit('update:modelValue', true)
}
</script>

<template>
  <div
    class="profile-type-card cursor-pointer w-full bg-white border-2 border-solid rounded-[24px] p-6 transition-all duration-200"
    :class="modelValue ? 'border-[#ef781e] shadow-md' : 'border-[#e5e7eb] hover:border-gray-300'"
    @click="handleClick"
  >
    <div class="flex gap-4 items-start">
      <!-- Icône -->
      <div class="bg-[#f3f4f6] rounded-2xl size-16 flex items-center justify-center shrink-0">
        <UIcon :name="icon" class="size-8 text-[#6B7280]" />
      </div>

      <!-- Contenu -->
      <div class="flex-1 flex flex-col gap-2">
        <h3 class="font-medium text-lg text-black tracking-tight leading-7 font-inter">
          {{ title }}
        </h3>
        <p class="text-sm text-[#4a5565] leading-5 tracking-tight font-inter">
          {{ description }}
        </p>
      </div>

      <!-- Checkmark quand sélectionné -->
      <div
        v-if="modelValue"
        class="shrink-0 size-6 rounded-full bg-[#ef781e] flex items-center justify-center"
      >
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M11.6666 3.5L5.24992 9.91667L2.33325 7" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
        </svg>
      </div>
    </div>
  </div>
</template>

<style scoped>
.font-inter {
  font-family: 'Inter', sans-serif;
}
</style>
