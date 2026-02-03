<script setup lang="ts">
defineProps<{
  emoji: string
  label: string
  selected: boolean
}>()

const emit = defineEmits<{
  toggle: []
}>()
</script>

<template>
  <button
    type="button"
    class="bg-[#f7f7f7] border-2 border-solid rounded-xl p-4 flex items-center justify-center gap-2 transition-all duration-200 text-left h-[68px]"
    :class="selected ? 'border-tango-500 bg-white' : 'border-[#d6d6d6] hover:border-gray-300'"
    @click="emit('toggle')"
  >
    <span class="text-[28px] leading-none shrink-0">{{ emoji }}</span>
    <span class="text-sm leading-5 text-[#1c1c1c] font-roboto">{{ label }}</span>
  </button>
</template>

<style scoped>
.font-roboto {
  font-family: 'Roboto', sans-serif;
}
</style>
