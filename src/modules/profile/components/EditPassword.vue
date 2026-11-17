<script setup lang="ts">
import { ref } from 'vue'
import { Button, Input } from '@/shared'
import { supabase } from '@/lib/supabase'
import { getErrorMessage } from '../getErrorMessage'

const currentPassword = ref('')
const password = ref('')
const confirmPassword = ref('')
const needsCode = ref(false)
const code = ref('')
const isSaving = ref(false)
const error = ref('')
const message = ref('')

async function submit(save: () => Promise<string>) {
  if (isSaving.value) return

  isSaving.value = true
  error.value = ''
  message.value = ''

  try {
    message.value = await save()
  } catch (cause) {
    error.value = getErrorMessage(cause, 'Could not save your changes.')
  } finally {
    isSaving.value = false
  }
}

function requestPasswordCode() {
  return submit(async () => {
    const { error } = await supabase.auth.reauthenticate()
    if (error) throw error

    return 'Verification code sent. Check your inbox.'
  })
}

function updatePassword() {
  return submit(async () => {
    if (password.value !== confirmPassword.value) throw new Error('Passwords do not match.')

    const { error } = await supabase.auth.updateUser({
      current_password: currentPassword.value,
      password: password.value,
      ...(needsCode.value ? { nonce: code.value.trim() } : {}),
    })

    if (error?.code === 'reauthentication_needed' || error?.code === 'reauth_nonce_missing') {
      needsCode.value = true
      return 'Request a verification code to continue.'
    }

    if (error) throw error

    currentPassword.value = ''
    password.value = ''
    confirmPassword.value = ''
    code.value = ''
    needsCode.value = false
    return 'Password updated.'
  })
}
</script>

<template>
  <form class="section" :aria-busy="isSaving" @submit.prevent="updatePassword">
    <h2><span>04</span> PASSWORD</h2>
    <Input
      v-model="currentPassword"
      label="CURRENT PASSWORD"
      type="password"
      autocomplete="current-password"
      :disabled="isSaving"
      required
    />
    <Input
      v-model="password"
      label="NEW PASSWORD"
      type="password"
      autocomplete="new-password"
      :disabled="isSaving"
      required
    />
    <Input
      v-model="confirmPassword"
      label="CONFIRM NEW PASSWORD"
      type="password"
      autocomplete="new-password"
      :disabled="isSaving"
      required
    />
    <template v-if="needsCode">
      <Button class="action" variant="outline" :disabled="isSaving" @click="requestPasswordCode">
        SEND VERIFICATION CODE
      </Button>
      <Input
        v-model="code"
        label="VERIFICATION CODE"
        autocomplete="one-time-code"
        inputmode="numeric"
        :disabled="isSaving"
        required
      />
    </template>
    <p v-if="error" class="error" role="alert">{{ error }}</p>
    <p v-if="message" class="message" role="status">{{ message }}</p>
    <Button class="action" type="submit" :disabled="isSaving">
      {{ isSaving ? 'PLEASE WAIT…' : 'UPDATE PASSWORD' }}
    </Button>
  </form>
</template>
