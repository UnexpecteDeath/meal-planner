<script lang="ts" setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { Button } from '@/shared'
import type { Profile } from '../hooks/useProfile'

const { profile } = defineProps<{ profile: Profile }>()
const router = useRouter()

const initials = computed(() => {
  const names = profile.name?.trim().split(/\s+/) ?? []
  const letters = names
    .slice(0, 2)
    .map((name) => name.charAt(0))
    .join('')

  return letters.toUpperCase() || '—'
})

const createdAt = computed(() => {
  if (!profile.created_at) return ''
  return new Date(profile.created_at).toLocaleDateString('en-US', { dateStyle: 'medium' })
})
</script>

<template>
  <div class="container">
    <div class="identity">
      <img v-if="profile.avatar_url" class="avatar" :src="profile.avatar_url" alt="" />
      <div v-else class="avatar" aria-hidden="true">{{ initials }}</div>
      <div class="info">
        <p class="name">{{ profile.name || 'Unnamed user' }}</p>
        <time v-if="profile.created_at" class="date" :datetime="profile.created_at">
          {{ createdAt }}
        </time>
      </div>
    </div>
    <Button class="edit-button" variant="outline" @click="router.push({ name: 'profile-edit' })">
      EDIT PROFILE
    </Button>
  </div>
</template>

<style scoped>
.container {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
  padding-bottom: 32px;
}

.identity {
  display: flex;
  flex: 1 1 200px;
  align-items: center;
  gap: 20px;
  min-width: 0;
}

.avatar {
  display: grid;
  place-items: center;
  flex-shrink: 0;
  width: 76px;
  height: 76px;
  object-fit: cover;
  background-color: var(--bg__secondary);
  color: var(--color__secondary);
  font-size: 20px;
}

.info {
  display: grid;
  gap: 6px;
  min-width: 0;
  overflow-wrap: anywhere;
}

.name {
  color: var(--color__primary);
  font-size: 22px;
  line-height: 1.2;
}

.date {
  color: var(--color__muted);
  font-size: 14px;
  line-height: 1.4;
}

.container .edit-button {
  min-width: 136px;
  min-height: 46px;
  font-weight: var(--font__bold);
}

@media (max-width: 1279px) {
  .container {
    flex-flow: column nowrap;
    align-items: stretch;
    gap: 22px;
    padding-bottom: 34px;
  }

  .identity {
    flex: none;
    gap: 18px;
  }

  .avatar {
    font-weight: var(--font__bold);
  }

  .container .edit-button {
    width: 100%;
    min-height: 60px;
    font-size: 16px;
  }
}

@media (max-width: 767px) {
  .container {
    gap: 18px;
    padding-bottom: 28px;
  }

  .identity {
    gap: 14px;
  }

  .avatar {
    width: 60px;
    height: 60px;
    font-size: 16px;
  }

  .info {
    gap: 4px;
  }

  .name {
    font-size: 18px;
  }

  .container .edit-button {
    min-height: 48px;
    font-size: 14px;
  }
}
</style>
