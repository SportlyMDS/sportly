<script setup lang="ts">
definePageMeta({
  layout: false,
  middleware: 'auth'
})
</script>

<template>
  <EventsEventCreateForm />
</template>
