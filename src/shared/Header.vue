<script setup lang="ts">
import { RouterLink } from 'vue-router'

const routes = [
  {
    name: 'GENERATOR',
    path: '/',
  },
  {
    name: 'PROFILE',
    path: '/profile',
  },
]
</script>

<template>
  <header class="header">
    <RouterLink class="logo" to="/">PLATE.</RouterLink>
    <nav class="links">
      <RouterLink
        v-for="route in routes"
        :key="route.path"
        :to="route.path"
        active-class="link-active"
      >
        {{ route.name }}
      </RouterLink>
    </nav>
  </header>
</template>

<style scoped>
.header {
  display: flex;
  justify-content: space-between;
  height: 66px;
  align-items: center;
  border-bottom: 1px solid #e0e0e0;
}
.logo {
  font-size: 24px;
  font-weight: var(--font__extra-bold);
  letter-spacing: -1px;
}
.links {
  display: flex;
  gap: 28px;
  align-items: center;
}

.links a {
  font-size: 12px;
  color: var(--color__muted);
  letter-spacing: 1px;
  font-weight: var(--font__normal);
}
.links a.link-active {
  color: var(--color__primary);
}
@media (max-width: 768px) {
  .header {
    height: 64px;
  }
  .logo {
    font-size: 22px;
  }
  .links {
    gap: 16px;
  }
  .logo,
  .links a {
    display: inline-flex;
    min-height: 44px;
    align-items: center;
  }
  .links a {
    font-size: 10px;
  }
}
</style>
