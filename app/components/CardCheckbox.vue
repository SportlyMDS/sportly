<template>
  <UCheckbox
    :model-value="modelValue"
    variant="card"
    size="xl"
    indicator="end"
    :ui="{
      root: 'w-full rounded-3xl border-2 p-6 transition-all ' + (modelValue ? 'bg-[#fff9f4] border-primary' : 'bg-white border-muted hover:border-gray-300'),
      base: 'size-6 rounded-full',
      indicator: 'rounded-full',
      wrapper: 'flex-1',
      label: 'text-lg font-semibold text-default',
      description: 'text-sm text-muted mt-2'
    }"
    @update:model-value="$emit('update:modelValue', $event)"
  >
    <template #label>
      <div class="flex gap-4 items-start">
        <!-- Icon container -->
        <div
          class="shrink-0 size-16 rounded-2xl flex items-center justify-center"
          :class="modelValue ? 'bg-tango-100' : 'bg-gray-100'"
        >
          <UIcon :name="icon" class="size-8 text-gray-600" />
        </div>

        <!-- Content -->
        <div class="flex-1 min-w-0">
          <h3 class="text-lg font-semibold text-gray-900">
            {{ title }}
          </h3>
          <p class="mt-2 text-sm text-gray-500 leading-5">
            {{ description }}
          </p>
        </div>
      </div>
    </template>
  </UCheckbox>
</template>

<script setup lang="ts">
defineProps<{
  modelValue: boolean
  title: string
  description: string
  icon: string
}>()

defineEmits<{
  'update:modelValue': [value: boolean | 'indeterminate']
}>()
</script>
