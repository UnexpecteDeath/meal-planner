<script setup lang="ts">
import Banner from '../components/Banner.vue'
import SignInForm from '@/modules/auth/components/SignInForm.vue'
</script>

<template>
  <div class="auth-page">
    <Banner class="auth-banner" type="SignIn" />
    <SignInForm />
  </div>
</template>

<style scoped>
.auth-page {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
  min-height: 100svh;
}

@media (max-width: 1279px) {
  .auth-page {
    display: block;
  }

  .auth-banner {
    display: none;
  }
}
</style>
