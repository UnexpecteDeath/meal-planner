<script lang="ts" setup>
import { ref } from 'vue'
import { Button, Input } from '@/shared'
import { saveDisplayName } from '../api'
import { getErrorMessage } from '../getErrorMessage'

const { userId, initialName } = defineProps<{ userId: string; initialName: string }>()
const emit = defineEmits<{ saved: [] }>()

const name = ref(initialName)
const isSaving = ref(false)
const error = ref('')
const message = ref('')

async function updateName() {
  if (isSaving.value) return

  isSaving.value = true
  error.value = ''
  message.value = ''

  try {
    const nextName = name.value.trim()
    if (!nextName) throw new Error('Enter your display name.')

    await saveDisplayName(userId, nextName)
    name.value = nextName
    message.value = 'Name saved.'
    emit('saved')
  } catch (cause) {
    error.value = getErrorMessage(cause, 'Could not save your changes.')
  } finally {
    isSaving.value = false
  }
}
</script>

<template>
  <form class="section" :aria-busy="isSaving" @submit.prevent="updateName">
    <h2><span>01</span> DISPLAY NAME</h2>
    <Input v-model="name" label="FULL NAME" autocomplete="name" :disabled="isSaving" required />
    <p v-if="error" class="error" role="alert">{{ error }}</p>
    <p v-if="message" class="message" role="status">{{ message }}</p>
    <Button class="action" type="submit" :disabled="isSaving">
      {{ isSaving ? 'SAVING…' : 'SAVE NAME' }}
    </Button>
  </form>
</template>
