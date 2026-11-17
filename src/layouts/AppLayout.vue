<script setup lang="ts">
import { RouterView } from 'vue-router'
import { Header } from '@/shared'
</script>

<template>
  <div class="app-layout">
    <Header />
    <RouterView />
  </div>
</template>

<style scoped>
.app-layout {
  padding: 0 80px;
}

@media (max-width: 768px) {
  .app-layout {
    padding: 0 25px;
  }
}

@media (min-width: 768px) and (max-width: 1279px) {
  .app-layout:has(> :is(.profile_page, .profile-edit, .generator-page)) {
    padding-inline: 40px;
  }
}

@media (max-width: 400px) {
  .app-layout {
    padding: 0 20px;
  }
}
</style>
