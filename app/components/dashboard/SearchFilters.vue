<script setup lang="ts">
const props = withDefaults(defineProps<{
  searchQuery: string
  showFavoritesOnly: boolean
  selectedDistance: string
  selectedCategory: string
  distances?: string[]
  categories?: string[]
}>(), {
  distances: () => [],
  categories: () => []
})

const emit = defineEmits<{
  'update:searchQuery': [value: string]
  'update:showFavoritesOnly': [value: boolean]
  'update:selectedDistance': [value: string]
  'update:selectedCategory': [value: string]
}>()

const searchQueryModel = computed({
  get: () => props.searchQuery,
  set: (value: string) => emit('update:searchQuery', value)
})

const showFavoritesOnlyModel = computed({
  get: () => props.showFavoritesOnly,
  set: (value: boolean) => emit('update:showFavoritesOnly', value)
})

const selectedDistanceModel = computed({
  get: () => props.selectedDistance,
  set: (value: string) => emit('update:selectedDistance', value)
})

const ALL_CATEGORIES_VALUE = '__all__'

const selectedCategoryModel = computed({
  get: () => props.selectedCategory || ALL_CATEGORIES_VALUE,
  set: (value: string) => emit('update:selectedCategory', value === ALL_CATEGORIES_VALUE ? '' : value)
})

const categoryItems = computed(() => [
  { label: 'Toutes', value: ALL_CATEGORIES_VALUE },
  ...props.categories.map(cat => ({ label: cat, value: cat }))
])

const categoryDisplayLabel = computed(() => {
  if (!props.selectedCategory) return 'Catégories'
  return props.selectedCategory
})

function toggleFavorites() {
  showFavoritesOnlyModel.value = !showFavoritesOnlyModel.value
}
</script>

<template>
  <div class="bg-white px-4 py-4 flex flex-col gap-3">
    <!-- Search bar -->
    <UInput
      v-model="searchQueryModel"
      placeholder="Rechercher des clubs, activités"
      icon="i-lucide-search"
      trailing
      size="xl"
      variant="outline"
      :ui="{
        root: 'w-full',
        base: 'rounded-xl! h-12',
        trailingIcon: 'text-tango-500'
      }"
    />

    <!-- Filter buttons -->
    <div class="flex items-center gap-2">
      <!-- Favorites toggle -->
      <UButton
        variant="outline"
        color="neutral"
        size="lg"
        square
        :icon="showFavoritesOnlyModel ? 'i-lucide-heart' : 'i-lucide-heart'"
        :class="showFavoritesOnlyModel ? 'border-tango-500 bg-tango-500/10 text-tango-500' : 'border-[#d6d6d6] text-[#545454]'"
        class="rounded-full! shrink-0"
        :ui="{
          base: 'rounded-full',
          leadingIcon: showFavoritesOnlyModel ? 'fill-tango-500 text-tango-500' : ''
        }"
        @click="toggleFavorites"
      />

      <!-- Distance dropdown -->
      <USelect
        v-model="selectedDistanceModel"
        :items="distances"
        icon="i-lucide-map-pin"
        size="md"
        variant="outline"
        color="neutral"
        class="shrink-0"
        :ui="{
          base: 'rounded-full! border-[#d6d6d6] h-10',
          leadingIcon: 'text-[#545454]',
          trailingIcon: 'text-[#545454]'
        }"
      >
        <template #default="{ modelValue }">
          <span class="text-sm text-[#1c1c1c] whitespace-nowrap">Rayon | {{ modelValue }}</span>
        </template>
      </USelect>

      <!-- Categories dropdown -->
      <USelect
        v-model="selectedCategoryModel"
        :items="categoryItems"
        value-key="value"
        icon="i-lucide-sliders-horizontal"
        size="md"
        variant="outline"
        color="neutral"
        class="shrink-0"
        :ui="{
          base: 'rounded-full! border-[#d6d6d6] h-10',
          leadingIcon: 'text-[#545454]',
          trailingIcon: 'text-[#545454]'
        }"
      >
        <template #default>
          <span class="text-sm text-[#1c1c1c]">{{ categoryDisplayLabel }}</span>
        </template>
      </USelect>
    </div>
  </div>
</template>
