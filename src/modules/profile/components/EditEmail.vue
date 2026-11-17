<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { Button, Input } from '@/shared'
import { supabase } from '@/lib/supabase'
import { rememberRequestedEmail } from '@/modules/auth/emailConfirmation'
import { getErrorMessage } from '../getErrorMessage'

const { userId, initialEmail, initialPendingEmail } = defineProps<{
  userId: string
  initialEmail: string
  initialPendingEmail: string
}>()

const router = useRouter()
const email = ref(initialEmail)
const currentEmail = ref(initialEmail)
const pendingEmail = ref(initialPendingEmail)
const isSaving = ref(false)
const error = ref('')
const message = ref('')

onMounted(() => window.addEventListener('focus', refreshEmail))
onBeforeUnmount(() => window.removeEventListener('focus', refreshEmail))

async function refreshEmail() {
  if (isSaving.value) return

  const previousEmail = currentEmail.value
  const previousPendingEmail = pendingEmail.value

  try {
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()
    if (
      authError ||
      !user?.email ||
      user.id !== userId ||
      isSaving.value ||
      currentEmail.value !== previousEmail ||
      pendingEmail.value !== previousPendingEmail
    ) {
      return
    }

    currentEmail.value = user.email
    pendingEmail.value = user.new_email ?? ''
    if (email.value === previousEmail) email.value = user.email

    if (previousPendingEmail.toLowerCase() === user.email.toLowerCase() && !user.new_email) {
      rememberRequestedEmail(user.id, '')
      error.value = ''
      message.value = 'Email updated.'
    }
  } catch {
    // Keep the existing values when a background refresh fails.
  }
}

async function updateEmail() {
  if (isSaving.value) return

  isSaving.value = true
  error.value = ''
  message.value = ''

  try {
    const nextEmail = email.value.trim()
    if (nextEmail.toLowerCase() === currentEmail.value.toLowerCase()) {
      throw new Error('Enter a different email address.')
    }

    const editPath = router.resolve({ name: 'profile-edit' }).href
    const { data, error: authError } = await supabase.auth.updateUser(
      { email: nextEmail },
      { emailRedirectTo: new URL(editPath, window.location.origin).href },
    )

    if (authError) throw authError

    currentEmail.value = data.user.email ?? currentEmail.value
    email.value = currentEmail.value
    pendingEmail.value =
      currentEmail.value.toLowerCase() === nextEmail.toLowerCase() ? '' : nextEmail
    rememberRequestedEmail(userId, pendingEmail.value)
    message.value = pendingEmail.value
      ? 'Follow the confirmation links sent to your inboxes.'
      : 'Email updated.'
  } catch (cause) {
    error.value = getErrorMessage(cause, 'Could not save your changes.')
  } finally {
    isSaving.value = false
  }
}
</script>

<template>
  <form class="section" :aria-busy="isSaving" @submit.prevent="updateEmail">
    <h2><span>03</span> EMAIL ADDRESS</h2>
    <Input
      v-model="email"
      label="EMAIL ADDRESS"
      type="email"
      autocomplete="email"
      :disabled="isSaving"
      required
    />
    <p v-if="pendingEmail" class="hint">Confirmation pending for {{ pendingEmail }}.</p>
    <p v-else class="hint">Your email may need to be confirmed before it changes.</p>
    <p v-if="error" class="error" role="alert">{{ error }}</p>
    <p v-if="message" class="message" role="status">{{ message }}</p>
    <Button class="action" type="submit" :disabled="isSaving">
      {{ isSaving ? 'SAVING…' : 'UPDATE EMAIL' }}
    </Button>
  </form>
</template>
