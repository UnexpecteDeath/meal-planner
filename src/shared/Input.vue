<script setup lang="ts">
import { computed, ref, useId } from 'vue'
import type { VNodeChild } from 'vue'
import { Eye, EyeOff } from '@lucide/vue'

defineOptions({ inheritAttrs: false })

type Props = {
  id?: string
  type?: 'text' | 'email' | 'password'
  placeholder?: string
  label?: string
  error?: string
  disabled?: boolean
}

const { id, type = 'text', placeholder, label, error, disabled = false } = defineProps<Props>()

const model = defineModel<string>()
const generatedId = useId()
const inputId = computed(() => id ?? generatedId)
const isPasswordVisible = ref(false)
const inputType = computed(() => (type === 'password' && isPasswordVisible.value ? 'text' : type))

function togglePassword() {
  isPasswordVisible.value = !isPasswordVisible.value
}

defineSlots<{
  icon?(): VNodeChild
}>()
</script>

<template>
  <div class="field" :class="{ 'field--error': error, 'field--disabled': disabled }">
    <label v-if="label" :for="inputId" class="field__label">
      {{ label }}
    </label>

    <div class="field__control">
      <input
        v-bind="$attrs"
        :id="inputId"
        v-model="model"
        :type="inputType"
        :placeholder="placeholder"
        :disabled="disabled"
        :aria-invalid="error ? true : undefined"
        :aria-describedby="error ? `${inputId}-error` : undefined"
        class="field__input"
      />

      <button
        v-if="type === 'password'"
        type="button"
        class="field__toggle"
        :disabled="disabled"
        :aria-label="isPasswordVisible ? 'Скрыть пароль' : 'Показать пароль'"
        :aria-pressed="isPasswordVisible"
        :aria-controls="inputId"
        @click="togglePassword"
      >
        <EyeOff v-if="isPasswordVisible" aria-hidden="true" />
        <Eye v-else aria-hidden="true" />
      </button>

      <span v-else-if="$slots.icon" class="field__icon" aria-hidden="true">
        <slot name="icon" />
      </span>
    </div>

    <p v-if="error" :id="`${inputId}-error`" class="field__error" role="alert">
      {{ error }}
    </p>
  </div>
</template>

<style scoped>
.field {
  display: flex;
  flex-direction: column;
  gap: 8px;
  min-width: 0;
}

.field__label {
  font-size: 10px;
  font-weight: var(--font__bold);
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: var(--color__muted);
}

.field__control {
  display: flex;
  align-items: center;
  gap: 1rem;
  box-sizing: border-box;
  max-height: 54px;
  padding: 18px 16px;
  border: 1px solid var(--bg__skeleton);
  background-color: var(--color__secondary);
}

.field--error .field__control {
  border-color: var(--color__danger);
}

.field__input {
  flex: 1;
  min-width: 0;
  width: 100%;
  padding: 0;
  border: 0;
  outline: none;
  font-size: 14px;
  font-weight: 400;
  color: var(--color__primary);
  background: transparent;
}

.field__input::placeholder {
  opacity: 1;
  color: var(--color__muted);
}

.field__icon,
.field__toggle {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  color: var(--color__muted);
}

.field__toggle {
  width: 18px;
  height: 18px;
  padding: 0;
  border: 0;
  background: transparent;
  cursor: pointer;
}

.field__toggle:disabled {
  cursor: not-allowed;
}

.field__toggle svg,
.field__icon :slotted(svg) {
  width: 18px;
  height: 18px;
}

.field__error {
  margin: 0;
  font-size: 11px;
  color: var(--color__danger);
}

.field--disabled {
  opacity: 0.5;
}

@media (max-width: 767px) {
  .field__control {
    min-height: 54px;
    max-height: none;
    padding-block: 0;
  }

  .field__input {
    font-size: 16px;
  }

  .field__toggle {
    width: 44px;
    height: 44px;
    margin-right: -13px;
  }
}
</style>
