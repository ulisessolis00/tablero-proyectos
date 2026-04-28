<template>
  <RouterView v-if="route.meta.ocultarAppShell" />

  <AppShell v-else>
    <RouterView />
  </AppShell>
</template>

<script setup>
import { useRoute } from 'vue-router'
import AppShell from './components/layout/AppShell.vue'

const route = useRoute()
</script>
