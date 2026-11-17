<script setup lang="ts">
import type { VNodeChild } from 'vue'

type ButtonVariant = 'primary' | 'outline' | 'secondary' | 'danger' | 'muted'

const { variant = 'primary', type = 'button' } = defineProps<{
  variant?: ButtonVariant
  type?: 'button' | 'submit' | 'reset'
}>()

defineSlots<{
  default?(): VNodeChild
  'left-icon'?(): VNodeChild
  'right-icon'?(): VNodeChild
}>()
</script>

<template>
  <button :type="type" class="button" :class="`button--${variant}`">
    <span v-if="$slots['left-icon']" class="button__icon" aria-hidden="true">
      <slot name="left-icon" />
    </span>

    <slot />

    <span v-if="$slots['right-icon']" class="button__icon" aria-hidden="true">
      <slot name="right-icon" />
    </span>
  </button>
</template>

<style scoped>
.button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  min-height: 44px;
  padding: 0.75rem 1.25rem;
  border: 1px solid transparent;
  font-weight: var(--font__normal);
  color: var(--color__primary);
  cursor: pointer;
  font-size: 12px;
}

.button__icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  width: 1.25rem;
  height: 1.25rem;
}

.button__icon :slotted(svg),
.button__icon :slotted(img) {
  width: 100%;
  height: 100%;
}

.button--primary {
  background-color: var(--accent);
}

.button--outline {
  border-color: var(--bg__secondary);
  background-color: var(--color__secondary);
}

.button--secondary {
  color: var(--color__secondary);
  background-color: var(--bg__secondary);
}

.button--danger {
  border-color: var(--color__danger);
  color: var(--color__danger);
  background-color: var(--danger);
}

.button--muted {
  background-color: var(--accent__muted);
}

.button:focus-visible {
  outline: 2px solid var(--bg__secondary);
  outline-offset: 3px;
}

.button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
</style>
