<script setup lang="ts">
import { ref } from 'vue'
import { RouterView } from 'vue-router'
import type { EmailConfirmation } from '@/modules/auth/emailConfirmation'

defineProps<{ emailConfirmation?: EmailConfirmation | null }>()

const dismissed = ref(false)
</script>

<template>
  <div
    v-if="emailConfirmation && !dismissed"
    class="confirmation"
    :class="`confirmation--${emailConfirmation.status}`"
  >
    <p :role="emailConfirmation.status === 'error' ? 'alert' : 'status'">
      {{ emailConfirmation.message }}
    </p>
    <button type="button" class="confirmation__dismiss" @click="dismissed = true">Dismiss</button>
  </div>
  <RouterView />
</template>

<style scoped>
.confirmation {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 8px clamp(20px, 5vw, 80px);
  background-color: var(--accent__muted);
  color: var(--color__primary);
  font-size: 14px;
  line-height: 1.4;
}

.confirmation--error {
  background-color: var(--danger);
  color: var(--color__danger);
}

.confirmation--pending,
.confirmation--info {
  background-color: var(--bg__skeleton);
}

.confirmation__dismiss {
  flex-shrink: 0;
  min-height: 44px;
  padding-inline: 6px;
  font-weight: var(--font__normal);
  text-decoration: underline;
}

.confirmation__dismiss:focus-visible {
  outline: 2px solid currentColor;
  outline-offset: 2px;
}
</style>
