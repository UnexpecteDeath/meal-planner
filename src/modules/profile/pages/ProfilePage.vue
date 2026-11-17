<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { RouterLink } from 'vue-router'
import { useAuth } from '@/modules/auth'
import MealHistory from '../components/MealHistory.vue'
import ProfileCard from '../components/ProfileCard.vue'
import { useProfile, type Profile } from '../hooks/useProfile'

const profile = ref<Profile | null>(null)
const userId = ref<string>()
const isLoading = ref(true)
const hasError = ref(false)

onMounted(async () => {
  try {
    const { userId: id } = await useAuth()
    if (!id) return

    userId.value = id
    profile.value = await useProfile(id)
  } catch {
    hasError.value = true
  } finally {
    isLoading.value = false
  }
})
</script>

<template>
  <div class="profile_page">
    <div class="profile-heading">
      <h1 class="title">YOUR <span>PROFILE.</span></h1>
      <p class="subtitle">Your preferences. Your meals.</p>
    </div>
    <div class="info">
      <div class="info_title_container">
        <p class="number">01</p>
        <p class="info_title">ACCOUNT<span class="info-title-extra"> INFORMATION</span></p>
      </div>
      <p v-if="isLoading" class="profile-status" role="status">Loading profile…</p>
      <p v-else-if="hasError" class="profile-status" role="alert">Could not load your profile.</p>
      <ProfileCard v-else-if="profile" :profile="profile" />
      <p v-else class="profile-status">
        Profile not found.
        <RouterLink :to="{ name: 'profile-edit' }">Set up your profile</RouterLink>
      </p>
    </div>
    <MealHistory v-if="userId" :user-id="userId" />
  </div>
</template>

<style scoped>
.title {
  font-size: 78px;
  font-weight: var(--font__extra-bold);
  padding: 75px 0;
  letter-spacing: -3.5px;
}

.subtitle {
  display: none;
}

.info {
  display: flex;
  flex-direction: column;
  border-top: 1px solid #e0e0e0;
  border-bottom: 1px solid #e0e0e0;
}

.info_title_container {
  padding: 28px 0 20px 0;
  display: flex;
  gap: 18px;
  align-items: center;
}

.number {
  font-size: 11px;
  font-weight: var(--font__bold);
  color: var(--color__muted);
}
.info_title {
  font-size: 14px;
  font-weight: var(--font__extra-bold);
  letter-spacing: 0.8px;
}

.profile-status {
  padding-bottom: 32px;
  color: var(--color__muted);
}

.profile-status a {
  color: var(--color__primary);
  text-decoration: underline;
}

.profile-status a:focus-visible {
  outline: 2px solid var(--color__primary);
  outline-offset: 3px;
}

@media (max-width: 1279px) {
  .profile-heading {
    padding-block: 48px 40px;
    border-top: 1px solid #e0e0e0;
  }

  .title {
    padding: 0;
    font-size: 56px;
    line-height: 0.92;
    letter-spacing: -2.5px;
  }

  .title span {
    display: block;
  }

  .subtitle {
    display: block;
    margin-top: 16px;
    color: var(--color__muted);
    font-size: 18px;
    line-height: 1.4;
  }

  .info_title_container {
    gap: 24px;
    padding-block: 36px 24px;
  }

  .number {
    font-size: 14px;
  }

  .info_title {
    font-size: 18px;
  }

  .info-title-extra {
    display: none;
  }
}

@media (max-width: 767px) {
  .profile-heading {
    padding-block: 40px 32px;
  }

  .title {
    font-size: 44px;
    letter-spacing: -2px;
  }

  .subtitle {
    margin-top: 12px;
    font-size: 16px;
  }

  .info_title_container {
    gap: 18px;
    padding-block: 28px 20px;
  }

  .number {
    font-size: 11px;
  }

  .info_title {
    font-size: 14px;
  }

  .profile-status {
    padding-bottom: 28px;
  }
}
</style>
